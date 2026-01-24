const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const CHATWOOT_INBOX_IDENTIFIER = "DQ1mXro7vP1MiqADzFuQg78";
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN;

async function sendToChatwoot(phone, text) {
  const url = `https://app.chatwoot.com/api/v1/inboxes/${CHATWOOT_INBOX_IDENTIFIER}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api_access_token": CHATWOOT_API_TOKEN
    },
    body: JSON.stringify({
      content: text,
      sender: { identifier: phone }
    })
  });

  console.log("CHATWOOT STATUS:", res.status);
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== "text") return;

  await sendToChatwoot(msg.from, msg.text.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
