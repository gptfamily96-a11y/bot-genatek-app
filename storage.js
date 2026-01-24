const Redis = require("ioredis");
const { google } = require("googleapis");

const redis = new Redis(process.env.REDIS_URL);

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

async function setState(phone, state) {
  await redis.set(`state:${phone}`, state);
}

async function getState(phone) {
  return await redis.get(`state:${phone}`);
}

async function clearState(phone) {
  await redis.del(`state:${phone}`);
}

async function setPackage(phone, pkg) {
  await redis.set(`package:${phone}`, pkg);
}

async function getPackage(phone) {
  return await redis.get(`package:${phone}`);
}

async function logToSheet(phone, name, action) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:D",
    valueInputOption: "RAW",
    requestBody: {
      values: [[phone, name, action, new Date().toISOString()]]
    }
  });
}

module.exports = {
  setState,
  getState,
  clearState,
  setPackage,
  getPackage,
  logToSheet
};
