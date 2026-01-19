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

const mainMenu = [
  { id: "about_genatek", title: "من نحن – جيناتك" },
  { id: "what_test", title: "ما هو التحليل الجيني؟" },
  { id: "why_test", title: "لماذا تحتاج التحليل الجيني؟" },
  { id: "journey_steps", title: "خطوات رحلتك معنا" },
  { id: "after_results", title: "ماذا بعد ظهور النتائج؟" },
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن / تحدث مع مختص" },
  { id: "feedback", title: "الاقتراحات / الشكاوى" }
];

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const to = msg.from;

  if (msg.type === "text") {
    await send({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text:
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض
ورحلة التشخيص الطويلة،
وفريقنا الطبي موجود
عشان نشوفك بأتم صحة وعافية.

اختر من القائمة التالية:`
        },
        action: {
          button: "اختر من القائمة",
          sections: [{ rows: mainMenu }]
        }
      }
    });
  }

  if (msg.type === "interactive") {
    const id = msg.interactive.list_reply.id;

    if (id === "about_genatek") {
      await send({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body:
`جيناتك من أوائل العلامات السعودية المتخصصة في مجال الطب الجيني،
تعمل تحت إشراف كادر طبي متميز.
تقدّم تحاليل DNA تساعدك تفهم صحتك من الجذور
وإنهاء رحلة التشخيص الطويلة.`
        }
      });
    }
  }
});

app.listen(process.env.PORT || 3000);
