const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:cUbtvZvFeLnkAoHGQJhHqDytWxiGhHNg@kodama.proxy.rlwy.net:46032/railway' });
client.connect().then(async () => {
  const recent = await client.query(`
    SELECT wm.id, wm.content, wm.direction, wm.timestamp, wm.is_automated,
           c.name, c.phone_whatsapp
    FROM whatsapp_messages wm
    JOIN whatsapp_conversations wc ON wm."conversationId" = wc.id
    JOIN customers c ON wc."customerId" = c.id
    ORDER BY wm.timestamp DESC
    LIMIT 20
  `);
  for (const r of recent.rows) {
    console.log(`${r.timestamp} | ${r.direction.padEnd(8)} | ${(r.name || '?').padEnd(30)} | ${r.phone_whatsapp.padEnd(18)} | auto=${r.is_automated} | ${r.content.substring(0, 60)}`);
  }
  await client.end();
}).catch(e => { console.error(e); process.exit(1); });
