/*
 * 🟢 流媒体与 AI 全能检测脚本 (Surge)
 * 2026-05-13 最终重写版
 * 1. 修复 Gemini 走 FINAL 兜底问题 (直接请求核心域名)
 * 2. 统一 AI 检测显示格式与字体
 * 3. 优化地区代码抓取逻辑
 */

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
  'Accept-Language': 'en',
};

// 状态常量
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';

// 允许解锁 ChatGPT 的地区列表
const GPT_REGIONS = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

// 旗帜转换函数
function getFlag(code) {
  if (!code || code === 'XX') return '🏳️';
  return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

Date.prototype.Format = function(fmt) {
  var o = {"H+": this.getHours(), "m+": this.getMinutes(), "s+": this.getSeconds()};
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

(async () => {
  let panel = {
    title: '📺 流媒体检测 ⏰ ' + new Date().Format("HH:mm:ss"),
    content: '',
    icon: 'sparkles.tv',
    'icon-color': '#6ebaec',
  };

  // 并发执行所有检测任务
  let results = await Promise.all([
    checkChatGPT(),
    checkGemini(),
    checkNetflix(),
    checkYoutube(),
    checkDisney()
  ]);

  panel.content = results.join('\n');
  $done(panel);
})();

// --- [AI 检测部分] ---

async function checkChatGPT() {
  return new Promise((resolve) => {
    $httpClient.get("http://chat.openai.com/cdn-cgi/trace", (err, resp, data) => {
      if (err || !data) return resolve("𝑪𝒉𝒂𝒕𝑮𝑼𝑻: 检测失败 🚦");
      let loc = data.match(/loc=([A-Z]{2})/)?.[1] || 'XX';
      let status = GPT_REGIONS.includes(loc) ? "已解锁" : "未解锁";
      resolve(`𝑪𝒉𝒂𝒕𝑮𝑼𝑻: ${status} ➠ ${getFlag(loc)} | ${loc}`);
    });
  });
}

async function checkGemini() {
  return new Promise((resolve) => {
    // 直接请求 gemini.google.com 确保走分流规则
    let opts = { url: 'https://gemini.google.com/app', headers: REQUEST_HEADERS };
    $httpClient.get(opts, (err, resp) => {
      if (err) return resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败 🚦");
      let loc = resp?.headers?.['x-app-region'] || resp?.headers?.['X-App-Region'] || 'XX';
      let status = (resp.status === 200) ? "已解锁" : "未解锁";
      resolve(`𝑮𝒆𝒎𝒊𝒏𝒊: ${status} ➠ ${getFlag(loc)} | ${loc.toUpperCase()}`);
    });
  });
}

// --- [视频流媒体部分] ---

async function checkNetflix() {
  let test = (id) => new Promise((res, rej) => {
    $httpClient.get(`https://www.netflix.com/title/${id}`, (err, resp) => {
      if (err) return rej();
      if (resp.status === 403) return rej('🚫');
      if (resp.status === 404) return res('NF');
      if (resp.status === 200) {
        let region = (resp.headers['x-originating-url']?.split('/')[3] || 'US').split('-')[0].toUpperCase();
        res(region === 'TITLE' ? 'US' : region);
      }
    });
  });

  try {
    let code = await test(81215567); // 完整版测项
    if (code === 'NF') {
      code = await test(80018499); // 自制剧测项
      return `𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 自制剧 ➠ ${getFlag(code)} | ${code}`;
    }
    return `𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 完整版 ➠ ${getFlag(code)} | ${code}`;
  } catch (e) { return "𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 不支持解锁 🚫"; }
}

async function checkYoutube() {
  return new Promise((resolve) => {
    $httpClient.get({url:'https://www.youtube.com/premium', headers: REQUEST_HEADERS}, (err, resp, data) => {
      if (err || resp.status !== 200) return resolve("𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 检测失败 🚦");
      if (data.indexOf('Premium is not available') !== -1) return resolve("𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 不支持解锁 🚫");
      let region = data.match(/"countryCode":"(.*?)"/)?.[1] || (data.indexOf('www.google.cn') !== -1 ? 'CN' : 'US');
      resolve(`𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 已解锁 ➠ ${getFlag(region)} | ${region}`);
    });
  });
}

async function checkDisney() {
  const DISNEY_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
  
  let getInfo = () => new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', 'User-Agent': DISNEY_UA },
      body: JSON.stringify({query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }', variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] }, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } }})
    };
    $httpClient.post(opts, (err, resp, data) => {
      try {
        let res = JSON.parse(data);
        resolve({
          loc: res.extensions.sdk.session.location.countryCode,
          supported: res.extensions.sdk.session.inSupportedLocation
        });
      } catch (e) { reject(); }
    });
  });

  try {
    let info = await getInfo();
    let status = info.supported ? "已解锁" : "即将登陆";
    return `𝓓𝓲𝓼𝓷𝓮𝔂+: ${status} ➠ ${getFlag(info.loc)} | ${info.loc}`;
  } catch (e) { return "𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持 🚫"; }
}
