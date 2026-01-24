const express = require("express");

const app = express();
app.use(express.json());

const CHATWOOT_TOKEN = "TAzD9TtMHVsWAJ759SNRNpAE";

async function sendToChatwoot(phone, text) {
  const convoRes = await fetch(
    "https://chatwoot-app-lzpe.onrender.com/api/v1/accounts/1/conversations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: CHATWOOT_TOKEN
      },
      body: JSON.stringify({
        inbox_id: 3,
        source_id: `whatsapp_${phone}`
      })
    }
  );

  const convo = await convoRes.json();
  if (!convo.id) return;

  await fetch(
    `https://chatwoot-app-lzpe.onrender.com/api/v1/accounts/1/conversations/${convo.id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: CHATWOOT_TOKEN
      },
      body: JSON.stringify({
        content: text,
        message_type: "incoming"
      })
    }
  );
}

app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/chatwoot", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  if (msg.type !== "text") return;

  await sendToChatwoot(msg.from, msg.text?.body || "رسالة");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);


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

const subMenuAbout = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "steps", title: "خطوات رحلتك معنا" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const subMenuSteps = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "main_menu", title: "القائمة الرئيسية" }
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

const packageSubMenu = [
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "back_packages", title: "العودة لقائمة الباقات" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

const userState = {};

const lastSelectedPackage = {};

const STATE = {
  NONE: "none",
  WAITING_CALL: "waiting_call",
  WAITING_FEEDBACK: "waiting_feedback",
  WAITING_WHATSAPP: "waiting_whatsapp",
  HUMAN_HANDOVER: "human_handover"
};


const startMenu = [
  { id: "start_choose", title: "اختر الباقة المناسبة" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const startPackagesMenu = [
  { id: "buy_pkg_afiya", title: "العافية 360" },
  { id: "buy_pkg_beauty", title: "جينات الجمال" },
  { id: "buy_pkg_psych", title: "الانسجام النفسي" },
  { id: "buy_pkg_allergy", title: "خريطة الحساسية" },
  { id: "buy_pkg_digest", title: "الجهاز الهضمي" },
  { id: "buy_pkg_full", title: "الباقة الشاملة" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const contactMenu = [
  { id: "request_call", title: "طلب مكالمة" },
  { id: "whatsapp_chat", title: "تحدث عبر الواتساب" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const buyPackageMenu = [
  { id: "package_details", title: "تعرف على تفاصيل الباقة" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "start_choose", title: "العودة للباقات" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];


app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/chatwoot", (req, res) => {
  res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT);


