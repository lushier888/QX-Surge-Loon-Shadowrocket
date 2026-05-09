/*
 * 综合检测面板：节点信息 + 流媒体检测
 * 包含：IP、ISP、ASN、地理位置、时区、经纬度、货币
 * 包含：ChatGPT、YouTube Premium、Netflix、Disney+ 检测
 */

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
};

// 状态常量
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';

// ChatGPT 检测列表
const tf = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

// 格式化时间
Date.prototype.Format = function(fmt) {
  var o = {
    "H+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

// 获取国旗 Emoji
function getCountryFlagEmoji(countryCode) {
  if (!countryCode) return "";
  if (countryCode.toUpperCase() == 'TW') countryCode = 'CN';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

(async () => {
  // 1. 获取地理位置信息 (ip-api)
  let geo_info = await getGeoInfo();
  
  // 2. 并行获取流媒体检测结果
  let [chatgpt_res, youtube_res, netflix_res, disney_res_raw] = await Promise.all([
    checkChatGPT(),
    check_youtube_premium(),
    check_netflix(),
    testDisneyPlus()
  ]);

  // 3. 处理 Disney+ 文本
  let disney_res = "";
  if (disney_res_raw.status == STATUS_COMING) {
    disney_res = "𝓓𝓲𝓼𝓷𝓮𝔂+: 即将登陆 ➠ " + `${getCountryFlagEmoji(disney_res_raw.region)} | ` + disney_res_raw.region.toUpperCase();
  } else if (disney_res_raw.status == STATUS_AVAILABLE) {
    disney_res = "𝓓𝓲𝓼𝓷𝓮𝔂+: 已解锁 ➠ " + `${getCountryFlagEmoji(disney_res_raw.region)} | ` + disney_res_raw.region.toUpperCase();
  } else if (disney_res_raw.status == STATUS_NOT_AVAILABLE) {
    disney_res = "𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持 🚫 ";
  } else if (disney_res_raw.status == STATUS_TIMEOUT) {
    disney_res = "𝓓𝓲𝓼𝓷𝓮𝔂+: 检测超时 🚦";
  } else {
    disney_res = "𝓓𝓲𝓼𝓷𝓮𝔂+: 检测失败 ❌";
  }

  // 4. 组合最终面板
  let body = {
    title: "节点信息与流媒体检测",
    content: geo_info + "\n" + "——————流媒体检测——————" + "\n" + chatgpt_res + "\n" + youtube_res + "\n" + netflix_res + "\n" + disney_res,
    icon: "network",
    "icon-color": "#f50505"
  };

  $done(body);
})();

// --- 功能函数 ---

async function getGeoInfo() {
  return new Promise((resolve) => {
    let url = "http://ip-api.com/json/?fields=8450015&lang=zh-CN";
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        resolve("获取IP信息失败");
        return;
      }
      let j = JSON.parse(data);
      let emoji = getCountryFlagEmoji(j.countryCode);
      let info = `🗺️IP：${j.query}\n🖥️ISP：${j.isp}\n#️⃣ASN：${j.as}\n🌍地区：${emoji}${j.country} - ${j.city}\n🕗时区：${j.timezone}\n📍经纬：${j.lon},${j.lat}\n🪙货币：${j.currency}`;
      resolve(info);
    });
  });
}

async function checkChatGPT() {
  return new Promise((resolve) => {
    let url = "http://chat.openai.com/cdn-cgi/trace";
    $httpClient.get(url, function(error, response, data) {
      if (error || !data) {
        resolve("ChatGPT: 检测失败");
        return;
      }
      let lines = data.split("\n");
      let cf = lines.reduce((acc, line) => {
        let [key, value] = line.split("=");
        if (key) acc[key] = value;
        return acc;
      }, {});
      let loc = getCountryFlagEmoji(cf.loc) + ' | ' + cf.loc;
      let status = tf.indexOf(cf.loc) !== -1 ? "已解锁" : "未解锁";
      resolve(`ChatGPT: ${status} ➠ ${loc}`);
    });
  });
}

async function check_youtube_premium() {
  return new Promise((resolve) => {
    let option = { url: 'https://www.youtube.com/premium', headers: REQUEST_HEADERS };
    $httpClient.get(option, function(error, response, data) {
      if (error || response.status !== 200) {
        resolve('𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 检测失败');
        return;
      }
      if (data.indexOf('Premium is not available in your country') !== -1) {
        resolve('𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 不支持解锁');
        return;
      }
      let region = 'US';
      let res = /"countryCode":"(.*?)"/gm.exec(data);
      if (res && res.length === 2) region = res[1];
      else if (data.indexOf('www.google.cn') !== -1) region = 'CN';
      resolve(`𝐘𝐨𝐮𝐓𝐮𝐛𝐞: 已解锁 ➠ ${getCountryFlagEmoji(region)} | ${region.toUpperCase()}`);
    });
  });
}

async function check_netflix() {
  let test = (filmId) => {
    return new Promise((resolve, reject) => {
      $httpClient.get({ url: 'https://www.netflix.com/title/' + filmId, headers: REQUEST_HEADERS }, function(e, r, d) {
        if (e) reject('Error');
        if (r.status === 403) reject('Not Available');
        if (r.status === 404) resolve('Not Found');
        if (r.status === 200) {
          let url = r.headers['x-originating-url'] || '';
          let reg = url.split('/')[3] || 'us';
          if (reg.indexOf('-') > -1) reg = reg.split('-')[0];
          resolve(reg === 'title' ? 'us' : reg);
        }
        reject('Error');
      });
    });
  };

  try {
    let code = await test(81215567);
    if (code === 'Not Found') code = await test(80018499);
    if (code === 'Not Found') return '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 不支持解锁';
    return `𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 完整版 ➠ ${getCountryFlagEmoji(code)} | ${code.toUpperCase()}`;
  } catch (e) {
    return e === 'Not Available' ? '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 仅限自制剧' : '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: 检测失败';
  }
}

async function testDisneyPlus() {
  try {
    let { countryCode, inSupportedLocation } = await getLocationInfo();
    let region = countryCode || "未知";
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING };
    } else {
      return { region, status: STATUS_AVAILABLE };
    }
  } catch (error) {
    return { status: error === 'Timeout' ? STATUS_TIMEOUT : STATUS_ERROR };
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: { ...REQUEST_HEADERS, Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', operatingSystem: 'macintosh', osDeviceIds: [], deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } } }
      })
    };
    $httpClient.post(opts, (error, response, data) => {
      if (error || response.status !== 200) return reject('Error');
      let j = JSON.parse(data);
      let sdk = j?.extensions?.sdk;
      if (!sdk) return reject('Not Available');
      resolve({ inSupportedLocation: sdk.session.inSupportedLocation, countryCode: sdk.session.location.countryCode });
    });
  });
}
