const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

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

async function logToSheet() {
  // ملغية – لا نسوي شي
  return;
}

module.exports = {
  setState,
  getState,
  clearState,
  setPackage,
  getPackage,
  logToSheet
};
