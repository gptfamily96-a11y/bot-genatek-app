const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

/* ================== CHATWOOT ================== */
async function sendToChatwoot(phone, text) {
  try {
    const url = `https://app.chatwoot.com/api/v1/accounts/${process.env.CHATWOOT_ACCOUNT_ID}/inboxes/${process.env.CHATWOOT_INBOX_ID}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": process.env.CHATWOOT_API_TOKEN
      },
      body: JSON.stringify({
        content: text,
        message_type: "incoming",
        contact: {
          identifier: phone,
          phone_number: phone
        }
      })
    });

    console.log("CHATWOOT STATUS:", res.status);
  } catch (err) {
    console.error("CHATWOOT ERROR:", err.message);
  }
}

/* ================== 360DIALOG ================== */
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

async function sendList(to, bodyText, rows) {
  await send({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: {
        button: "اختر من القائمة",
        sections: [{ rows }]
      }
    }
  });
}

/* ================== STATE ================== */
const userState = {};
const STATE = {
  HUMAN_HANDOVER: "HUMAN_HANDOVER"
};

/* ================== MENUS ================== */
const welcomeMenuText = `لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`;

const mainMenu = [
  { id: "about", title: "من نحن – جيناتك" },
  { id: "packages", title: "تعرّف على الباقات" }
];

/* ================== ROUTES ================== */
app.get("/", (req, res) => res.send("OK"));

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const from = msg.from;

  /* ---- TEXT MESSAGE ---- */
  if (msg.type === "text") {
    await sendToChatwoot(from, msg.text.body);

    if (userState[from] === STATE.HUMAN_HANDOVER) return;

    await sendText(
      from,
      `أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟`
    );

    await sendList(from, welcomeMenuText, mainMenu);
    return;
  }

  /* ---- INTERACTIVE ---- */
  if (msg.type !== "interactive") return;

  const id =
    msg.interactive?.list_reply?.id ||
    msg.interactive?.button_reply?.id;

  if (!id) return;

  await sendToChatwoot(from, `اختيار المستخدم: ${id}`);

  if (id === "about") {
    await sendText(from, "جيناتك علامة سعودية متخصصة في الطب الجيني");
    return;
  }

  if (id === "packages") {
    userState[from] = STATE.HUMAN_HANDOVER;
    await sendText(from, "سيتم تحويلك لمستشار مختص");
    return;
  }
});

/* ================== SERVER ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on", PORT));
