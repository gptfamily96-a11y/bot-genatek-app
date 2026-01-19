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

const subMenu = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن / تحدث مع مختص" },
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

    if (id === "steps") {
      await sendText(
        to,
`*رحلتك مع جيناتك واضحة واحترافية من البداية للنهاية*`
      );

      await sendText(
        to,
`*اختيار الباقة*

تختار الباقة المناسبة لحالتك وهدفك الصحي
مباشرة من المتجر،
أو بالتحدث مع مستشار جيناتك
لتحديد الباقة الأنسب لك.`
      );

      await sendText(
        to,
`*استلام العيّنة*

يصلك المندوب
لاستلام عينة اللعاب
بكل سهولة من المنزل.`
      );

      await sendText(
        to,
`*التحليل الجيني*

تدخل العينة المختبر
ويتم تحليلها
تحت إشراف فريقنا الطبي.`
      );

      await sendText(
        to,
`*التقرير الجيني*

يصلك تقرير مفصّل
يوضح تفاصيل جيناتك.`
      );

      await sendText(
        to,
`*الجلسة الاستشارية*

حجز موعد جلسة استشارية عن بُعد
مع أحد أطبائنا المتخصصين
لشرح النتائج،
مناقشة التوصيات،
والإجابة على جميع استفساراتك.`
      );

      await sendText(
        to,
`*التوصيات والقرارات الصحية*

بناءً على التقرير، تحصل على:
• دليل صحي مخصص يناسب تركيبتك الجينية
• قرارات صحية لضبط نمط حياتك
• منتجات مصمّمة خصيصًا لك
يمكنك شراءها مباشرة من المتجر`
      );

      await sendList(to, "", subMenu);
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
