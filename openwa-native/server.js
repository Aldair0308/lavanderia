const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const http = require('http');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3100/api/whatsapp/webhook';
const PORT = parseInt(process.env.OPENWA_PORT || '8081', 10);
const API_KEY = process.env.OPENWA_API_KEY || 'dev-key-change-me';
const SESSION_DIR = path.join(__dirname, 'session-data');

let sock = null;
let server = null;
let qrDisplayed = false;

async function start() {
  console.log('[Baileys] Starting WhatsApp bot...');
  console.log(`[Baileys] Webhook URL: ${WEBHOOK_URL}`);

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
    if (qr && !qrDisplayed) {
      qrDisplayed = true;
      console.log('\n[Baileys] SCAN THIS QR CODE with your phone:');
      console.log('📱 WhatsApp > Linked Devices > Link a Device\n');
      qrcode.generate(qr, { small: false });
      console.log('');
    }
    if (connection === 'open') {
      console.log(`\n✅ [Baileys] CONNECTED as ${sock.user?.id}!`);
      qrDisplayed = false;
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`[Baileys] Disconnected (${statusCode}). Restarting...`);
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
      if (req.method === 'POST' && req.url === '/sendMessage') {
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
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200); res.end(JSON.stringify({ connected: !!sock?.user, status: sock?.user ? 'connected' : 'waiting_qr' }));
      } else { res.writeHead(404); res.end('Not found'); }
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
