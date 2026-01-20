const express = require("express");

const app = express();
app.use(express.json());

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

const packagesMenu = [
  { id: "pkg_afiya", title: "العافية 360 – التغذية" },
  { id: "pkg_beauty", title: "جينات الجمال والتميز" },
  { id: "pkg_psych", title: "جينات الانسجام النفسي" },
  { id: "pkg_allergy", title: "خريطة الحساسية" },
  { id: "pkg_digest", title: "خريطة الجهاز الهضمي" },
  { id: "pkg_full", title: "الباقة الجينية الشاملة" },
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;

  if (msg.type === "text") {
    await sendText(
      to,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`
    );

    await sendList(to, welcomeMenuText, mainMenu);
    return;
  }

  if (msg.type === "interactive") {
    const id = msg.interactive?.list_reply?.id;

    if (id === "packages") {
      await sendList(
        to,
`*تعرّف على الباقات*

كل باقة في جيناتك مصمّمة حسب احتياج صحي مختلف،
وتحتوي على مجموعة من التحاليل الجينية
المرتبطة بحالتك الصحية وأهدافك.

اختر الباقة المناسبة لك،
أو تواصل مع مستشار جيناتك للمساعدة.`,
        packagesMenu
      );
      return;
    }

    if (id === "main_menu") {
      await sendList(to, welcomeMenuText, mainMenu);
      return;
    }

    if (id === "start") {
      await sendText(to, "ابدأ الآن / تحدث معنا");
      return;
    }

    const selected = mainMenu.find(r => r.id === id);
    if (selected) {
      await sendText(to, selected.title);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
