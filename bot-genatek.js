const express = require("express");
const fetch = require("node-fetch"); // ✅ FIXED

const app = express();
app.use(express.json());

/* ================= CHATWOOT ================= */

const CHATWOOT_INBOX_IDENTIFIER = "DQ1mXro7vP1MiqADzFuQg78";

async function sendToChatwoot(phone, text) {
  try {
    const res = await fetch(
      `https://app.chatwoot.com/api/v1/inboxes/${CHATWOOT_INBOX_IDENTIFIER}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api_access_token": process.env.CHATWOOT_API_TOKEN
        },
        body: JSON.stringify({
          content: text,
          sender: {
            identifier: phone
          }
        })
      }
    );

    const body = await res.text();
    console.log("CHATWOOT STATUS:", res.status);
    console.log("CHATWOOT BODY:", body);
  } catch (e) {
    console.error("CHATWOOT ERROR:", e.message);
  }
}

/* ================= 360DIALOG ================= */

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

async function send(payload) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "D360-API-KEY": API_KEY
    },
    body: JSON.stringify(payload)
  });
}

async function sendText(to, body) {
  await send({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  });
}

/* ================= WEBHOOK ================= */

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const from = msg.from;

  if (msg.type === "text") {
    // ✅ push every incoming WhatsApp message into Chatwoot
    await sendToChatwoot(from, msg.text.body);

    // optional bot reply
    await sendText(
      from,
      "تم استلام رسالتك وسيتم الرد عليك من فريق جيناتك 🌱"
    );
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
