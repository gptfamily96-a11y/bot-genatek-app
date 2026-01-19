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
          sections: [{ rows }]
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

    if (message.type === "interactive") {
      const id = message.interactive?.list_reply?.id;

      if (id === "about_genatek") {
        await sendText(from,
`جيناتك من أوائل العلامات السعودية المتخصصة في مجال الطب الجيني،
تعمل تحت إشراف كادر طبي متميز.
تقدّم مجموعة من التحاليل الجينية DNA،
تساعدك على فهم صحتك من الجذور
وإنهاء رحلة التشخيص الطويلة.`);

        await sleep(1500);

        await sendList(from, "تقدر تكمل من الخيارات التالية:", [
          { id: "main_menu", title: "العودة للقائمة الرئيسية" }
        ]);

        return res.sendStatus(200);
      }
    }

    if (message.type === "text") {
      await sendText(from,
`أهلاً بك في جيناتك 🌱
مستعد تتعرّف على جسمك لأول مرة؟ ✨

جيناتك يعرف حيرتك مع دوامة الأعراض
ورحلة التشخيص الطويلة،
فريقنا الطبي موجود
عشان نشوفك بأتم صحة وعافية`);

      await sleep(2000);

      await sendList(from,
`لا تتردد في أي سؤال يخطر على بالك،
وتقدر تتعرّف علينا أكثر
من خلال القوائم التالية:`,
        [
          { id: "about_genatek", title: "من نحن – جيناتك" }
        ]
      );

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch {
    return res.sendStatus(200);
  }
});

app.listen(process.env.PORT || 3000);
