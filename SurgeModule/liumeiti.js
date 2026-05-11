const panel = {
  title: "流媒体 & AI 解锁",
  content: [],
  icon: "play.tv.fill",
  "icon-color": "#FF9500"
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";

function request(url) {
  return new Promise((resolve) => {
    $httpClient.get(
      {
        url,
        headers: {
          "User-Agent": UA
        }
      },
      (err, resp, body) => {
        resolve({
          err,
          resp,
          body
        });
      }
    );
  });
}

(async () => {
  const result = await Promise.all([
    netflix(),
    disney(),
    youtube(),
    hbo(),
    chatgpt(),
    gemini()
  ]);

  panel.content = result.join("\n");

  $done(panel);
})();

async function netflix() {
  const { err, resp } = await request(
    "https://www.netflix.com/title/81215567"
  );

  if (err) return "Netflix   ❌";

  let region = "UNKNOWN";

  const url =
    resp.headers["x-originating-url"];

  if (url) {
    const match = url.match(/\/([a-z]{2})\//i);

    if (match) {
      region = match[1].toUpperCase();
    }
  }

  if (resp.status === 200) {
    return `Netflix   ✅ Full (${region})`;
  }

  if (resp.status === 404) {
    return `Netflix   ⚠️ Originals (${region})`;
  }

  return `Netflix   ❌`;
}

async function disney() {
  const { err, body } = await request(
    "https://www.disneyplus.com"
  );

  if (err) return "Disney+  ❌";

  const region =
    body.match(/Region: ([A-Z]{2})/)?.[1] ||
    body.match(/"countryCode":"(.*?)"/)?.[1] ||
    "UNKNOWN";

  if (
    body.includes("disneyplus") ||
    body.includes("Disney+")
  ) {
    return `Disney+  ✅ (${region})`;
  }

  return "Disney+  ❌";
}

async function youtube() {
  const { err, body } = await request(
    "https://www.youtube.com/premium"
  );

  if (err) return "YouTube  ❌";

  const region =
    body.match(/"countryCode":"(.*?)"/)?.[1] ||
    "UNKNOWN";

  if (
    body.includes(
      "YouTube and YouTube Music ad-free"
    )
  ) {
    return `YouTube  ✅ Premium (${region})`;
  }

  return `YouTube  ❌ (${region})`;
}

async function hbo() {
  const { err, body } = await request(
    "https://play.max.com"
  );

  if (err) return "HBO Max  ❌";

  const region =
    body.match(/"country":"(.*?)"/)?.[1] ||
    "UNKNOWN";

  if (
    body.includes("Max") ||
    body.includes("play.max")
  ) {
    return `HBO Max  ✅ (${region})`;
  }

  return "HBO Max  ❌";
}

async function chatgpt() {
  const { err, body } = await request(
    "https://chat.openai.com/cdn-cgi/trace"
  );

  if (err) return "ChatGPT  ❌";

  const region =
    body.match(/loc=([A-Z]+)/)?.[1] ||
    "UNKNOWN";

  return `ChatGPT  ✅ (${region})`;
}

async function gemini() {
  const { err, body } = await request(
    "https://gemini.google.com"
  );

  if (err) return "Gemini   ❌";

  const region =
    body.match(/"countryCode":"(.*?)"/)?.[1] ||
    "UNKNOWN";

  if (
    body.includes("Gemini") ||
    body.includes("bard")
  ) {
    return `Gemini   ✅ (${region})`;
  }

  return "Gemini   ❌";
}