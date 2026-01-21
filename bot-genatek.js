const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

const state = {};

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

/* ====== النصوص الثابتة ====== */

const welcomeText =
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`;

const mainIntro =
`لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`;

/* ====== القوائم ====== */

const mainMenu = [
  { id: "about", title: "من نحن – جيناتك" },
  { id: "what", title: "ما هو التحليل الجيني؟" },
  { id: "why", title: "لماذا تحتاج التحليل؟" },
  { id: "steps", title: "خطوات رحلتك معنا" },
  { id: "after", title: "ماذا بعد النتائج" },
  { id: "packages_info", title: "تعرّف على الباقات" },
  { id: "start_buy", title: "ابدأ الآن / تحدث معنا" },
  { id: "feedback", title: "الاقتراحات / الشكاوى" }
];

const packagesInfoMenu = [
  { id: "info_health", title: "العافية 360 – التغذية" },
  { id: "info_beauty", title: "جينات الجمال والتميّز" },
  { id: "info_psych", title: "جينات الانسجام النفسي" },
  { id: "info_allergy", title: "خريطة الحساسية" },
  { id: "info_digest", title: "خريطة الجهاز الهضمي" },
  { id: "info_full", title: "الباقة الجينية الشاملة" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const buyMenu = [
  { id: "buy_health", title: "العافية 360 – التغذية" },
  { id: "buy_beauty", title: "جينات الجمال والتميّز" },
  { id: "buy_psych", title: "جينات الانسجام النفسي" },
  { id: "buy_allergy", title: "خريطة الحساسية" },
  { id: "buy_digest", title: "خريطة الجهاز الهضمي" },
  { id: "buy_full", title: "الباقة الجينية الشاملة" },
  { id: "consult", title: "تحدث مع مستشار جيناتك" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

const consultMenu = [
  { id: "call", title: "مكالمة مع مستشار جيناتك" },
  { id: "whatsapp", title: "التحدث معنا عبر الواتساب" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

/* ====== Webhook ====== */

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const from = msg.from;

  /* ====== نص حر ====== */
  if (msg.type === "text") {
    if (state[from] === "call_wait") {
      state[from] = null;
      await sendText(
        from,
`سيتم التواصل معك من قبل مستشار جيناتك خلال 24 ساعة
شكرًا لاختياركم جيناتك`
      );
      await sendList(from, "يمكنك الرجوع:", [
        { id: "main_menu", title: "العودة للقائمة الرئيسية" }
      ]);
      return;
    }

    if (state[from] === "feedback_wait") {
      state[from] = null;
      await sendList(from, "تم استلام رسالتك", [
        { id: "main_menu", title: "العودة للقائمة الرئيسية" }
      ]);
      return;
    }

    await sendText(from, welcomeText);
    await sendList(from, mainIntro, mainMenu);
    return;
  }

  if (msg.type !== "interactive") return;
  const id = msg.interactive.list_reply.id;

  if (id === "main_menu") {
    await sendList(from, mainIntro, mainMenu);
    return;
  }

  /* ====== تعرّف على الباقات (شرح) ====== */
  if (id === "packages_info") {
    await sendList(
      from,
`كل باقة في جيناتك مصمّمة حسب احتياج صحي مختلف،
وتحتوي على مجموعة من التحاليل الجينية
المرتبطة بحالتك الصحية وأهدافك.`,
      packagesInfoMenu
    );
    return;
  }

  /* ====== ابدأ الآن / شراء ====== */
  if (id === "start_buy") {
    await sendList(
      from,
`يمكنك اختيار الباقة المناسبة من خلال رابط الشراء المباشر
أو بالتحدث مع مستشار جيناتك للمساعدة`,
      buyMenu
    );
    return;
  }

  /* ====== تحدث مع مستشار ====== */
  if (id === "consult") {
    await sendList(
      from,
`يمكنك اختيار وسيلة التواصل المناسبة`,
      consultMenu
    );
    return;
  }

  if (id === "call") {
    state[from] = "call_wait";
    await sendList(
      from,
`سيتم التواصل معك من قبل مستشار جيناتك خلال 24 ساعة
فضلاً زودنا باسمك ورقم الهاتف`,
      [{ id: "main_menu", title: "العودة للقائمة الرئيسية" }]
    );
    return;
  }

  if (id === "whatsapp") {
    state[from] = "feedback_wait";
    await sendList(
      from,
`يسعدنا سماع استفسارك
وسيقوم أحد ممثلينا بالرد عليك`,
      [{ id: "main_menu", title: "العودة للقائمة الرئيسية" }]
    );
    return;
  }

  if (id === "feedback") {
    state[from] = "feedback_wait";
    await sendText(
      from,
`يهمنا سماع رأيك
اكتب رسالتك وسيتم الرد عليك
من قبل أحد ممثلي خدمة العملاء`
    );
    return;
  }

  /* ====== شراء (بدون روابط بعد) ====== */
  if (id.startsWith("buy_")) {
    await sendList(
      from,
`سيتم توجيهك إلى رابط الشراء المباشر`,
      [
        { id: "packages_info", title: "تعرّف على تفاصيل الباقة" },
        { id: "consult", title: "تحدث مع مستشار جيناتك" },
        { id: "start_buy", title: "العودة للقائمة السابقة" },
        { id: "main_menu", title: "العودة للقائمة الرئيسية" }
      ]
    );
    return;
  }
});

app.listen(process.env.PORT || 3000);
