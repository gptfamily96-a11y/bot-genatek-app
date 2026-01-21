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

const packageSubMenu = [
  { id: "start", title: "ابدأ الآن / تحدث معنا" },
  { id: "back_packages", title: "العودة لقائمة الباقات" },
  { id: "main_menu", title: "العودة للقائمة الرئيسية" }
];

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;

  if (msg.type === "interactive") {
    const id = msg.interactive.list_reply.id;

    if (id === "pkg_afiya") {
      await sendText(to,
`*باقة الصحة الشاملة، تحسين الوزن والتغذية المخصّصة*

*ليش تختار العافية 360؟*
• جرّبت أنظمة غذائية كثيرة وما نفعت
• صعب تتحكم في وزنك مهما حاولت
• تحتاج مرجع غذائي ونمط حياة يناسب جسمك بكل تفاصيله`
      );
      await sendText(to,
`*وش تقدم لك باقة العافية 360؟*
• تحسين التغذية: كيف يتعامل جسمك مع الدهون، الكربوهيدرات، والبروتينات
• استراتيجية مخصّصة لتقليل السعرات، الرياضة، وحماية الكتلة العضلية
• تحديد أنماط الجوع وتوزيع السعرات المثالية
• استجابة الشبع والميول للوجبات الخفيفة
• أكثر من 900 نوع من الأطعمة الموصى بها
• خطة وجبات 100 يوم للتحكم بالوزن
• اختبارات عدم تحمّل الجلوتين واللاكتوز
• إرشادات غذائية، تمارين، ومكملات مخصّصة`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }

    if (id === "pkg_beauty") {
      await sendText(to,
`*ليش تختار باقة جينات الجمال والتميّز؟*
• بشرتك ما تستجيب مهما غيّرت منتجات العناية
• تصبغات، جفاف، أو حساسية
• حب شباب مستمر بدون نتيجة
• تأثر سريع بالشمس أو التلوث`
      );
      await sendText(to,
`*وش تقدم لك؟*
• تحليل الكولاجين والترطيب
• استجابة الأشعة فوق البنفسجية
• تقييم الشيخوخة والعمر البيولوجي
• مقارنة صحة البشرة جينيًا
• الالتهابات والإجهاد التأكسدي
• تحليل Q10 والسيلينيوم
• منتجات ومكملات مخصّصة
• إزالة السموم (مرحلتين)
• توصيات غذائية ومضادات أكسدة
• Complete NutriMe`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }

    if (id === "pkg_psych") {
      await sendText(to,
`*ليش تختار باقة جينات الانسجام النفسي؟*
• توتر، قلق، اكتئاب متكرر
• تقلب مزاج ونوم غير مستقر
• تركيز منخفض وحساسية للتوتر
• ضغوط يومية
• حلول مؤقتة بدون استقرار`
      );
      await sendText(to,
`*وش تقدم لك؟*
• تأثير الجينات على الجهاز العصبي
• التعامل مع الإجهاد
• المرونة العاطفية
• الاندفاعية
• مخاطر الاكتئاب
• توافق مضادات الاكتئاب
• توصيات ذهنية مخصّصة`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }

    if (id === "pkg_allergy") {
      await sendText(to,
`*ليش تختارها؟*
• حكة وتهيّج مستمر
• حساسية بدون سبب واضح
• أعراض مرتبطة بالأكل أو المنتجات
• تجارب كثيرة بدون نتيجة`
      );
      await sendText(to,
`*وش تقدم لك؟*
• تحديد دقيق لمسببات الحساسية
• أكثر من 300 مادة مسببة
• خطة علاج مخصّصة
• إجراءات وقائية
• تعديل النظام الغذائي`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }

    if (id === "pkg_digest") {
      await sendText(to,
`*ليش تختارها؟*
• آلام وانتفاخ واضطرابات هضمية
• إرهاق أو صداع بعد الأكل
• تجارب بدون تحسّن`
      );
      await sendText(to,
`*وش تقدم لك؟*
• تحليل 300 مكوّن غذائي
• تشخيص دقيق للأطعمة
• نظام غذائي مريح
• إرشادات علاجية
• إجراءات وقائية
• مكملات داعمة`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }

    if (id === "pkg_full") {
      await sendText(to,
`*ليش تختارها؟*
• أعراض متداخلة
• حيرة مستمرة
• جسمك منظومة مترابطة
• تحتاج دليل صحي شامل
• هدفك أفضل نسخة صحية منك`
      );
      await sendText(to,
`*وش تقدم لك؟*
• جميع الباقات في تحليل واحد
• دليل صحي دائم
• فهم أعمق لجسمك
• قرارات أوضح بثقة
• نهاية الحيرة
• أسلوب حياة متوازن`
      );
      await sendList(to, "اختر الخطوة التالية:", packageSubMenu);
      return;
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
