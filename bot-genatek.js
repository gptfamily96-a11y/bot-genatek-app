
const express = require("express");

const app = express();
app.use(express.json());

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

const LINKS = {
  afiya: "https://genatech-ksa.com/%D8%A7%D9%84%D8%B9%D8%A7%D9%81%D9%8A%D8%A9-%D8%A7%D9%84%D8%AC%D9%8A%D9%86%D9%8A%D8%A9-gene-wellness-360/p1921183372",
  beauty: "https://genatech-ksa.com/%D8%AC%D9%8A%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D8%AC%D9%85%D8%A7%D9%84-%D8%A7%D9%84%D9%85%D9%85%D9%8A%D8%B2/p595261876",
  psych: "https://genatech-ksa.com/%D8%AC%D9%8A%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D8%A7%D9%86%D8%B3%D8%AC%D8%A7%D9%85-%D8%A7%D9%84%D9%86%D9%81%D8%B3%D9%8A/p1183924682",
  allergy: "https://genatech-ksa.com/%D8%A7%D9%84%D8%AE%D8%B1%D9%8A%D8%B7%D8%A9-%D8%A7%D9%84%D9%85%D8%AA%D9%83%D8%A7%D9%85%D9%84%D8%A9-%D9%84%D9%84%D8%AD%D8%B3%D8%A7%D8%B3%D9%8A%D8%A9-allergy-map-pro/p1827824782",
  digest: "https://genatech-ksa.com/%D8%A7%D9%84%D8%B4%D9%81%D8%B1%D8%A9-%D8%A7%D9%84%D9%88%D8%B1%D8%A7%D8%AB%D9%8A%D8%A9-%D8%A7%D9%84%D9%87%D8%B6%D9%85%D9%8A%D8%A9-digestive-genetic-code/p302774848",
  full: "https://genatech-ksa.com/%D8%A7%D9%84%D8%AC%D9%8A%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D9%85%D9%8A%D8%B2%D8%A9-genes-premium-package/p1707049615"
};

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
  { id: "start", title: "ابدأ الآن" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "feedback", title: "الاقتراحات / الشكاوى" }
];


const subMenuAbout = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "steps", title: "خطوات رحلتك معنا" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];


const subMenuSteps = [
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

 
const packagesMenu = [
  { id: "pkg_afiya", title: "العافية 360 – التغذية" },
  { id: "pkg_beauty", title: "جينات الجمال والتميّز" },
  { id: "pkg_psych", title: "جينات الانسجام النفسي" },
  { id: "pkg_allergy", title: "خريطة الحساسية" },
  { id: "pkg_digest", title: "خريطة الجهاز الهضمي" },
  { id: "pkg_full", title: "الباقة الجينية الشاملة" },
  { id: "start", title: "ابدأ الآن" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "main_menu", title: "القائمة الرئيسية" }
];

const packageSubMenu = [
  { id: "start", title: "ابدأ الآن" },
  { id: "contact_consultant", title: "تحدث مع مستشار" },
  { id: "back_packages", title: "العودة لقائمة الباقات" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

const userState = {};
const supportType = {};

const supportBuffer = {};
const supportTimer = {};
const SUPPORT_SILENCE_TIME = 30 * 1000;

function formatSupportMessage(type, phone, messages) {
  const time = new Date().toLocaleString("ar-SA");
  const name = messages[0] || "غير مذكور";
  const content = messages.slice(1).join("\n") || "لا يوجد نص";

  return (
`📩 طلب دعم جديد – جيناتك

📌 نوع الطلب:
${type || "غير محدد"}

👤 الاسم:
${name}

📱 رقم العميل:
${phone}

🕒 وقت آخر رسالة:
${time}

📝 الرسالة:
${content}`
  );
}


async function startSupportTimer(phone) {
  if (supportTimer[phone]) {
    clearTimeout(supportTimer[phone]);
  }

  supportTimer[phone] = setTimeout(async () => {
    const messages = supportBuffer[phone];
    if (!messages || messages.length === 0) return;

    const finalMessage = formatSupportMessage(
      supportType[phone],
      phone,
      messages
    );

    await send({
      messaging_product: "whatsapp",
      to: "966536887516",
      type: "text",
      text: { body: finalMessage }
    });

    await sendText(
      phone,
`سيتم التواصل معك من قبل فريق الدعم
شكرًا لاختياركم جيناتك 💙`
    );

    await sendList(phone, welcomeMenuText, mainMenu);

    delete supportBuffer[phone];
    delete supportTimer[phone];
    delete userState[phone];
    delete supportType[phone];
  }, SUPPORT_SILENCE_TIME);
}


const lastSelectedPackage = {};

const STATE = {
  WAITING_CALL: "WAITING_CALL",
  WAITING_FEEDBACK: "WAITING_FEEDBACK",
  WAITING_WHATSAPP: "WAITING_WHATSAPP"
};


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

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;


if (msg.type === "text") {
if (!global.notifiedNumbers) {
  global.notifiedNumbers = {};
}

if (!global.notifiedNumbers[msg.from]) {
  global.notifiedNumbers[msg.from] = true;

  await send({
    messaging_product: "whatsapp",
    to: "966536887516",
    type: "text",
    text: {
      body:
`🔔 بدء محادثة جديدة

📞 رقم العميل:
${msg.from}

🕒 الوقت:
${new Date().toLocaleString("ar-SA")}`
    }
  });
}


  if (
    userState[msg.from] === STATE.WAITING_CALL ||
    userState[msg.from] === STATE.WAITING_WHATSAPP ||
    userState[msg.from] === STATE.WAITING_FEEDBACK
  ) {
    if (!supportBuffer[msg.from]) {
      supportBuffer[msg.from] = [];
    }

    supportBuffer[msg.from].push(msg.text?.body || "");

    startSupportTimer(msg.from);

    return;
  }



  await sendText(
    msg.from,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`
  );

  await sendList(msg.from, welcomeMenuText, mainMenu);
  return;
}


  if (msg.type !== "interactive") return;
  let id =
  msg.interactive?.list_reply?.id ||
  msg.interactive?.button_reply?.id;

if (!id) return;


if (id === "package_details") {

  const pkgId = lastSelectedPackage[to];


  if (!pkgId) {
    await sendList(to, welcomeMenuText, mainMenu);
    return;
  }

  // تحويل مباشر إلى منطق تفاصيل الباقة
  if (pkgId === "pkg_afiya") {
    id = "pkg_afiya";
  } else if (pkgId === "pkg_beauty") {
    id = "pkg_beauty";
  } else if (pkgId === "pkg_psych") {
    id = "pkg_psych";
  } else if (pkgId === "pkg_allergy") {
    id = "pkg_allergy";
  } else if (pkgId === "pkg_digest") {
    id = "pkg_digest";
  } else if (pkgId === "pkg_full") {
    id = "pkg_full";
  }
}


if (id === "start") {
  await sendList(
    to,
`يمكنك اختيار الباقة المناسبة من خلال القوائم التالية
أو التحدث مع مستشار جيناتك للمساعدة`,
    startPackagesMenu
  );
  return;
}


if (id === "start_choose") {
  await sendList(
    to,
`يمكنك اختيار الباقة المناسبة من خلال القوائم التالية
او بالتحدث مع مستشار جيناتك للمساعدة`,
    startPackagesMenu
  );
  return;
}

if (id === "contact_consultant") {
  await sendList(
    to,
    `يمكنك اختيار وسيلة التواصل المناسبة`,
    contactMenu
  );
  return;
}

if (id === "request_call") {
  userState[to] = STATE.WAITING_CALL;

  supportBuffer[to] = [];

  await sendText(
    to,
`سيتم التواصل معك من قبل مستشار جيناتك خلال 24 ساعة

فضلاً زودنا بالآتي:

الاسم:
رقم الهاتف الخاص بالتواصل:`
  );
  return;
}



if (id === "whatsapp_chat") {
  userState[to] = STATE.WAITING_WHATSAPP;
  supportType[to] = "استفسار";
  supportBuffer[to] = [];

  await sendText(
    to,
`يسعدنا تواصلك مع فريق جيناتك 💙

فضلاً زودنا بالآتي:

الاسم:
الاستفسار:`
  );
  return;
}


if (id === "feedback") {
  userState[to] = STATE.WAITING_FEEDBACK;
  supportType[to] = "شكوى / اقتراح";
  supportBuffer[to] = [];

  await sendText(
    to,
`يهمنا سماع رأيك
اكتب رسالتك وسيتم الرد عليك
من قبل أحد ممثلي خدمة العملاء`
  );
  return;
}



if (id.startsWith("buy_pkg_")) {

  const packageMap = {
    buy_pkg_afiya: {
      name: "العافية 360 – التغذية",
      link: LINKS.afiya,
      detailsId: "pkg_afiya"
    },
    buy_pkg_beauty: {
      name: "جينات الجمال والتميّز",
      link: LINKS.beauty,
      detailsId: "pkg_beauty"
    },
    buy_pkg_psych: {
      name: "جينات الانسجام النفسي",
       link: LINKS.psych,
      detailsId: "pkg_psych"
    },
    buy_pkg_allergy: {
      name: "خريطة الحساسية",
      link: LINKS.allergy,
      detailsId: "pkg_allergy"
    },
    buy_pkg_digest: {
      name: "خريطة الجهاز الهضمي",
      link: LINKS.digest,
      detailsId: "pkg_digest"
    },
    buy_pkg_full: {
      name: "الباقة الجينية الشاملة",
      link: LINKS.full,
      detailsId: "pkg_full"
    }
  };

  const pkg = packageMap[id];
  if (!pkg) return;

  lastSelectedPackage[to] = pkg.detailsId;

  await sendList(
    to,
`رابط الشراء المباشر لباقة ${pkg.name}:
${pkg.link}`,
    [
      { id: "package_details", title: "تعرف على تفاصيل الباقة" },
      { id: "contact_consultant", title: "تحدث مع مستشار" },
      { id: "start_choose", title: "العودة للباقات" },
      { id: "main_menu", title: "القائمة الرئيسية" }
    ]
  );
  return;
}


 if (id === "main_menu") {
  delete userState[msg.from];
  await sendList(msg.from, welcomeMenuText, mainMenu);
  return;
}


  if (id === "packages" || id === "back_packages") {
    await sendList(
      to,
`*تعرّف على الباقات*

كل باقة في جيناتك مصمّمة حسب احتياج صحي مختلف،
وتحتوي على مجموعة من التحاليل الجينية
المرتبطة بحالتك الصحية وأهدافك.

تعرّف على تفاصيل الباقات واختر الباقة اللي تناسبك،
أو تواصل مع مستشار جيناتك للمساعدة.`,
      packagesMenu
    );
    return;
  }

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
    await sendList(
      to,
`*جيناتك مو مجرد فحص*

هي تجربة صحية متكاملة
باحترافية عالية وخصوصية تامة.

نوفر لك منتجات مصمّمة خصيصًا
حسب طبيعة جيناتك لتحقيق أفضل استجابة
وبخيار شراء مباشر.`,
      subMenuAbout
    );
    return;
  }

  if (id === "what") {
    await sendText(
      to,
`*ما هو التحليل الجيني؟*

التحليل الجيني هو فحص لأجزاء محددة
من حمضك النووي (DNA)
عن طريق عينة بسيطة من اللعاب.`
    );
    await sendText(
      to,
`*من خلال تحليلك الجيني نقدر نفهم:*

• ليه أعراض معيّنة تتكرر عندك
• كيف يتم تصنيع وتنظيم هرموناتك
• كيف يتفاعل جسمك مع الأدوية والمكملات
• كيف يتعامل جسمك مع الغذاء
• استعدادك لمشاكل صحية معيّنة
• وليه نفس الحل ينجح مع غيرك وما ينجح معك`
    );
    await sendList(
      to,
`*وش نتيجة التحليل؟*

تحصل على تقرير مفصّل عنك،
نقدر من خلاله نوصل
لقرارات صحية شخصية وطويلة المدى،
تساعدك للوصول
لأفضل نسخة من نفسك.`,
      subMenuAbout
    );
    return;
  }

  if (id === "why") {
    await sendText(
      to,
`*ليش تحتاج التحليل الجيني؟*

التحليل الجيني ما صار رفاهية،
هو أول خطوة صحية فارقة
للوصول لأفضل نسخة صحية من جسمك.`
    );
    await sendText(
      to,
`*من خلاله تقدر تفهم:*

• السبب الحقيقي وراء أعراضك المتكررة
• ليه جسمك ما يستجيب للأدوية مثل غيرك
• استعدادك لمشاكل صحية مستقبلية
• الأطعمة المناسبة لجهازك الهضمي
• حلول جذرية لمشاكل السمنة أو النحافة
• احتياجات عقلك وذهنك بشكل أعمق`
    );
    await sendList(
      to,
`*بشكل أوضح*

عشان تبني قراراتك الصحية
على جسمك أنت،
مو على تجارب غيرك.

وتنهي رحلة الحيرة
بوعي أعمق
ونمط حياة أكثر توازن.`,
      subMenuAbout
    );
    return;
  }

  if (id === "steps") {
    await sendText(to, `*رحلتك مع جيناتك واضحة واحترافية من البداية للنهاية*`);
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

يتم ارسال العينة الى محتبراتنا الجينية في النمسا وتحليلها تحت اشراف فريقنا الطبي`
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
    await sendList(
      to,
`*التوصيات والقرارات الصحية*

بناءً على التقرير، تحصل على:
• دليل صحي مخصص يناسب تركيبتك الجينية
• قرارات صحية لضبط نمط حياتك
• منتجات مصمّمة خصيصًا لك
يمكنك شراءها مباشرة من المتجر`,
      subMenuSteps
    );
    return;
  }

  if (id === "after") {
    await sendText(
      to,
`*ماذا بعد ظهور النتائج؟*

بعد ظهور نتائج التحليل الجيني،
وحسب نوع الباقة:`
    );
    await sendText(
      to,
`*الحصول على تقرير جيني مفصل - توصيات صحية مخصّصة لك*

تكون بمثابة دليل شخصي وتحتوي على:
• تقرير مفصّل لنتائج تحليلك الجيني كاملة، وتأثير كل جين على صحة جسمك ووظائفه
• قائمة قرارات صحية مناسبة لطبيعة جسمك وجيناتك.
• قائمة أطعمة تناسب جسمك تستخدمها في أنظمتك الغذائية`
    );
    await sendText(
      to,
`*حجز جلسة استشارية خاصة مع أطبائنا (عن بُعد)*

• لشرح التقرير الجيني وفهم النتائج بالتفصيل
• لمناقشة التوصيات والاجابة على الاستفسارات`
    );
    await sendList(
      to,
`*إمكانية الحصول على منتجات مصمّمة خصيصًا لك*

حسب طبيعة جيناتك،
ومتاحة للشراء عبر رابط مباشر

*كل ذلك يؤهلك مباشرة ويضعك على الطريق الصحيح :*
لفهم أوضح لطريقة استجابة جسمك مع الأدوية، المكملات، والأطعمة
للوعي المبكر لتقليل فرص الإصابة بمشكلات صحية متوقعة
لراحة من الحيرة والتجربة العشوائية بعد فهمك للأسباب الحقيقية`,
      subMenuSteps
    );
    return;
  }

if (id === "pkg_afiya") {
  await sendText(
    to,
`*باقة الصحة الشاملة، تحسين الوزن والتغذية المخصّصة*

*ليش تختار العافية 360؟*
• جرّبت أنظمة غذائية كثيرة وما نفعت.
• صعب تتحكم في وزنك مهما حاولت.
• تحتاج مرجع غذائي ونمط حياة يناسب جسمك بكل تفاصيله.`
  );

  await sendList(
    to,
`*وش تقدم لك باقة العافية 360؟*
• تحسين التغذية: كيف يتعامل جسمك مع الدهون، الكربوهيدرات، والبروتينات.
• استراتيجية مخصّصة لتقليل السعرات الحرارية، ممارسة الرياضة، وحماية الكتلة العضلية.
• تحديد أنماط الجوع الخاصة فيك وتوزيع السعرات الحرارية المثالية لجسمك.
• تتتعرف على كيفية استجابة جسمك للشعور بالشبع وميولك لتناول الوجبات الخفيفة.
• قائمة تضم أكثر من 900 نوع من الأطعمة الموصى بها.
• خطة وجبات لمدة 100 يوم لتحقيق أهداف التحكم بالوزن.
• اختبارات عدم تحمّل جسمك للجلوتين واللاكتوز مع نصائح عملية قابلة للتطبيق.
• إرشادات الغذاء، التمارين المخصصة والمكملات المناسبة لاحتياجات جسمك.`,
    packageSubMenu
  );
  return;
}

if (id === "pkg_beauty") {
  await sendText(
    to,
`*باقة جينات الجمال والتميّز*

*ليش تختار باقة جينات الجمال والتميّز؟*
• بشرتك ما تستجيب مهما غيّرت منتجات العناية.
• تعاني من تصبغات، جفاف، أو حساسية.
• جرّبت كل الحلول وما قدرت تتخلّص من حب الشباب.
• جسمك وبشرتك يتأثرون بسرعة من التلوث أو الشمس.`
  );

  await sendList(
    to,
`*وش تقدم لك باقة جينات الجمال والتميّز؟*
• تتعرّف على قدرة بشرتك على إنتاج الكولاجين ومستويات الترطيب الطبيعي.
• حماية بشرتك من التأثّر بالشمس (الأشعة فوق البنفسجية).
• الحماية من الشيخوخة المبكرة وتقييم عمرك البيولوجي.
• كيف تساهم جيناتك في الحفاظ على بشرتك مقارنة بالآخرين.
• تفهم تحمّل بشرتك للإجهاد التأكسدي والالتهابات وعلاقته بالحساسية والمشاكل الجلدية المتكررة.
• تفهم كيف يستخدم جسمك الإنزيم Q10 لإصلاح البشرة وتعزيز حيويتها واحتياجاتك من السيلينيوم لصحة البشرة المثلى.
• منتجات مخصّصة للعناية بالبشرة (سيروم، لوشن) ومكمّلات غذائية ملائمة لاحتياجاتك.
• إزالة السموم – المرحلة الأولى: التخلّص من المركبات الهيدروكربونية العطرية متعددة الحلقات (PAHs).
• إزالة السموم – المرحلة الثانية: تحييد السموم مثل المبيدات والمعادن الثقيلة.
• تعرف على استجابة جسمك الجينية للكافيين، الكحول، والقنب مع توصيات مخصّصة.
• استراتيجيات وقائية وإرشادات غذائية مخصّصة مع أفضل مصادر لمضادات الأكسدة.
• خليط المغذيات الدقيقة المخصّص: Complete NutriMe,  وهو مزيج غذائي مصمّم وراثيًا لتحسين الامتصاصودعم صحتك على المدى الطويل.`,
    packageSubMenu
  );
  return;
}

if (id === "pkg_psych") {
  await sendText(
    to,
`*باقة جينات الانسجام النفسي*

*ليش تختار باقة جينات الانسجام النفسي؟*
• تعاني من توتر، قلق، اكتئاب، أو ضغط نفسي متكرر.
• مزاجك يتقلب وتأثيره واضح على طاقتك ونومك.
• تحس إن تركيزك منخفض أو استجابتك للتوتر أعلى من غيرك.
• يومك مليء بالالتزامات والضغوط.
• جرّبت حلول نفسية كثيرة لكن النتائج مؤقتة.`
  );

  await sendList(
    to,
`*وش تقدم لك باقة جينات الانسجام النفسي؟*
• توضح كيف تؤثر جيناتك على استجابة الجهاز العصبي للضغط والتوتر والاكتئاب.
• التعامل مع الإجهاد: تعرف على قدرتك الجينية للتعامل مع الضغوط بشكل فعال.
• المرونة العاطفية: قيّم مقاومتك للمشاعر السلبية والتحديات المرتبطة بالإجهاد.
• ميول الاندفاعية: اكتشف استعدادك للاندفاع في المواقف المليئة بالتوتر.
• تقييم مخاطر الاكتئاب: تعرف على احتمالية تعرضك للاكتئاب أو الاكتئاب المزمن.
• استجابة مضادات الاكتئاب: معلومات حول توافق جسمك مع أدوية الاكتئاب.
• توصيات مخصصة لبناء مرونة نفسية وتحسين صحتك الذهنية.`,
    packageSubMenu
  );
  return;
}

if (id === "pkg_allergy") {
  await sendText(
    to,
`*باقة الخريطة المتكاملة للحساسية*

*ليش تختار باقة الخريطة المتكاملة للحساسية؟*
• تعبت من الحكة والتهيج وكل الحلول مؤقتة.
• تعاني من حساسية متكررة وما قدرت تحدد سببها الحقيقي.
• الأعراض تظهر من أكل، روائح، أو منتجات وما عرفت المحفز.
• جرّبت فحوصات أو تجنّبت أشياء كثيرة بدون نتيجة.`
  );

  await sendList(
    to,
`*وش تقدم لك باقة الخريطة المتكاملة للحساسية؟*
• تحدد مسببات الحساسية لديك بدقة فائقة من خلال اختبار واحد شامل.
• قائمة بأكثر من 300 مادة مسببة للحساسية.
• تصميم خطة علاج فعالة تتناسب مع حساسيتك الخاصة.
• عمل إجراءات وقائية للتقليل من احتمالية حدوث ردود فعل تحسسية.
• تعديل نظامك الغذائي، أو اختيار منتجات مضادة للحساسية.`,
    packageSubMenu
  );
  return;
}

if (id === "pkg_digest") {
  await sendText(
    to,
`*باقة خريطة عدم تحمّل الجهاز الهضمي*

*ليش تختار باقة خريطة عدم تحمّل الجهاز الهضمي؟*
• تعاني من آلام بطن، انتفاخ، أو اضطرابات هضمية متكررة.
• تحس بالإرهاق أو الصداع خصوصًا بعد الأكل.
• جرّبت أنظمة أو فحوصات كثيرة بدون راحة حقيقية.`
  );

  await sendList(
    to,
`*وش تقدم لك باقة خريطة عدم تحمّل الجهاز الهضمي؟*
• فهم الأسباب الخفية للانزعاج الهضمي مثل آلام البطن، الانتفاخ، التعب، والصداع.
• تحليل استجابة الجسم لأكثر من 300 نوع من مكونات الطعام.
• تشخيص دقيق لتحديد الأطعمة المسببة للأعراض.
• بناء نظام غذائي مريح لجسمك وتحسين جودة حياتك.
• إرشادات غذائية وعلاجية مستهدفة للتعامل مع عدم التحمّل.
• إجراءات وقائية عملية تقلل أو تمنع تكرار الأعراض.
• خطط مكملات غذائية مناسبة لدعم الجهاز الهضمي.`,
    packageSubMenu
  );
  return;
}

if (id === "pkg_full") {
  await sendText(
    to,
`*الباقة الجينية الشاملة*

*ليش تختار الباقة الجينية الشاملة؟*
• أكثر من شكوى وما عرفت من وين تبدأ.
• كل ما عالجت عرض، طلع لك عرض غيره.
• صحة جسمك منظومة مترابطة وكل جزء يؤثر على الثاني.
• تحتاج دليل صحي شخصي شامل تعتمد عليه طول العمر.
• تتمنى توصل لأفضل نسخة صحية من جسمك.`
  );

  await sendList(
    to,
`*وش تقدم لك الباقة الجينية الشاملة؟*
• تجمع كل الباقات في تحليل جيني واحد شامل بدون حيرة.
• دليل شخصي لجسمك تقدر تستخدمه كمرجع لأي تخصص (تغذية، جلدية، نفسية).
• فهم أعمق لوظائف جسمك، وقدرة أعلى على اتخاذ قراراتك بثقة.
• نهاية الحيرة مع جميع الأعراض، نهاية دوامة التشخيص.
• الوصول لأفضل أسلوب حياة متناسب مع إمكانياتك واستعداداتك الصحية.`,
    packageSubMenu
  );
  return;
}

});

const PORT = process.env.PORT || 3000;
app.listen(PORT);