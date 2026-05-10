/*
 * 综合检测脚本 (liumeiti.js)
 */
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
};

function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  let code = countryCode.toUpperCase();
  if (code === 'TW') code = 'CN';
  return String.fromCodePoint(...code.split('').map(char => 127397 + char.charCodeAt()));
}

(async () => {
  // 并行请求：地理信息 + 三大流媒体 + ChatGPT
  let [geo, chatgpt, youtube, netflix, disney] = await Promise.all([
    getGeo(), checkGPT(), checkYT(), checkNF(), checkDP()
  ]);

  $done({
    title: "节点信息与流媒体检测",
    content: geo + "\n——————流媒体检测——————\n" + chatgpt + "\n" + youtube + "\n" + netflix + "\n" + disney,
    icon: "network",
    "icon-color": "#f50505"
  });
})();

async function getGeo() {
  return new Promise((res) => {
    $httpClient.get("http://ip-api.com/json/?fields=8450015&lang=zh-CN", (err, resp, data) => {
      if (err) return res("IP信息获取失败");
      let j = JSON.parse(data);
      res(`🗺️IP：${j.query}\n🖥️ISP：${j.isp}\n🌍地区：${getFlagEmoji(j.countryCode)}${j.country} - ${j.city}\n🪙货币：${j.currency}`);
    });
  });
}

async function checkGPT() {
  return new Promise((res) => {
    $httpClient.get("http://chat.openai.com/cdn-cgi/trace", (err, resp, data) => {
      if (err || !data) return res("ChatGPT: 检测失败");
      let loc = data.split("\n").find(l => l.startsWith("loc=")).split("=")[1];
      res(`ChatGPT: 已解锁 ➠ ${getFlagEmoji(loc)} | ${loc}`);
    });
  });
}

async function checkYT() {
  return new Promise((res) => {
    $httpClient.get({url:'https://www.youtube.com/premium', headers:REQUEST_HEADERS}, (err, resp, data) => {
      if (err || resp.status !== 200) return res("𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 检测失败");
      let reg = /"countryCode":"(.*?)"/.exec(data)?.[1] || "US";
      res(`𝐘𝐨𝐮𝐓𝐮𝐛𝐞: ${data.indexOf('not available')>-1?'不支持':'已解锁'} ➠ ${getFlagEmoji(reg)} | ${reg}`);
    });
  });
}

async function checkNF() {
  return new Promise((res) => {
    $httpClient.get({url:'https://www.netflix.com/title/81215567', headers:REQUEST_HEADERS}, (err, resp) => {
      if (err) return res("𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 检测失败");
      if (resp.status === 200) res(`𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 完整版 ➠ ${getFlagEmoji(resp.headers['x-originating-url']?.split('/')[3]?.split('-')[0]||'US')}`);
      else res(resp.status === 403 ? "𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 仅限自制剧" : "𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 不支持");
    });
  });
}

async function checkDP() {
  return new Promise((res) => {
    let opts = { url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', headers: { ...REQUEST_HEADERS, Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }', variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', operatingSystem: 'macintosh', osDeviceIds: [], deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } } } }) };
    $httpClient.post(opts, (err, resp, data) => {
      if (err || resp.status !== 200) return res("𝓓𝓲𝓼𝓷𝓮𝔂+: 检测失败");
      let sdk = JSON.parse(data)?.extensions?.sdk;
      res(`𝓓𝓲𝓼𝓷𝓮𝔂+: ${sdk?.session.inSupportedLocation?'已解锁':'未支持'} ➠ ${getFlagEmoji(sdk?.session.location.countryCode)}`);
    });
  });
}
