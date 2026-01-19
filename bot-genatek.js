const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

const API_URL = "https://waba-v2.360dialog.io/messages";
const API_KEY = process.env.DIALOG360_API_KEY;

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

app.post("/webhook", (req, res) => {
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  res.sendStatus(200);

  (async () => {
    if (message.type === "text") {
      await sendList(
        from,
        "اختر من القائمة:",
        mainMenu
      );

      await sleep(1500);

      await sendText(from,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول
