/*
 * 综合检测脚本：节点地理信息 + 核心流媒体检测
 */
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
};

const STATUS_COMING = 2, STATUS_AVAILABLE = 1, STATUS_NOT_AVAILABLE = 0, STATUS_TIMEOUT = -1, STATUS_ERROR = -2;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
const tf = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

function getCountryFlagEmoji(countryCode) {
  if (!countryCode) return "";
  if (countryCode.toUpperCase() == 'TW') countryCode = 'CN';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

(async () => {
  let geo_info = await getGeoInfo();
  let [chatgpt_res, youtube_res, netflix_res, disney_res_raw] = await Promise.all([checkChatGPT(), check_youtube_premium(), check_netflix(), testDisneyPlus()]);

  let disney_res = disney_res_raw.status == STATUS_AVAILABLE ? `𝓓𝓲𝓼𝓷𝓮𝔂+: 已解锁 ➠ ${getCountryFlagEmoji(disney_res_raw.region)} | ${disney_res_raw.region.toUpperCase()}` : "𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持或检测失败";

  let body = {
    title: "节点信息与流媒体检测",
    content: geo_info + "\n" + "——————流媒体检测——————" + "\n" + chatgpt_res + "\n" + youtube_res + "\n" + netflix_res + "\n" + disney_res,
    icon: "network",
    "icon-color": "#f50505"
  };
  $done(body);
})();

async function getGeoInfo() {
  return new Promise((resolve) => {
    $httpClient.get("http://ip-api.com/json/?fields=8450015&lang=zh-CN", function(error, response, data) {
      if (error) { resolve("获取IP信息失败"); return; }
      let j = JSON.parse(data);
      resolve(`🗺️IP：${j.query}\n🖥️ISP：${j.isp}\n🌍地区：${getCountryFlagEmoji(j.countryCode)}${j.country} - ${j.city}\n🕗时区：${j.timezone}\n🪙货币：${j.currency}`);
    });
  });
}

async function checkChatGPT() {
  return new Promise((resolve) => {
    $httpClient.get("http://chat.openai.com/cdn-cgi/trace", function(error, response, data) {
      if (error || !data) { resolve("ChatGPT: 检测失败"); return; }
      let cf = data.split("\n").reduce((acc, line) => { let [k, v] = line.split("="); if (k) acc[k] = v; return acc; }, {});
      resolve(`ChatGPT: ${tf.indexOf(cf.loc) !== -1 ? "已解锁" : "未解锁"} ➠ ${getCountryFlagEmoji(cf.loc)} | ${cf.loc}`);
    });
  });
}

async function check_youtube_premium() {
  return new Promise((resolve) => {
    $httpClient.get({ url: 'https://www.youtube.com/premium', headers: REQUEST_HEADERS }, function(error, response, data) {
      if (error || response.status !== 200) { resolve('𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 检测失败'); return; }
      let region = /"countryCode":"(.*?)"/gm.exec(data)?.[1] || (data.indexOf('www.google.cn') !== -1 ? 'CN' : 'US');
      resolve(`𝐘𝐨𝐮𝐓𝐮𝐛𝐞: ${data.indexOf('not available') !== -1 ? '不支持' : '已解锁'} ➠ ${getCountryFlagEmoji(region)} | ${region}`);
    });
  });
}

async function check_netflix() {
  let test = (id) => new Promise((res, rej) => { $httpClient.get({ url: 'https://www.netflix.com/title/' + id, headers: REQUEST_HEADERS }, (e, r) => { if (e) rej(); if (r.status === 403) rej('limit'); if (r.status === 200) res((r.headers['x-originating-url'] || '').split('/')[3]?.split('-')[0] || 'us'); res('NF'); })});
  try { let c = await test(81215567); return `𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 完整版 ➠ ${getCountryFlagEmoji(c)} | ${c.toUpperCase()}`; } catch (e) { return e === 'limit' ? '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 仅限自制剧' : '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 检测失败'; }
}

async function testDisneyPlus() {
  return new Promise((resolve) => {
    let opts = { url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', headers: { ...REQUEST_HEADERS, Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }', variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', operatingSystem: 'macintosh', osDeviceIds: [], deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } } } }) };
    $httpClient.post(opts, (e, r, d) => { if (e || r.status !== 200) return resolve({status: STATUS_ERROR}); let sdk = JSON.parse(d)?.extensions?.sdk; resolve({ inSupportedLocation: sdk?.session.inSupportedLocation, region: sdk?.session.location.countryCode, status: STATUS_AVAILABLE }); });
  });
}