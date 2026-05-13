/*
 * 由@LucaLin233编写
 * 原脚本地址：https://raw.githubusercontent.com/LucaLin233/Luca_Conf/main/Surge/JS/stream-all.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.07.22
 * 版本：2.3
 * 由bigmom2012修改
 * 更新日期：2022-07-30 11:28
 * 更新日期：2024-07-04 21:28
 * 增加 Gemini 检测并修改字体
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

let url = "http://chat.openai.com/cdn-cgi/trace";
let tf=["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];
let tff=["plus","on"];

// 处理 argument 参数
let titlediy, icon, iconerr, iconColor, iconerrColor;
if (typeof $argument !== 'undefined') {
  const args = $argument.split('&');
  for (let i = 0; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key === 'title') {
      titlediy = value;
    } else if (key === 'icon') {
      icon = value;
    } else if (key === 'iconerr') {
      iconerr = value;
    } else if (key === 'icon-color') {
      iconColor = value;
    } else if (key === 'iconerr-color') {
      iconerrColor = value;
    }
  }
}

// 获取国旗 Emoji 函数
function getCountryFlagEmoji(countryCode) {
  if (!countryCode || countryCode === 'XX') return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

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

(async () => {
  let panel_result = {
    title: '📺 流媒体检测 ⏰ ' + new Date().Format("HH:mm:ss"),
    content: '',
    icon: '4k.tv.fill',
    'icon-color': '#f20c00',
  };

  // 并发检测所有项
  let [chatgpt_result, gemini_result, disney_data, youtube_result, netflix_result] = await Promise.all([
    checkChatGPT(),
    checkGemini(),
    testDisneyPlus(),
    check_youtube_premium(),
    check_netflix()
  ]);

  let { region, status } = disney_data;
  let disney_result = "";
  if (status == STATUS_COMING) {
    disney_result = "𝓓𝓲𝓼𝓷𝓮𝔂+: 即将登陆 ➠ " + `${getCountryFlagEmoji(region)} | ` + region.toUpperCase();
  } else if (status == STATUS_AVAILABLE) {
    disney_result = "𝓓𝓲𝓼𝓷𝓮𝔂+: 已解锁 ➠ " + `${getCountryFlagEmoji(region)} | ` + region.toUpperCase();
  } else if (status == STATUS_NOT_AVAILABLE) {
    disney_result = "𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持 🚫 ";
  } else if (status == STATUS_TIMEOUT) {
    disney_result = "𝓓𝓲𝓼𝓷𝓮𝔂+: 检测超时 🚦";
  }

  // 拼装结果
  panel_result['content'] = [
    chatgpt_result, 
    gemini_result, 
    netflix_result, 
    youtube_result, 
    disney_result
  ].join('\n');

  $done(panel_result);
})();

// ChatGPT 检测 (应用指定字体)
async function checkChatGPT() {
  return new Promise((resolve) => {
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        resolve("𝑪𝒉𝒂𝒕𝑮𝑼𝑻: 检测失败");
        return;
      }
      let lines = data.split("\n");
      let cf = lines.reduce((acc, line) => {
        let [key, value] = line.split("=");
        acc[key] = value;
        return acc;
      }, {});
      let loc = getCountryFlagEmoji(cf.loc) + ' | ' + cf.loc;
      let l = tf.indexOf(cf.loc);
      let gpt = (l !== -1) ? "𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 已解锁 ➠ " : "𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 未解锁 ➠ ";
      resolve(`${gpt}${loc}`);
    });
  });
}

// Gemini 检测 (新增函数，应用指定字体)
async function checkGemini() {
  return new Promise((resolve) => {
    let opts = {
      url: 'https://gemini.google.com/app',
      headers: REQUEST_HEADERS,
    };
    $httpClient.get(opts, function(error, response, data) {
      if (error) {
        resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败");
        return;
      }
      if (response.status === 200) {
        resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 已解锁 ➠ ✅");
      } else if (response.status === 403) {
        resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 未解锁 ➠ 🚫");
      } else {
        resolve("𝑮𝒆𝒎𝒊𝒏𝒊: 不支持此地区 ➠ ✖️");
      }
    });
  });
}

async function check_youtube_premium() {
  let inner_check = () => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function(error, response, data) {
        if (error != null || response.status !== 200) {
          reject('Error');
          return;
        }
        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve('Not Available');
          return;
        }
        let region = '';
        let re = new RegExp('"countryCode":"(.*?)"', 'gm');
        let result = re.exec(data);
        if (result != null && result.length === 2) {
          region = result[1];
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN';
        } else {
          region = 'US';
        }
        resolve(region);
      });
    });
  };

  let youtube_check_result = '𝐘𝐨𝐮𝐓𝐮𝐛𝐞: ';
  await inner_check()
    .then((code) => {
      if (code === 'Not Available') {
        youtube_check_result += '不支持解锁';
      } else {
        youtube_check_result += '已解锁 ➠ ' + `${getCountryFlagEmoji(code)} | ` + code.toUpperCase();
      }
    })
    .catch(() => {
      youtube_check_result += '检测失败';
    });
  return youtube_check_result;
}

async function check_netflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function(error, response, data) {
        if (error != null) { reject('Error'); return; }
        if (response.status === 403) { reject('Not Available'); return; }
        if (response.status === 404) { resolve('Not Found'); return; }
        if (response.status === 200) {
          let url = response.headers['x-originating-url'] || response.headers['Location'] || '';
          let region = 'US';
          if (url.includes('/')) {
            region = url.split('/')[3] || 'US';
            region = region.split('-')[0];
          }
          if (region === 'title' || !region) region = 'US';
          resolve(region);
          return;
        }
        reject('Error');
      });
    });
  };

  let netflix_check_result = '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: ';
  try {
    let code = await inner_check(81215567);
    if (code === 'Not Found') {
      code = await inner_check(80018499);
      if (code === 'Not Found') throw 'Not Available';
      netflix_check_result += '自制剧 ➠ ' + `${getCountryFlagEmoji(code)} | ` + code.toUpperCase();
    } else {
      netflix_check_result += '完整版 ➠ ' + `${getCountryFlagEmoji(code)} | ` + code.toUpperCase();
    }
  } catch (error) {
    netflix_check_result += (error === 'Not Available') ? '不支持解锁' : '检测失败';
  }
  return netflix_check_result;
}

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)]);
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);
    region = countryCode ?? region;
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING };
    } else {
      return { region, status: STATUS_AVAILABLE };
    }
  } catch (error) {
    if (error === 'Not Available') return { status: STATUS_NOT_AVAILABLE };
    if (error === 'Timeout') return { status: STATUS_TIMEOUT };
    return { status: STATUS_ERROR };
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    };
    $httpClient.post(opts, function(error, response, data) {
      if (error || response.status !== 200) { reject('Not Available'); return; }
      data = JSON.parse(data);
      if (data?.errors) { reject('Not Available'); return; }
      let { session: { inSupportedLocation, location: { countryCode } } } = data?.extensions?.sdk;
      resolve({ inSupportedLocation, countryCode });
    });
  });
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = { url: 'https://www.disneyplus.com/', headers: { 'Accept-Language': 'en', 'User-Agent': UA } };
    $httpClient.get(opts, function(error, response, data) {
      if (error || response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        reject('Not Available'); return;
      }
      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      if (!match) { resolve({ region: '', cnbl: '' }); return; }
      resolve({ region: match[1], cnbl: match[2] });
    });
  });
}

function timeout(delay = 5000) {
  return new Promise((_, reject) => {
    setTimeout(() => { reject('Timeout'); }, delay);
  });
}
