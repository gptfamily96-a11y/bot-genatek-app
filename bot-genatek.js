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

const aboutMenu = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "steps", title: "خطوات رحلتك معنا" },
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

    if (id === "about") {
      await sendText(
        to,
`*جيناتك من أوائل العلامات السعودية المتخصصة في مجال الطب الجيني*

تعمل تحت إشراف كادر طبي متميز.

نقدّم مجموعة من التحاليل الجينية (DNA)
تساعدك على فهم صحتك من الجذور
وإنهاء رحلة التشخيص الطويلة.`
      );

      await sendText(
        to,
`*ولأن راحتك أولوية، نجيك لين البيت!*

تبدأ رحلتك معنا من المنزل؛
مندوبنا يجيك لاستلام العينة،
ونرسل لك النتائج لين عندك.

كما نقدّم لك جلسة استشارية خاصة
مع فريقنا الطبي المتخصص
لشرح النتائج وبناء قراراتك الصحية.`
      );

      await sendText(
        to,
`*جيناتك مو مجرد فحص*

هي تجربة صحية متكاملة
باحترافية عالية وخصوصية تامة.

نوفر لك منتجات مصمّمة خصيصًا
حسب طبيعة جيناتك لتحقيق أفضل استجابة
وبخيار شراء مباشر.`
      );

      await sendList(
        to,
        "تقدر تكمل من الخيارات التالية:",
        aboutMenu
      );
      return;
    }

    if (id === "main_menu") {
      await sendList(to, welcomeMenuText, mainMenu);
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
