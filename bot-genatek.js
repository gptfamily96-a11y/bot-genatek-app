const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

const userState = {};

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

const welcomeText =
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`;

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
  { id: "pkg_health", title: "العافية 360 – التغذية" },
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
  { id: "packages", title: "العودة لقائمة الباقات" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

const consultMenu = [
  { id: "consult_call", title: "مكالمة مع مستشار جيناتك" },
  { id: "consult_whatsapp", title: "التحدث معنا عبر الواتساب" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const from = msg.from;
  const type = msg.type;

  if (type === "text") {
    if (userState[from] === "awaiting_call_info") {
      userState[from] = null;
      await sendText(
        from,
`سيتم التواصل معك من قبل مستشار جيناتك خلال 24 ساعة
شكرًا لاختياركم جيناتك`
      );
      await sendList(from, "اختر التالي:", [
        { id: "main_menu", title: "العودة للقائمة الرئيسية" }
      ]);
      return;
    }

    if (userState[from] === "feedback") {
      userState[from] = null;
      await sendList(from, "تم استلام رسالتك", [
        { id: "main_menu", title: "العودة للقائمة الرئيسية" }
      ]);
      return;
    }

    await sendText(from, welcomeText);
    await sendList(from, welcomeMenuText, mainMenu);
    return;
  }

  if (type !== "interactive") return;

  const id = msg.interactive?.list_reply?.id;

  if (id === "main_menu") {
    await sendList(from, welcomeMenuText, mainMenu);
    return;
  }

  if (id === "packages") {
    await sendList(from, "تعرّف على الباقات:", packagesMenu);
    return;
  }

  if (id === "start") {
    await sendText(
      from,
`يمكنك اختيار الباقة المناسبة من خلال رابط الشراء المباشر
أو بالتحدث مع مستشار جيناتك للمساعدة`
    );
    await sendList(from, "اختر:", [
      ...packagesMenu.filter(p => p.id.startsWith("pkg_")),
      { id: "consult", title: "تحدث مع مستشار جيناتك" },
      { id: "main_menu", title: "العودة للقائمة الرئيسية" }
    ]);
    return;
  }

  if (id === "consult") {
    await sendText(from, "يمكنك اختيار وسيلة التواصل المناسبة");
    await sendList(from, "اختر:", consultMenu);
    return;
  }

  if (id === "consult_call") {
    userState[from] = "awaiting_call_info";
    await sendText(
      from,
`سيتم التواصل معك من قبل مستشار جيناتك خلال 24 ساعة
فضلاً زودنا باسمك ورقم الهاتف`
    );
    return;
  }

  if (id === "consult_whatsapp") {
    userState[from] = "feedback";
    await sendText(
      from,
`يسعدنا سماع استفسارك
وسيقوم أحد ممثلينا بالرد عليك`
    );
    await sendList(from, "اختر:", [
      { id: "main_menu", title: "العودة للقائمة الرئيسية" }
    ]);
    return;
  }

  if (id === "feedback") {
    userState[from] = "feedback";
    await sendText(
      from,
`يهمنا سماع رأيك
اكتب رسالتك وسيتم الرد عليك
من قبل أحد ممثلي خدمة العملاء`
    );
    return;
  }

  if (id.startsWith("pkg_")) {
    await sendText(from, "سيتم توجيهك لرابط الشراء المباشر");
    await sendList(from, "اختر:", [
      { id: "packages", title: "تعرّف على تفاصيل الباقة" },
      { id: "consult", title: "تحدث مع مستشار جيناتك" },
      { id: "start", title: "العودة للقائمة السابقة" },
      { id: "main_menu", title: "العودة للقائمة الرئيسية" }
    ]);
    return;
  }
});

app.listen(process.env.PORT || 3000);
