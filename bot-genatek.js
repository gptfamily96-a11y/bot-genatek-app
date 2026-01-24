const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

/* ================= CHATWOOT ================= */
const CHATWOOT_BASE_URL = "https://app.chatwoot.com";
const CHATWOOT_INBOX_IDENTIFIER = "DQ1mXro7vP1MiqADzFuQg78";
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN;

async function sendToChatwoot(phone, text) {
  try {
    const res = await fetch(
      `${CHATWOOT_BASE_URL}/api/v1/inboxes/${CHATWOOT_INBOX_IDENTIFIER}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api_access_token": CHATWOOT_API_TOKEN
        },
        body: JSON.stringify({
          content: text,
          sender: {
            phone_number: phone
          }
        })
      }
    );

    if (!res.ok) {
      console.error("CHATWOOT ERROR:", await res.text());
    }
  } catch (e) {
    console.error("CHATWOOT EXCEPTION:", e.message);
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

/* ================= STATE ================= */
const userState = {};
const lastSelectedPackage = {};

const STATE = {
  HUMAN_HANDOVER: "HUMAN_HANDOVER",
  WAITING_CALL: "WAITING_CALL",
  WAITING_FEEDBACK: "WAITING_FEEDBACK",
  WAITING_WHATSAPP: "WAITING_WHATSAPP"
};

/* ================= MENUS ================= */
const welcomeMenuText = `لا تتردد في أي سؤال يخطر على بالك،
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

/* ================= WEBHOOK ================= */
app.get("/", (_, res) => res.send("OK"));

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const from = msg.from;

  /* ---- TEXT ---- */
  if (msg.type === "text") {
    await sendToChatwoot(from, msg.text?.body || "رسالة");

    if (userState[from] === STATE.HUMAN_HANDOVER) return;

    await sendText(
      from,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`
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

  if (id === "main_menu") {
    delete userState[from];
    await sendList(from, welcomeMenuText, mainMenu);
    return;
  }

  if (id === "packages") {
    await sendList(from, "*تعرّف على الباقات*", [
      { id: "pkg_afiya", title: "العافية 360 – التغذية" },
      { id: "pkg_beauty", title: "جينات الجمال" },
      { id: "pkg_psych", title: "الانسجام النفسي" },
      { id: "pkg_allergy", title: "خريطة الحساسية" },
      { id: "pkg_digest", title: "الجهاز الهضمي" },
      { id: "pkg_full", title: "الباقة الشاملة" },
      { id: "main_menu", title: "القائمة الرئيسية" }
    ]);
    return;
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on port", PORT));
