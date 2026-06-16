// SDF Clothing AI — WhatsApp Business Bot
// Converted from Cloudflare Worker to Vercel Node.js
// Built for SDF Clothing | sdfltd.com

const BOT_NAME = "SDF Clothing AI";
const CONTACT_EMAIL = "contact@sdfltd.com";
const ACCOUNT_EMAIL = "account@sdfltd.com";
const COMPLAINT_EMAIL = "cm@sdfltd.com";
const HR_EMAIL = "hr@sdfltd.com";
const LEGAL_EMAIL = "gm@sdfltd.com";
const SUPPLIER_EMAIL = "sdfltdit@gmail.com";
const HUMAN_WA = "+8801911733226";
const WEBSITE = "sdfltd.com";

const { neon } = require("@neondatabase/serverless");

// ─────────────────────────────────────────────
// DATABASE HELPER
// ─────────────────────────────────────────────
function getDB() {
  return neon(process.env.DATABASE_URL);
}

async function initDB() {
  const sql = getDB();
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      phone TEXT,
      country TEXT,
      message TEXT,
      message_type TEXT,
      reply TEXT,
      language TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// ─────────────────────────────────────────────
// ADMIN HTML
// ─────────────────────────────────────────────
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>SDF Clothing — WhatsApp Admin</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; }
  #login-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 16px; }
  #login-screen h1 { font-size: 22px; color: #25d366; font-weight: 700; }
  #login-screen p { color: #94a3b8; font-size: 14px; }
  #login-box { background: #1e2433; border: 1px solid #2d3748; border-radius: 12px; padding: 32px; width: 320px; display: flex; flex-direction: column; gap: 12px; }
  #login-box input { background: #0f1117; border: 1px solid #2d3748; color: #e2e8f0; padding: 10px 14px; border-radius: 8px; font-size: 15px; outline: none; }
  #login-box input:focus { border-color: #25d366; }
  #login-btn { background: #25d366; color: #000; border: none; padding: 11px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  #login-btn:hover { background: #1ebe57; }
  #login-error { color: #fc8181; font-size: 13px; text-align: center; display: none; }
  #app { display: none; flex-direction: column; height: 100vh; }
  header { background: #1e2433; border-bottom: 1px solid #2d3748; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
  header h1 { font-size: 18px; font-weight: 700; color: #25d366; }
  header span { font-size: 13px; color: #94a3b8; }
  #logout-btn { background: #2d3748; color: #e2e8f0; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .stats-bar { display: flex; gap: 12px; padding: 14px 24px; background: #161b27; border-bottom: 1px solid #2d3748; }
  .stat { background: #1e2433; border: 1px solid #2d3748; border-radius: 8px; padding: 10px 16px; text-align: center; }
  .stat-num { font-size: 22px; font-weight: 700; color: #25d366; }
  .stat-label { font-size: 11px; color: #64748b; margin-top: 2px; }
  .toolbar { padding: 12px 24px; display: flex; gap: 10px; align-items: center; background: #0f1117; border-bottom: 1px solid #1e2433; }
  .toolbar input { background: #1e2433; border: 1px solid #2d3748; color: #e2e8f0; padding: 8px 14px; border-radius: 8px; font-size: 14px; width: 260px; outline: none; }
  .toolbar input:focus { border-color: #25d366; }
  .filter-btn { background: #1e2433; border: 1px solid #2d3748; color: #94a3b8; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; }
  .filter-btn.active { background: #25d36622; border-color: #25d366; color: #25d366; }
  #refresh-btn { background: #25d36622; border: 1px solid #25d366; color: #25d366; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-left: auto; }
  #messages-container { flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
  .msg-card { background: #1e2433; border: 1px solid #2d3748; border-radius: 12px; padding: 16px; transition: border-color 0.2s; }
  .msg-card:hover { border-color: #4a5568; }
  .msg-card.unread { border-left: 3px solid #25d366; }
  .msg-card.bd { border-left: 3px solid #f6ad55; }
  .msg-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .avatar { width: 38px; height: 38px; border-radius: 50%; background: #25d36633; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #25d366; flex-shrink: 0; }
  .msg-meta { flex: 1; }
  .msg-phone { font-size: 15px; font-weight: 600; color: #e2e8f0; }
  .msg-time { font-size: 12px; color: #64748b; margin-top: 1px; }
  .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
  .badge-bd { background: #f6ad5522; color: #f6ad55; }
  .badge-en { background: #63b3ed22; color: #63b3ed; }
  .badge-type { background: #9f7aea22; color: #9f7aea; }
  .msg-bubble { background: #0f1117; border-radius: 8px; padding: 10px 14px; font-size: 14px; line-height: 1.6; color: #cbd5e0; margin-bottom: 10px; border: 1px solid #2d3748; }
  .msg-bubble.incoming::before { content: "📩 "; }
  .bot-reply { background: #25d36611; border: 1px solid #25d36633; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #a7f3d0; line-height: 1.6; margin-bottom: 10px; }
  .bot-reply::before { content: "🤖 Bot: "; font-weight: 600; color: #25d366; }
  .reply-section { display: flex; gap: 8px; margin-top: 4px; }
  .reply-input { flex: 1; background: #0f1117; border: 1px solid #2d3748; color: #e2e8f0; padding: 9px 14px; border-radius: 8px; font-size: 14px; outline: none; resize: none; height: 40px; font-family: inherit; }
  .reply-input:focus { border-color: #25d366; height: 80px; }
  .send-btn { background: #25d366; color: #000; border: none; padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; align-self: flex-end; }
  .send-btn:hover { background: #1ebe57; }
  .send-btn:disabled { background: #2d3748; color: #64748b; cursor: not-allowed; }
  .sent-tag { color: #25d366; font-size: 12px; margin-top: 4px; }
  #loading { text-align: center; padding: 60px; color: #64748b; }
  #empty { text-align: center; padding: 60px; color: #64748b; }
  #empty span { font-size: 48px; display: block; margin-bottom: 12px; }
</style>
</head>
<body>
<div id="login-screen">
  <div style="text-align:center">
    <div style="font-size:40px">💬</div>
    <h1>SDF WhatsApp Admin</h1>
    <p style="margin-top:6px">Enter your admin password to continue</p>
  </div>
  <div id="login-box">
    <input type="password" id="token-input" placeholder="Admin password" autocomplete="off"/>
    <button id="login-btn" onclick="doLogin()">Sign In</button>
    <div id="login-error">Wrong password. Try again.</div>
  </div>
</div>
<div id="app">
  <header>
    <div><h1>💬 SDF WhatsApp Admin</h1></div>
    <div style="display:flex;align-items:center;gap:12px">
      <span id="last-refresh"></span>
      <button id="logout-btn" onclick="doLogout()">Logout</button>
    </div>
  </header>
  <div class="stats-bar">
    <div class="stat"><div class="stat-num" id="stat-total">—</div><div class="stat-label">Total Messages</div></div>
    <div class="stat"><div class="stat-num" id="stat-unread" style="color:#f6ad55">—</div><div class="stat-label">No Bot Reply</div></div>
    <div class="stat"><div class="stat-num" id="stat-bd" style="color:#f6ad55">—</div><div class="stat-label">Bangladesh</div></div>
    <div class="stat"><div class="stat-num" id="stat-intl" style="color:#63b3ed">—</div><div class="stat-label">International</div></div>
  </div>
  <div class="toolbar">
    <input type="text" id="search-input" placeholder="Search by phone or message..." oninput="filterMessages()"/>
    <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
    <button class="filter-btn" onclick="setFilter('bd', this)">🇧🇩 BD</button>
    <button class="filter-btn" onclick="setFilter('intl', this)">🌍 Intl</button>
    <button class="filter-btn" onclick="setFilter('norep', this)">No Reply</button>
    <button id="refresh-btn" onclick="loadMessages()">↻ Refresh</button>
  </div>
  <div id="messages-container">
    <div id="loading">Loading messages...</div>
  </div>
</div>
<script>
let ADMIN_TOKEN = '';
let allMessages = [];
let currentFilter = 'all';

function doLogin() {
  const t = document.getElementById('token-input').value.trim();
  if (!t) return;
  ADMIN_TOKEN = t;
  loadMessages().then(ok => {
    if (ok) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
    } else {
      document.getElementById('login-error').style.display = 'block';
      ADMIN_TOKEN = '';
    }
  });
}

document.getElementById('token-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

function doLogout() {
  ADMIN_TOKEN = '';
  allMessages = [];
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('token-input').value = '';
}

async function loadMessages() {
  try {
    const res = await fetch('/api/webhook?action=messages&token=' + encodeURIComponent(ADMIN_TOKEN));
    if (res.status === 401) return false;
    const data = await res.json();
    allMessages = data;
    updateStats();
    renderMessages();
    document.getElementById('last-refresh').textContent = 'Updated ' + new Date().toLocaleTimeString();
    return true;
  } catch(e) { return false; }
}

function updateStats() {
  const bd = allMessages.filter(m => m.country === 'BD').length;
  const norep = allMessages.filter(m => !m.reply).length;
  document.getElementById('stat-total').textContent = allMessages.length;
  document.getElementById('stat-unread').textContent = norep;
  document.getElementById('stat-bd').textContent = bd;
  document.getElementById('stat-intl').textContent = allMessages.length - bd;
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderMessages();
}

function filterMessages() { renderMessages(); }

function getFiltered() {
  const q = document.getElementById('search-input').value.toLowerCase();
  return allMessages.filter(m => {
    if (currentFilter === 'bd' && m.country !== 'BD') return false;
    if (currentFilter === 'intl' && m.country === 'BD') return false;
    if (currentFilter === 'norep' && m.reply) return false;
    if (q && !m.phone?.toLowerCase().includes(q) && !m.message?.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderMessages() {
  const container = document.getElementById('messages-container');
  const msgs = getFiltered();
  if (msgs.length === 0) {
    container.innerHTML = '<div id="empty"><span>📭</span>No messages found</div>';
    return;
  }
  container.innerHTML = msgs.map(m => {
    const isBD = m.country === 'BD';
    const initials = (m.phone || '?').slice(-2);
    const time = m.created_at ? new Date(m.created_at).toLocaleString() : '—';
    const hasReply = !!m.reply;
    return \`<div class="msg-card \${isBD ? 'bd' : ''} \${!hasReply ? 'unread' : ''}" id="card-\${m.id}">
      <div class="msg-header">
        <div class="avatar">\${initials}</div>
        <div class="msg-meta">
          <div class="msg-phone">+\${m.phone}</div>
          <div class="msg-time">\${time}</div>
        </div>
        <span class="badge \${isBD ? 'badge-bd' : 'badge-en'}">\${isBD ? '🇧🇩 BD' : '🌍 Intl'}</span>
        \${m.message_type && m.message_type !== 'text' ? \`<span class="badge badge-type">\${m.message_type}</span>\` : ''}
      </div>
      \${m.message ? \`<div class="msg-bubble incoming">\${escHtml(m.message)}</div>\` : '<div class="msg-bubble" style="color:#64748b;font-style:italic">[ Non-text message ]</div>'}
      \${m.reply ? \`<div class="bot-reply">\${escHtml(m.reply)}</div>\` : '<div style="color:#64748b;font-size:12px;font-style:italic;margin-bottom:10px">No automatic reply was sent.</div>'}
      <div class="reply-section">
        <textarea class="reply-input" id="reply-\${m.id}" placeholder="Type your manual reply..."></textarea>
        <button class="send-btn" id="btn-\${m.id}" onclick="sendReply(\${m.id}, '\${escAttr(m.phone)}')">Send ↗</button>
      </div>
      <div id="sent-\${m.id}"></div>
    </div>\`;
  }).join('');
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  return String(s||'').replace(/'/g,"\\\\'");
}

async function sendReply(id, phone) {
  const input = document.getElementById('reply-' + id);
  const btn = document.getElementById('btn-' + id);
  const sentDiv = document.getElementById('sent-' + id);
  const msg = input.value.trim();
  if (!msg) return;
  btn.disabled = true;
  btn.textContent = 'Sending...';
  try {
    const res = await fetch('/api/webhook?action=reply&token=' + encodeURIComponent(ADMIN_TOKEN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message: msg, id })
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      sentDiv.innerHTML = '<div class="sent-tag">✅ Sent at ' + new Date().toLocaleTimeString() + '</div>';
      btn.textContent = '✓ Sent';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Send ↗'; }, 3000);
    } else {
      sentDiv.innerHTML = '<div style="color:#fc8181;font-size:12px">❌ Failed: ' + (data.error||'Unknown') + '</div>';
      btn.disabled = false; btn.textContent = 'Send ↗';
    }
  } catch(e) {
    sentDiv.innerHTML = '<div style="color:#fc8181;font-size:12px">❌ Network error</div>';
    btn.disabled = false; btn.textContent = 'Send ↗';
  }
}

setInterval(() => { if (ADMIN_TOKEN) loadMessages(); }, 30000);
</script>
</body>
</html>`;

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const { url, method } = req;
  const urlObj = new URL(url, `https://${req.headers.host}`);
  const action = urlObj.searchParams.get("action");

  // ✅ WhatsApp webhook verification — MUST BE FIRST
  if (method === "GET" && urlObj.searchParams.get("hub.mode") === "subscribe") {
    const token = urlObj.searchParams.get("hub.verify_token");
    const challenge = urlObj.searchParams.get("hub.challenge");
    if (token === process.env.VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // Serve admin panel
  if (!action && method === "GET") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(ADMIN_HTML);
  }

  // Admin: get messages
  if (action === "messages" && method === "GET") {
    const token = urlObj.searchParams.get("token");
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      await initDB();
      const sql = getDB();
      const rows = await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 200`;
      return res.status(200).json(rows);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Admin: send reply
  if (action === "reply" && method === "POST") {
    const token = urlObj.searchParams.get("token");
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { phone, message } = req.body;
      await sendWhatsAppMessage(phone, message);
      await initDB();
      const sql = getDB();
      await sql`
        INSERT INTO messages (phone, country, message, message_type, reply, language)
        VALUES (${phone}, ${"MANUAL"}, ${"[Manual Reply]"}, ${"text"}, ${message}, ${"manual"})
      `;
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // WhatsApp incoming messages
  if (method === "POST") {
    try {
      const body = req.body;
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      if (!message) return res.status(200).send("OK");

      const from = message.from;
      const msgType = message.type;
      const countryCode = from.startsWith("880") ? "BD" : from.substring(0, 3);

      await initDB();
      const sql = getDB();

      // Bangladesh numbers — log only, no reply
      if (from.startsWith("880")) {
        await sql`
          INSERT INTO messages (phone, country, message, message_type, reply, language)
          VALUES (${from}, ${countryCode}, ${message.text?.body || ""}, ${msgType}, ${null}, ${"bn"})
        `;
        return res.status(200).send("OK");
      }

      // Non-text messages
      if (msgType !== "text") {
        const lang = "en";
        const reply = getNonTextReply(lang);
        await sendWhatsAppMessage(from, reply);
        await sql`
          INSERT INTO messages (phone, country, message, message_type, reply, language)
          VALUES (${from}, ${countryCode}, ${""}, ${msgType}, ${reply}, ${lang})
        `;
        return res.status(200).send("OK");
      }

      // Text messages
      const text = message.text?.body || "";
      const lang = detectLanguage(text);
      const reply = getReply(text, lang);
      await sendWhatsAppMessage(from, reply);
      await sql`
        INSERT INTO messages (phone, country, message, message_type, reply, language)
        VALUES (${from}, ${countryCode}, ${text}, ${msgType}, ${reply}, ${lang})
      `;
    } catch (e) {
      console.error(e);
    }
    return res.status(200).send("OK");
  }

  return res.status(404).send("Not found");
};

// ─────────────────────────────────────────────
// WHATSAPP SEND MESSAGE
// ─────────────────────────────────────────────
async function sendWhatsAppMessage(to, body) {
  await fetch(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });
}

// ─────────────────────────────────────────────
// BOT LOGIC (unchanged from your original)
// ─────────────────────────────────────────────
function detectLanguage(text) {
  const t = text.toLowerCase();
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "ja";
  if (/bonjour|merci|salut|prix|livraison|commande|tissu|qualité/.test(t)) return "fr";
  if (/hola|gracias|precio|envío|calidad|tela|pedido|fábrica/.test(t)) return "es";
  if (/hallo|danke|preis|qualität|stoff|bestellung|lieferung/.test(t)) return "de";
  if (/ciao|grazie|prezzo|qualità|tessuto|ordine|spedizione/.test(t)) return "it";
  if (/olá|obrigado|preço|qualidade|tecido|pedido|envio/.test(t)) return "pt";
  if (/merhaba|teşekkür|fiyat|kalite|kumaş|sipariş|teslimat/.test(t)) return "tr";
  if (/привет|спасибо|цена|качество|ткань|заказ/.test(t)) return "ru";
  if (/สวัสดี|ราคา|คุณภาพ|ผ้า|สั่งซื้อ/.test(t)) return "th";
  if (/xin chào|cảm ơn|giá|chất lượng|vải|đơn hàng/.test(t)) return "vi";
  return "en";
}

function getLangNote(lang) {
  const notes = {
    bn: "\n\n_We prefer to communicate in English as it helps us serve you more accurately. আমরা ইংরেজিতে যোগাযোগ পছন্দ করি।_",
    ar: "\n\n_نفضل التواصل باللغة الإنجليزية لخدمتك بشكل أفضل. We prefer English for more accurate communication._",
    zh: "\n\n_我们更喜欢用英语交流，以便为您提供更准确的服务。We prefer English for better accuracy._",
    ko: "\n\n_더 정확한 서비스를 위해 영어로 소통하는 것을 선호합니다. We prefer English for better accuracy._",
    ja: "\n\n_より正確なサービスのために、英語でのコミュニケーションを推奨しています。We prefer English for better accuracy._",
    fr: "\n\n_Nous préférons communiquer en anglais pour vous servir avec plus de précision. We prefer English for better accuracy._",
    es: "\n\n_Preferimos comunicarnos en inglés para servirle con mayor precisión. We prefer English for better accuracy._",
    de: "\n\n_Wir bevorzugen die Kommunikation auf Englisch, um Ihnen genauer zu dienen. We prefer English for better accuracy._",
    it: "\n\n_Preferiamo comunicare in inglese per servirvi con maggiore precisione. We prefer English for better accuracy._",
    pt: "\n\n_Preferimos comunicar em inglês para servi-lo com mais precisão. We prefer English for better accuracy._",
    tr: "\n\n_Size daha doğru hizmet verebilmek için İngilizce iletişim kurmayı tercih ederiz. We prefer English for better accuracy._",
    ru: "\n\n_Мы предпочитаем общение на английском языке для более точного обслуживания. We prefer English for better accuracy._",
    th: "\n\n_เราต้องการสื่อสารเป็นภาษาอังกฤษเพื่อให้บริการคุณได้ถูกต้องยิ่งขึ้น We prefer English for better accuracy._",
    vi: "\n\n_Chúng tôi muốn giao tiếp bằng tiếng Anh để phục vụ bạn chính xác hơn. We prefer English for better accuracy._"
  };
  return notes[lang] || "";
}

function getNonTextReply(lang) {
  const replies = {
    en: `Thanks for reaching out to SDF Clothing! I can only handle text messages at the moment. Please type your question and I will get back to you right away.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`,
    ar: `شكراً للتواصل مع SDF Clothing! يمكنني فقط التعامل مع الرسائل النصية في الوقت الحالي.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`,
    es: `¡Gracias por contactar a SDF Clothing! Solo puedo manejar mensajes de texto por el momento.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`,
    fr: `Merci de contacter SDF Clothing! Je ne peux traiter que les messages texte pour le moment.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`
  };
  return replies[lang] || replies["en"];
}

function buildReply(lang, variants, note) {
  const text = variants[lang] || variants["en"];
  return text + note;
}

function getReply(text, lang) {
  const raw = text.trim();
  const tl = raw.toLowerCase();
  const note = getLangNote(lang);

  if (/^(ok|okay|yes|yeah|yep|sure|alright|got it|noted|fine|good|great|cool|nice|k|kk)$/i.test(raw)) {
    return buildReply(lang, {
      en: `Great! If you would like to move forward, here is what typically comes next:\n\n1️⃣ Share your design idea, sketch, or reference images\n2️⃣ Confirm quantity and sizes per style\n3️⃣ We provide a detailed quote and timeline\n4️⃣ 30% deposit to begin sampling\n\nFeel free to send your details whenever you are ready.\n\n📧 ${CONTACT_EMAIL}`,
      ar: `رائع! 1️⃣ شارك تصميمك 2️⃣ أكد الكمية 3️⃣ نقدم عرض سعر 4️⃣ 30٪ إيداع\n\n${CONTACT_EMAIL}`,
      es: `¡Genial! 1️⃣ Comparte tu diseño 2️⃣ Confirma cantidad 3️⃣ Cotización 4️⃣ 30% depósito\n\n${CONTACT_EMAIL}`,
      fr: `Parfait! 1️⃣ Partagez votre design 2️⃣ Quantité 3️⃣ Devis 4️⃣ 30% acompte\n\n${CONTACT_EMAIL}`
    }, note);
  }

  if (/\b(hi|hello|hey|hiya|howdy|greetings|good morning|good afternoon|good evening|good day|sup|what'?s up|whatsup|yo|helo|hlw|hii+|assalam|salam|salaam|مرحبا|أهلا|السلام عليكم|bonjour|hola|ciao|hallo|olá|merhaba|안녕|こんにちは|привет|สวัสดี|xin chào)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Hey, thanks for messaging SDF Clothing!\n\nWe're a garment factory in Dhaka, Bangladesh — been running our own production floor since 1998. We make custom apparel for fashion brands, and our minimum order is just 300 pieces per style.\n\nWhat are you working on? Let me know and I can point you to pricing, samples, fabric options, or anything else.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}/tools`,
      ar: `أهلاً! نحن مصنع ملابس في دكا منذ 1998. الحد الأدنى 300 قطعة.\n\nما الذي تعمل عليه؟\n\n📧 ${CONTACT_EMAIL}`,
      es: `¡Hola! Somos una fábrica en Dhaka desde 1998. MOQ 300 piezas.\n\n¿En qué estás trabajando?\n\n📧 ${CONTACT_EMAIL}`,
      fr: `Salut! Nous sommes une usine à Dhaka depuis 1998. MOQ 300 pièces.\n\nSur quoi travaillez-vous?\n\n📧 ${CONTACT_EMAIL}`,
      zh: `你好！我们是达卡的服装工厂，1998年至今。最小订购量300件。\n\n您在做什么项目？\n\n📧 ${CONTACT_EMAIL}`,
      de: `Hallo! Wir sind eine Fabrik in Dhaka seit 1998. MOQ 300 Stück.\n\nWoran arbeitest du?\n\n📧 ${CONTACT_EMAIL}`
    }, note);
  }

  if (/\b(price|pricing|cost|rate|quote|quotation|fob|how much|per piece|per unit|unit price|bulk price|devis|prix|precio|prezzo|preis|preço|fiyat|سعر)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Here's a rough idea of prices (FOB Chittagong):\n\nBasic T-Shirt (180 GSM): ~$2.50–$4.50 at 300 pcs\nOrganic T-Shirt (GOTS): $3.80–$5.80\nHoodie (300–340 GSM): $8.00–$14.00\nHeavyweight Hoodie (400+ GSM): $12.00–$18.00\nActivewear/Leggings: $5.00–$9.00\n\nFor an accurate quote: ${CONTACT_EMAIL}\n\nPrice calculator: ${WEBSITE}/tools/price-calculator`,
      ar: `أسعار تقريبية (FOB شيتاغونغ):\nتيشيرت: $2.50–$4.50 | هودي: $8.00–$14.00\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/price-calculator`,
      es: `Precios aproximados (FOB Chittagong):\nCamiseta: $2.50–$4.50 | Sudadera: $8.00–$14.00\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/price-calculator`,
      fr: `Prix approximatifs (FOB Chittagong):\nT-shirt: $2.50–$4.50 | Hoodie: $8.00–$14.00\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/price-calculator`,
      zh: `大致价格（吉大港FOB）：\nT恤: $2.50–$4.50 | 卫衣: $8.00–$14.00\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/price-calculator`
    }, note);
  }

  if (/\b(moq|minimum order|minimum quantity|min order|minimum pieces|minimum pcs|smallest order)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Our minimum is 300 pieces per style.\n\nUp to 4–5 colours and full XS–XXL size range within that 300 pieces.\n\nIf you need less than 300, tell me your materials, labels, print/embroidery details and budget — we may be able to run it as a salesman sample.\n\n📧 ${CONTACT_EMAIL}\n\nMOQ tool: ${WEBSITE}/tools/moq-calculator`,
      ar: `الحد الأدنى 300 قطعة لكل تصميم.\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/moq-calculator`,
      es: `Mínimo 300 piezas por estilo.\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/moq-calculator`,
      fr: `Minimum 300 pièces par style.\n\n${CONTACT_EMAIL}\n${WEBSITE}/tools/moq-calculator`
    }, note);
  }

  if (/\b(sample|proto|prototype|pre.production|sample cost|free sample|get a sample)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Samples are free — no charge for the sample itself.\n\nWe ask for a 30% deposit based on your intended bulk order. It's fully credited to your final invoice.\n\nFirst sample ready within 2 weeks. Up to 10 revision rounds, 7 days each.\n\n📧 ${CONTACT_EMAIL} or ${WEBSITE}/tools/sample-request`,
      ar: `العينات مجانية. 30٪ إيداع مطلوب (يُحسب من الفاتورة النهائية). أسبوعان للعينة الأولى.\n\n${CONTACT_EMAIL}`,
      es: `Muestras gratuitas. Depósito 30% (acreditado). Primera muestra en 2 semanas.\n\n${CONTACT_EMAIL}`,
      fr: `Échantillons gratuits. Acompte 30% (crédité). Premier en 2 semaines.\n\n${CONTACT_EMAIL}`
    }, note);
  }

  if (/\b(lead time|production time|how long|turnaround|timeline|delivery time|how many days|how many weeks)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Full timeline:\n\n🧵 Sample: 2 weeks\n✏️ Revisions: 7 days/round\n🏭 Bulk: 40 days from approval\n⚡ In-stock materials: as fast as 2 days\n\nUSA: ~75–90 days total | UK/EU: ~70–80 days\n\n${WEBSITE}/tools/lead-time-calculator`,
      ar: `🧵 عينة: أسبوعان | 🏭 إنتاج جماعي: 40 يوماً\n\n${WEBSITE}/tools/lead-time-calculator`,
      es: `🧵 Muestra: 2 semanas | 🏭 Producción: 40 días\n\n${WEBSITE}/tools/lead-time-calculator`,
      fr: `🧵 Échantillon: 2 semaines | 🏭 Production: 40 jours\n\n${WEBSITE}/tools/lead-time-calculator`
    }, note);
  }

  if (/\b(payment|pay|deposit|advance|lc|letter of credit|tt|wire transfer|bank transfer|how to pay|payment method)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Payment stages:\n\n1️⃣ 30% deposit — to start sampling\n2️⃣ 30% before bulk production\n3️⃣ 40% before shipment\n\nAll in USD.\n\n💵 Under $5,000: WorldRemit to bKash\nName: MU Chowdhury Remon | Number: 01711160511\nSend receipt to: ${ACCOUNT_EMAIL}\n\n🏦 Over $5,000: T/T or LC via ${CONTACT_EMAIL}`,
      ar: `1️⃣ 30٪ 2️⃣ 30٪ 3️⃣ 40٪ بالدولار\n\n💵 أقل من $5,000: WorldRemit إلى bKash | MU Chowdhury Remon | 01711160511\n📧 ${ACCOUNT_EMAIL}\n\n🏦 أكثر من $5,000: ${CONTACT_EMAIL}`,
      es: `1️⃣ 30% 2️⃣ 30% 3️⃣ 40% en USD\n\n💵 <$5,000: WorldRemit a bKash | MU Chowdhury Remon | 01711160511\n📧 ${ACCOUNT_EMAIL}\n\n🏦 >$5,000: ${CONTACT_EMAIL}`,
      fr: `1️⃣ 30% 2️⃣ 30% 3️⃣ 40% en USD\n\n💵 <5000$: WorldRemit bKash | MU Chowdhury Remon | 01711160511\n📧 ${ACCOUNT_EMAIL}\n\n🏦 >5000$: ${CONTACT_EMAIL}`
    }, note);
  }

  if (/\b(shipping|ship|delivery|freight|logistics|dispatch|cargo|dhl|fedex|sea freight|air freight|port)\b/.test(tl)) {
    return buildReply(lang, {
      en: `We ship worldwide from Chittagong Port (FOB).\n\nSea freight transit:\n🇺🇸 USA West: 18–25 days | East: 25–35 days\n🇬🇧 UK/EU: 20–28 days\n🇦🇺 Australia: 18–22 days\n\nAir freight: 3–7 days globally.\n\n${WEBSITE}/tools/shipping-estimator`,
      ar: `نشحن عالمياً من شيتاغونغ.\n🇺🇸 USA: 18–35 يوماً | 🇬🇧 UK/EU: 20–28 يوماً\n\n${WEBSITE}/tools/shipping-estimator`,
      es: `Enviamos globalmente desde Chittagong.\n🇺🇸 USA: 18–35 días | 🇬🇧 UK/EU: 20–28 días\n\n${WEBSITE}/tools/shipping-estimator`,
      fr: `Expédition mondiale depuis Chittagong.\n🇺🇸 USA: 18–35 jours | 🇬🇧 UK/EU: 20–28 jours\n\n${WEBSITE}/tools/shipping-estimator`
    }, note);
  }

  if (/\b(certif|gots|oeko|bsci|iso|sa8000|wrap|sedex|grs|organic|sustainable|sustainability|ethical|recycled)\b/.test(tl)) {
    return buildReply(lang, {
      en: `We hold 13 internationally audited certifications:\n\n🌿 GOTS, OCS, RCS, GRS, BCI\n🔬 OEKO-TEX Standard 100\n⚙️ ISO 9001, ISO 14001\n👷 SA8000, WRAP, BSCI, SEDEX\n🛃 C-TPAT\n\n${WEBSITE}/certifications`,
      ar: `13 شهادة: GOTS, OCS, GRS, OEKO-TEX, ISO 9001, SA8000, WRAP, BSCI, SEDEX, C-TPAT\n\n${WEBSITE}/certifications`,
      es: `13 certificaciones: GOTS, OCS, GRS, OEKO-TEX, ISO 9001, SA8000, WRAP, BSCI, SEDEX, C-TPAT\n\n${WEBSITE}/certifications`,
      fr: `13 certifications: GOTS, OCS, GRS, OEKO-TEX, ISO 9001, SA8000, WRAP, BSCI, SEDEX, C-TPAT\n\n${WEBSITE}/certifications`
    }, note);
  }

  if (/\b(contact|email|reach|get in touch|inquire|inquiry|how to contact|get a quote|start order)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Contact SDF Clothing:\n\n📧 General: ${CONTACT_EMAIL}\n📧 Payments: ${ACCOUNT_EMAIL}\n📧 Complaints: ${COMPLAINT_EMAIL}\n📧 HR/Visits: ${HR_EMAIL}\n📱 WhatsApp: ${HUMAN_WA}\n🌐 ${WEBSITE}/contact`,
      ar: `📧 ${CONTACT_EMAIL} | 📧 ${ACCOUNT_EMAIL} | 📱 ${HUMAN_WA}`,
      es: `📧 ${CONTACT_EMAIL} | 📧 ${ACCOUNT_EMAIL} | 📱 ${HUMAN_WA}`,
      fr: `📧 ${CONTACT_EMAIL} | 📧 ${ACCOUNT_EMAIL} | 📱 ${HUMAN_WA}`
    }, note);
  }

  if (/\b(thank you|thanks|thank|thx|ty|appreciated|شكرا|merci|gracias|grazie|danke|obrigado|ধন্যবাদ)\b/.test(tl)) {
    return buildReply(lang, {
      en: `You are very welcome. If you have more questions, feel free to ask.\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`,
      ar: `على الرحب والسعة.\n📧 ${CONTACT_EMAIL}`,
      es: `De nada.\n📧 ${CONTACT_EMAIL}`,
      fr: `De rien.\n📧 ${CONTACT_EMAIL}`
    }, note);
  }

  if (/\b(bye|goodbye|see you|take care|later|ciao|au revoir|hasta luego)\b/.test(tl)) {
    return buildReply(lang, {
      en: `Take care and best of luck with your brand!\n\n📧 ${CONTACT_EMAIL} | 🌐 ${WEBSITE}`,
      ar: `وداعاً وحظاً موفقاً!\n📧 ${CONTACT_EMAIL}`,
      es: `¡Cuídate!\n📧 ${CONTACT_EMAIL}`,
      fr: `Prenez soin de vous!\n📧 ${CONTACT_EMAIL}`
    }, note);
  }

  // Default
  return buildReply(lang, {
    en: `Thanks for reaching out to SDF Clothing.\n\n💰 Pricing | 📦 MOQ 300 pcs | 🧵 Free samples | ⏱️ Lead times | 🚢 Shipping | 💳 Payment | 🏆 13 Certifications\n\nJust type your question!\n\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA} | 🌐 ${WEBSITE}`,
    ar: `💰 الأسعار | 📦 MOQ | 🧵 عينات | ⏱️ مواعيد | 🚢 شحن | 💳 دفع\n\nاكتب سؤالك!\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA}`,
    es: `💰 Precios | 📦 MOQ | 🧵 Muestras | ⏱️ Plazos | 🚢 Envío | 💳 Pago\n\n¡Escribe tu pregunta!\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA}`,
    fr: `💰 Prix | 📦 MOQ | 🧵 Échantillons | ⏱️ Délais | 🚢 Expédition | 💳 Paiement\n\nTapez votre question!\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA}`,
    zh: `💰 价格 | 📦 MOQ | 🧵 样品 | ⏱️ 交期 | 🚢 运输 | 💳 付款\n\n请输入您的问题！\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA}`,
    de: `💰 Preise | 📦 MOQ | 🧵 Muster | ⏱️ Lieferzeiten | 🚢 Versand | 💳 Zahlung\n\nStellen Sie Ihre Frage!\n📧 ${CONTACT_EMAIL} | 📱 ${HUMAN_WA}`
  }, note);
}
