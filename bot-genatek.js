/******************** FETCH FIX (REQUIRED) ********************/
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
/*************************************************************/

const express = require("express");
const app = express();
app.use(express.json());

/* ================== CHATWOOT ================== */
const CHATWOOT_INBOX_IDENTIFIER = "DQ1mXro7vP1MiqADzFuQg78";

async function sendToChatwoot(phone, text) {
  try {
    const res = await fetch(
      `https://app.chatwoot.com/api/v1/inboxes/${CHATWOOT_INBOX_IDENTIFIER}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api_access_token": process.env.CHATWOOT_INBOX_API_TOKEN
        },
        body: JSON.stringify({
          content: text,
          sender: {
            identifier: phone
          }
        })
      }
    );

    console.log("CHATWOOT STATUS:", res.status);
    console.log(await res.text());
  } catch (e) {
    console.error("CHATWOOT ERROR:", e.message);
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

const packagesMenu = [
  { id: "pkg_afiya", title: "العافية 360 – التغذية" },
  { id: "pkg_beauty", title: "جينات الجمال والتميّز" },
  { id: "pkg_psych", title: "جينات الانسجام النفسي" },
  { id: "pkg_allergy", title: "خريطة الحساسية" },
  { id: "pkg_digest", title: "خريطة الجهاز الهضمي" },
  { id: "pkg_full", title: "الباقة الجينية الشاملة" },
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

/* ================== STATE ================== */
const userState = {};
const STATE = {
  HUMAN_HANDOVER: "HUMAN_HANDOVER"
};

/* ================== ROUTES ================== */
app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;

  /* ---------- TEXT MESSAGE ---------- */
  if (msg.type === "text") {
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

  /* ---------- INTERACTIVE ---------- */
  if (msg.type !== "interactive") return;

  const id =
    msg.interactive?.list_reply?.id ||
    msg.interactive?.button_reply?.id;

  if (!id) return;

  await sendToChatwoot(to, `اختيار المستخدم: ${id}`);

  if (id === "main_menu") {
    delete userState[to];
    await sendList(to, welcomeMenuText, mainMenu);
    return;
  }

  if (id === "packages") {
    await sendList(to, "*تعرّف على الباقات*", packagesMenu);
    return;
  }

  if (id === "start") {
    userState[to] = STATE.HUMAN_HANDOVER;
    await sendText(to, "تم تحويلك لمستشار مختص 👩‍⚕️");
    return;
  }
});

/* ================== SERVER ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
