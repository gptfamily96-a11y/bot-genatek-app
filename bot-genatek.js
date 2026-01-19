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
  { id: "1", title: "1" },
  { id: "2", title: "2" },
  { id: "3", title: "3" }
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
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: "1" },
        action: {
          button: "1",
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

    await send({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: id }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
