/*
 * 🟢 2026-05-13 终极纯净版脚本
 * 配合上面的 Surge 配置使用，绝不走兜底
 */

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  'Accept-Language': 'en',
};

// 旗帜转换逻辑
function getFlag(code) {
  if (!code || code === 'XX') return '🏳️';
  return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

(async () => {
  let panel_result = {
    title: '📺 流媒体检测 ⏰ ' + new Date().toLocaleTimeString(),
    content: '',
    icon: 'sparkles.tv',
    'icon-color': '#6ebaec',
  };

  // 并发检测 Gemini 和 ChatGPT
  let [gpt, gemini] = await Promise.all([checkGPT(), checkGemini()]);
  
  panel_result.content = `${gpt}\n${gemini}`;
  $done(panel_result);
})();

async function checkGPT() {
  return new Promise((resolve) => {
    $httpClient.get("http://chat.openai.com/cdn-cgi/trace", (err, resp, data) => {
      if (err || !data) return resolve("𝑪𝒉𝒂𝒕𝑮𝑼𝑻: 检测失败 🚦");
      let loc = data.match(/loc=([A-Z]{2})/)?.[1] || 'XX';
      resolve(`𝑪𝒉𝒂𝒕𝑮𝑼𝑻: 已解锁 ➠ ${getFlag(loc)} | ${loc}`);
    });
  });
}

async function checkGemini() {
  return new Promise((resolve) => {
    // 这里的 URL 必须和 [Rule] 里的 DOMAIN 对应
    $httpClient.get({ url: 'https://gemini.google.com/app', headers: REQUEST_HEADERS }, (err, resp) => {
      if (err) return resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败 🚦");
      
      // 核心：抓取 Google 的地区识别 Header
      let loc = resp?.headers?.['x-app-region'] || resp?.headers?.['X-App-Region'] || 'XX';
      let status = (resp.status === 200) ? "已解锁" : "未解锁";
      
      resolve(`𝑮𝒆𝒎𝒊𝒏𝒊: ${status} ➠ ${getFlag(loc)} | ${loc.toUpperCase()}`);
    });
  });
}
