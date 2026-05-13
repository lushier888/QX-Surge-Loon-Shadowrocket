/*
Egern AI 解锁检测 Widget
支持:
- 𝑪𝒉𝒂𝒕𝑮𝑷𝑻
- 𝑮𝒆𝒎𝒊𝒏𝒊
- Claude
- Copilot
- Perplexity

适用于:
- Egern Script Widget
*/

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9"
};

// 国旗
function flag(code) {

  if (!code) return "🏳️";

  return String.fromCodePoint(
    ...[...code.toUpperCase()].map(
      c => 127397 + c.charCodeAt()
    )
  );

}

// ChatGPT
async function checkChatGPT() {

  try {

    const resp = await fetch(
      "https://chat.openai.com/cdn-cgi/trace",
      {
        headers
      }
    );

    const text = await resp.text();

    const locMatch =
      text.match(/loc=([A-Z]+)/);

    const loc =
      locMatch?.[1] || "US";

    return `𝑪𝒉𝒂𝒕𝑮𝑷𝑻  ✅  ${flag(loc)} ${loc}`;

  } catch(e) {

    return `𝑪𝒉𝒂𝒕𝑮𝑷𝑻  ❌`;

  }

}

// Gemini
async function checkGemini() {

  try {

    const resp = await fetch(
      "https://gemini.google.com/app",
      {
        headers,
        redirect: "follow"
      }
    );

    const text = await resp.text();

    // 已解锁
    if (
      resp.status === 200 &&
      (
        text.includes("Gemini") ||
        text.includes("Google AI")
      )
    ) {

      return `𝑮𝒆𝒎𝒊𝒏𝒊     ✅`;

    }

    // 地区限制
    if (
      resp.status === 403 ||
      text.includes("unsupported country") ||
      text.includes("not available")
    ) {

      return `𝑮𝒆𝒎𝒊𝒏𝒊     ❌`;

    }

    return `𝑮𝒆𝒎𝒊𝒏𝒊     ⚠️ ${resp.status}`;

  } catch(e) {

    return `𝑮𝒆𝒎𝒊𝒏𝒊     ❌`;

  }

}

// Claude
async function checkClaude() {

  try {

    const resp = await fetch(
      "https://claude.ai",
      {
        headers
      }
    );

    if (
      resp.status === 200 ||
      resp.status === 302
    ) {

      return `Claude      ✅`;

    }

    return `Claude      ❌`;

  } catch(e) {

    return `Claude      ❌`;

  }

}

// Copilot
async function checkCopilot() {

  try {

    const resp = await fetch(
      "https://copilot.microsoft.com",
      {
        headers
      }
    );

    if (
      resp.status === 200 ||
      resp.status === 302
    ) {

      return `Copilot     ✅`;

    }

    return `Copilot     ❌`;

  } catch(e) {

    return `Copilot     ❌`;

  }

}

// Perplexity
async function checkPerplexity() {

  try {

    const resp = await fetch(
      "https://www.perplexity.ai",
      {
        headers
      }
    );

    if (
      resp.status === 200 ||
      resp.status === 302
    ) {

      return `Perplexity  ✅`;

    }

    return `Perplexity  ❌`;

  } catch(e) {

    return `Perplexity  ❌`;

  }

}

// 主程序
(async () => {

  const results = await Promise.all([

    checkChatGPT(),

    checkGemini(),

    checkClaude(),

    checkCopilot(),

    checkPerplexity()

  ]);

  const content = results.join("\n");

  $done({

    title: "🤖 AI 解锁检测",

    content,

    icon: "brain.head.profile",

    "icon-color": "#7B68EE"

  });

})();