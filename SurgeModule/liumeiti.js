/*
Surge Panel - Media & AI Unlock Checker
支持：
Disney+
YouTube Premium
Netflix
HBO Max
ChatGPT
Gemini

显示：
- 解锁 / 未解锁
- 地区
- Netflix 全解 / 自制
*/

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";

(async () => {
  const result = await Promise.all([
    netflix(),
    disney(),
    youtube(),
    hbo(),
    chatgpt(),
    gemini()
  ]);

  $done({
    title: "流媒体 & AI 解锁检测",
    content: result.join("\n"),
    icon: "sparkles.tv.fill",
    "icon-color": "#FF9500"
  });
})();

function get(options) {
  return new Promise((resolve) => {
    $httpClient.get(options, (err, resp, body) => {
      resolve({ err, resp, body });
    });
  });
}

// Netflix
async function netflix() {
  const { err, resp, body } = await get({
    url: "https://www.netflix.com/title/81215567",
    headers: { "User-Agent": UA }
  });

  if (err) return "Netflix   ❌ 网络错误";

  const region = resp.headers["x-originating-url"]
    ? resp.headers["x-originating-url"].match(/\/([a-z]{2})\//i)
    : null;

  const loc = region ? region[1].toUpperCase() : "UNKNOWN";

  if (resp.status === 200)
    return `Netflix   ✅ 全解 (${loc})`;

  if (resp.status === 404)
    return `Netflix   ⚠️ 仅自制 (${loc})`;

  return `Netflix   ❌ 未解锁`;
}

// Disney+
async function disney() {
  const { err, body } = await get({
    url: "https://www.disneyplus.com",
    headers: { "User-Agent": UA }
  });

  if (err) return "Disney+  ❌ 网络错误";

  const region =
    body.match(/"region":"(.*?)"/)?.[1] ||
    body.match(/"countryCode":"(.*?)"/)?.[1];

  if (body.includes("disneyplus"))
    return `Disney+  ✅ ${region || "UNKNOWN"}`;

  return "Disney+  ❌ 未解锁";
}

// YouTube
async function youtube() {
  const { err, body } = await get({
    url: "https://www.youtube.com/premium",
    headers: { "User-Agent": UA }
  });

  if (err) return "YouTube  ❌ 网络错误";

  const region =
    body.match(/"countryCode":"(.*?)"/)?.[1];

  if (
    body.includes(
      "YouTube and YouTube Music ad-free"
    )
  ) {
    return `YouTube  ✅ Premium (${region || "UNKNOWN"})`;
  }

  return `YouTube  ❌ 未解锁`;
}

// HBO Max
async function hbo() {
  const { err, body } = await get({
    url: "https://play.max.com",
    headers: { "User-Agent": UA }
  });

  if (err) return "HBO Max  ❌ 网络错误";

  const region =
    body.match(/"country":"(.*?)"/)?.[1];

  if (body.includes("Max")) {
    return `HBO Max  ✅ ${region || "UNKNOWN"}`;
  }

  return "HBO Max  ❌ 未解锁";
}

// ChatGPT
async function chatgpt() {
  const { err, body } = await get({
    url: "https://chat.openai.com/cdn-cgi/trace",
    headers: { "User-Agent": UA }
  });

  if (err) return "ChatGPT  ❌ 网络错误";

  const region = body.match(/loc=([A-Z]+)/)?.[1];

  return `ChatGPT  ✅ ${region || "UNKNOWN"}`;
}

// Gemini
async function gemini() {
  const { err, body } = await get({
    url: "https://gemini.google.com",
    headers: { "User-Agent": UA }
  });

  if (err) return "Gemini   ❌ 网络错误";

  const region =
    body.match(/"countryCode":"(.*?)"/)?.[1];

  if (body.includes("Gemini")) {
    return `Gemini   ✅ ${region || "UNKNOWN"}`;
  }

  return "Gemini   ❌ 未解锁";
}