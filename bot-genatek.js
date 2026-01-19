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
  { id: "about", title: "من نحن – جيناتك" },
  { id: "what", title: "ما هو التحليل الجيني؟" },
  { id: "why", title: "لماذا تحتاج التحليل الجيني؟" },
  { id: "steps", title: "خطوات رحلتك معنا" },
  { id: "after", title: "ماذا بعد ظهور النتائج؟" },
  { id: "packages", title: "تعرّف على الباقات" },
  { id: "start", title: "ابدأ الآن / تحدث مع مختص" },
  { id: "feedback", title: "الاقتراحات / الشكاوى" }
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
    await send({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: "أهلاً بك 👋" }
    });

    await send({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: "اختر من القائمة التالية:" }
    });

    await send({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: "القائمة الرئيسية" },
        action: {
          button: "اختر",
          sections: [
            {
              rows: mainMenu
            }
          ]
        }
      }
    });
  }

  if (msg.type === "interactive") {
    const id = msg.interactive.list_reply.id;
    const selected = mainMenu.find(r => r.id === id);

    if (selected) {
      await send({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: selected.title }
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
