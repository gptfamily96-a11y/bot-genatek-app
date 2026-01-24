const express = require("express");
const fetch = require("node-fetch"); // ✅ REQUIRED

const app = express();
app.use(express.json());

/* ================== CHATWOOT ================== */
async function sendToChatwoot(phone, text) {
  try {
    const res = await fetch(
      `https://app.chatwoot.com/api/v1/inboxes/${process.env.CHATWOOT_INBOX_IDENTIFIER}/messages`,
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

    const data = await res.text();
    console.log("CHATWOOT STATUS:", res.status);
    console.log("CHATWOOT RESPONSE:", data);
  } catch (e) {
    console.log("CHATWOOT ERROR:", e.message);
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

/* ================== MENUS ================== */
const welcomeMenuText =
`لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`;

const mainMenu = [
  { id: "about", title: "من نحن – جيناتك" },
  { id: "what", title: "ما هو التحليل الجيني؟" },
  { id: "why", title: "لماذا تحتاج التحليل؟" },
  { id: "steps", title: "خطوات رحلتك معنا" },
  { id: "after", title: "ماذا بعد النتائج" },
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "feedback", title: "الاقتراحات / الشكاوى" }
];

/* ================== STATE ================== */
const userState = {};
const STATE = {
  HUMAN_HANDOVER: "HUMAN_HANDOVER"
};

/* ================== ROUTES ================== */
app.get("/", (_, res) => res.send("OK"));

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;

  if (msg.type === "text") {

    // ✅ Send incoming WhatsApp message to Chatwoot
    await sendToChatwoot(to, msg.text?.body || "رسالة");

    if (userState[to] === STATE.HUMAN_HANDOVER) return;

    await sendText(
      to,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨`
    );

    await sendList(to, welcomeMenuText, mainMenu);
    return;
  }

  if (msg.type !== "interactive") return;

  const id =
    msg.interactive?.list_reply?.id ||
    msg.interactive?.button_reply?.id;

  if (!id) return;

  // Log selections to Chatwoot
  await sendToChatwoot(to, `اختيار المستخدم: ${id}`);

  if (id === "start") {
    userState[to] = STATE.HUMAN_HANDOVER;
    await sendText(to, "تم تحويلك لمستشار مختص 👩‍⚕️");
  }
});

/* ================== SERVER ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
