const express = require("express");
const bodyParser = require("body-parser");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(bodyParser.json());

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.post("/webhook", async (req, res) => {
  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) {
      return res.sendStatus(200);
    }

    const from = message.from;

    // 1️⃣ الرسالة الأولى
    await fetch("https://waba-v2.360dialog.io/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "D360-API-KEY": "aRgys95O9ImdbwRWSEvSaYDdAK"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body:
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض،
وفريقنا الطبي المتخصص موجود
عشان يشوفك بأتم صحة وعافية 💙`
        }
      })
    });

    await sleep(800);

    // 2️⃣ الرسالة الثانية + القائمة
    await fetch("https://waba-v2.360dialog.io/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "D360-API-KEY": "aRgys95O9ImdbwRWSEvSaYDdAK"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "list",
          body: {
            text:
`لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`
          },
          action: {
            button: "اختر من القائمة",
            sections: [
              {
                title: "اختر من القائمة",
                rows: [
                  { id: "about_genatek", title: "من نحن – جيناتك" },
                  { id: "what_test", title: "ما هو التحليل الجيني؟" },
                  { id: "why_test", title: "لماذا تحتاج التحليل؟" },
                  { id: "journey", title: "خطوات رحلتك معنا" },
                  { id: "after_results", title: "ماذا بعد النتائج" },
                  { id: "packages", title: "تعرّف على الباقات" },
                  { id: "start", title: "ابدأ الآن / تحدث معنا" },
                  { id: "feedback", title: "الاقتراحات / الشكاوى" }
                ]
              }
            ]
          }
        }
      })
    });

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(200);
  }
});

app.listen(3000, () => {
  console.log("Bot Genatek شغال على البورت 3000");
});
