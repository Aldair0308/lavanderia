const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const http = require('http');
const axios = require('axios');
const path = require('path');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const { randomBytes } = require('crypto');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3100/api/whatsapp/webhook';
const PORT = parseInt(process.env.OPENWA_PORT || '8081', 10);
const API_KEY = process.env.OPENWA_API_KEY || 'dev-key-change-me';
const SESSION_DIR = process.env.SESSION_DIR || path.join(__dirname, 'session-data');

let sock = null;
let server = null;
let qrDisplayed = false;
let currentQR = null;
let sessionId = randomBytes(4).toString('hex');

async function generateQRHtml(qrData) {
  let qrDataUrl;
  try {
    qrDataUrl = await QRCode.toDataURL(qrData, { width: 280, margin: 1 });
  } catch {
    qrDataUrl = '';
  }
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LavanderiaOS - WhatsApp QR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 420px; width: 90%; }
    h1 { font-size: 22px; color: #1a1a1a; margin-bottom: 8px; }
    p { color: #666; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .qr-container { background: white; padding: 16px; border-radius: 12px; display: inline-block; border: 2px solid #e0e0e0; }
    .qr-container img { display: block; width: 280px; height: 280px; image-rendering: pixelated; }
    .steps { text-align: left; margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; font-size: 13px; color: #333; }
    .steps ol { padding-left: 20px; }
    .steps li { margin-bottom: 6px; }
    .status { margin-top: 16px; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .status.waiting { background: #fff3cd; color: #856404; }
    .status.connected { background: #d4edda; color: #155724; }
    .refresh { margin-top: 16px; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Conectar WhatsApp</h1>
    <p>Escanea el c&oacute;digo QR con tu tel&eacute;fono para vincular el n&uacute;mero de la lavander&iacute;a</p>
    <div class="qr-container">
      <img src="${qrDataUrl}" alt="QR Code">
    </div>
    <div class="steps">
      <strong>Pasos:</strong>
      <ol>
        <li>Abre WhatsApp en tu tel&eacute;fono</li>
        <li>Ve a <strong>Men&uacute; &gt; Dispositivos vinculados</strong></li>
        <li>Toca <strong>Vincular un dispositivo</strong></li>
        <li>Escanea este c&oacute;digo QR</li>
      </ol>
    </div>
    <div class="status waiting">⏳ Esperando escaneo...</div>
    <div class="refresh">Esta p&aacute;gina se actualiza autom&aacute;ticamente cada 10s</div>
    <script>
      setTimeout(() => location.reload(), 10000);
    </script>
  </div>
</body>
</html>`;
}

async function start() {
  console.log(`[Baileys] Starting WhatsApp bot... session=${sessionId}`);
  console.log(`[Baileys] Webhook URL: ${WEBHOOK_URL}`);
  console.log(`[Baileys] Session dir: ${SESSION_DIR}`);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  console.log(`[Baileys] Using WA version: ${version.join('.')}`);

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Lavanderia'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLink: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      currentQR = qr;
      qrDisplayed = true;
      console.log('\n[Baileys] SCAN THIS QR CODE with your phone:');
      console.log('📱 WhatsApp > Linked Devices > Link a Device\n');
      qrcodeTerminal.generate(qr, { small: false });
      console.log('');
    }
    if (connection === 'open') {
      console.log(`\n✅ [Baileys] CONNECTED as ${sock.user?.id}!`);
      qrDisplayed = false;
      currentQR = null;
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`[Baileys] Disconnected (${statusCode}). Restarting in 3s...`);
      setTimeout(() => { start(); }, 3000);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!from || !body) return;
    const phone = from.replace('@s.whatsapp.net', '').replace('@c.us', '').replace(/\D/g, '');
    console.log(`[Baileys] MSG from ${phone}: ${body.substring(0, 60)}`);
    try {
      await axios.post(WEBHOOK_URL, { from: phone, body, fromMe: false }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        timeout: 60000,
      });
    } catch (err) {
      console.error('[Baileys] Webhook err:', err.message);
    }
  });

  if (!server) {
    server = http.createServer(async (req, res) => {
      const url = req.url;
      const method = req.method;

      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

      // POST /sendMessage or /api/sendMessage
      if (method === 'POST' && (url === '/sendMessage' || url === '/api/sendMessage')) {
        let data = '';
        req.on('data', (c) => data += c);
        req.on('end', async () => {
          try {
            if (req.headers['authorization'] !== `Bearer ${API_KEY}`) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
            const { chatId, text } = JSON.parse(data);
            if (!chatId || !text) { res.writeHead(400); res.end(JSON.stringify({ error: 'chatId and text required' })); return; }
            if (!sock?.user) { res.writeHead(503); res.end(JSON.stringify({ error: 'Not connected' })); return; }
            const jid = chatId.includes('@') ? chatId : `${chatId}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text });
            res.writeHead(200); res.end(JSON.stringify({ success: true }));
          } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
        });

      // GET /health or /api/health
      } else if (method === 'GET' && (url === '/health' || url === '/api/health')) {
        res.writeHead(200); res.end(JSON.stringify({ connected: !!sock?.user, status: sock?.user ? 'connected' : 'waiting_qr' }));

      // GET /qr or /api/qr
      } else if (method === 'GET' && (url === '/qr' || url === '/api/qr')) {
        if (currentQR) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(await generateQRHtml(currentQR));
        } else if (sock?.user) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WhatsApp Conectado</title><style>body{font-family:system-ui,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}.card{background:white;border-radius:16px;padding:40px;text-align:center;max-width:420px}h1{font-size:22px;color:#1a1a1a}.status{display:inline-block;padding:8px 20px;border-radius:20px;background:#d4edda;color:#155724;font-weight:500;margin-top:16px}</style></head><body><div class="card"><h1>✅ WhatsApp Conectado</h1><p>El n&uacute;mero de la lavander&iacute;a ya est&aacute; vinculado.</p><div class="status">Conectado como ${sock.user?.id || ''}</div></div></body></html>`);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin QR</title><style>body{font-family:system-ui,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}.card{background:white;border-radius:16px;padding:40px;text-align:center;max-width:420px}h1{font-size:22px;color:#1a1a1a}.status{display:inline-block;padding:8px 20px;border-radius:20px;background:#fff3cd;color:#856404;font-weight:500;margin-top:16px}.refresh{margin-top:16px;font-size:13px;color:#888}</style></head><body><div class="card"><h1>⏳ Generando QR...</h1><p>El c&oacute;digo QR aparecer&aacute; autom&aacute;ticamente cuando est&eacute; listo. Refresca la p&aacute;gina en unos segundos.</p><div class="status">Esperando...</div><div class="refresh">Refrescando autom&aacute;ticamente cada 10s</div><script>setTimeout(()=>location.reload(),10000)</script></div></body></html>`);
        }

      // GET /session-status or /api/session-status
      } else if (method === 'GET' && (url === '/session-status' || url === '/api/session-status')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          connected: !!sock?.user,
          status: sock?.user ? 'connected' : 'waiting_qr',
          user: sock?.user ? sock.user.id : null,
          has_qr: !!currentQR,
          session_id: sessionId,
        }));

      } else {
        res.writeHead(404); res.end('Not found');
      }
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log('[Baileys] Port in use, closing old server...');
        server.close(() => { server = null; });
      }
    });

    server.listen(PORT, () => console.log(`[Baileys] API on http://localhost:${PORT}`));
  }
}

start().catch((err) => {
  console.error('[Baileys] Fatal:', err);
});
