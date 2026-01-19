const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function sendText(to, body) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "D360-API-KEY": API_KEY
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });
}

async function sendList(to, bodyText, rows) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "D360-API-KEY": API_KEY
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: "اختر من القائمة",
          sections: [
            {
              title: "القائمة",
              rows
            }
          ]
        }
      }
    })
  });
}

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;

    if (message.type === "text") {
      await sendText(
        from,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض
ورحلة التشخيص الطويلة،
فريقنا الطبي موجود
عشان نشوفك بأتم صحة وعافية`
      );

      await sleep(700);

      await sendList(
        from,
`لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`,
        [
          { id: "about_genatek", title: "من نحن – جيناتك" },
          { id: "what_test", title: "ما هو التحليل الجيني؟" },
          { id: "why_test", title: "لماذا تحتاج التحليل الجيني؟" },
          { id: "journey_steps", title: "خطوات رحلتك معنا" },
          { id: "after_results", title: "ماذا بعد ظهور النتائج؟" },
          { id: "packages", title: "تعرّف على الباقات" },
          { id: "start", title: "ابدأ الآن / تحدث مع مختص" },
          { id: "feedback", title: "الاقتراحات / الشكاوى" }
        ]
      );

      return res.sendStatus(200);
    }

    if (
      message.type === "interactive" &&
      message.interactive?.list_reply?.id === "about_genatek"
    ) {
      await sendText(
        from,
`جيناتك من أوائل العلامات السعودية المتخصصة في مجال الطب الجيني،
تعمل تحت إشراف كادر طبي متميز.
تقدّم مجموعة من التحاليل الجينية DNA،
تساعدك على فهم صحتك من الجذور
وإنهاء رحلة التشخيص الطويلة.`
      );

      await sleep(700);

      await sendText(
        from,
`ولأنك راحتك أولوية، نجيك لين البيت!
تبدأ رحلتك معنا من المنزل؛
مندوبنا يجيك لاستلام العينة،
ونرسل لك النتائج لين عندك!`
      );

      await sleep(700);

      await sendText(
        from,
`نقدم لك في جيناتك جلسة استشارية خاصة مع فريقنا الطبي المتخصص،
لشرح نتائج التحاليل وبناء قراراتك الصحية.`
      );

      await sleep(700);

      await sendText(
        from,
`ولسى ما انتبهت الرحلة!
نوفر لك منتجات مصمّمة خصيصًا
حسب طبيعة جيناتك لتحقيق أفضل استجابة
وبخيار شراء مباشر`
      );

      await sleep(700);

      await sendText(
        from,
`جيناتك مو مجرد فحص
هي تجربة صحية متكاملة باحترافية عالية وخصوصية تامة..`
      );

      await sleep(700);

      await sendList(
        from,
        "تقدر تكمل من الخيارات التالية:",
        [
          { id: "packages", title: "تعرّف على الباقات" },
          { id: "journey_steps", title: "خطوات رحلتك معنا" },
          { id: "main_menu", title: "العودة للقائمة الرئيسية" }
        ]
      );

      return res.sendStatus(200);
    }

    if (message.type === "interactive") {
      const id = message.interactive?.list_reply?.id;

      if (id === "main_menu") {
        await sendList(
          from,
          "اختر من القائمة الرئيسية:",
          [
            { id: "about_genatek", title: "من نحن – جيناتك" },
            { id: "what_test", title: "ما هو التحليل الجيني؟" },
            { id: "why_test", title: "لماذا تحتاج التحليل الجيني؟" },
            { id: "journey_steps", title: "خطوات رحلتك معنا" },
            { id: "after_results", title: "ماذا بعد ظهور النتائج؟" },
            { id: "packages", title: "تعرّف على الباقات" },
            { id: "start", title: "ابدأ الآن / تحدث مع مختص" },
            { id: "feedback", title: "الاقتراحات / الشكاوى" }
          ]
        );
        return res.sendStatus(200);
      }
    }

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(200);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Bot Genatek running");
});
