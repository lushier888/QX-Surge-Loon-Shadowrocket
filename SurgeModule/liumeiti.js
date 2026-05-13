/*
 * 由@LucaLin233编写
 * 原脚本地址：https://raw.githubusercontent.com/LucaLin233/Luca_Conf/main/Surge/JS/stream-all.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.07.22
 * 版本：2.3
 * 由bigmom2012修改
 * 更新日期：2022-07-30 11:28
 * 更新日期：2024-07-04 21:28
 * Gemini检测增强版
 */

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
};

// 状态常量
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';

let url = 'https://chat.openai.com/cdn-cgi/trace';

let tf = [
  'T1','XX','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS',
  'BD','BB','BE','BZ','BJ','BT','BA','BW','BR','BG','BF','CV','CA',
  'CL','CO','KM','CR','HR','CY','DK','DJ','DM','DO','EC','SV','EE',
  'FJ','FI','FR','GA','GM','GE','DE','GH','GR','GD','GT','GN','GW',
  'GY','HT','HN','HU','IS','IN','ID','IQ','IE','IL','IT','JM','JP',
  'JO','KZ','KE','KI','KW','KG','LV','LB','LS','LR','LI','LT','LU',
  'MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','MC','MN','ME',
  'MA','MZ','MM','NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO',
  'OM','PK','PW','PA','PG','PE','PH','PL','PT','QA','RO','RW','KN',
  'LC','VC','WS','SM','ST','SN','RS','SC','SL','SG','SK','SI','SB',
  'ZA','ES','LK','SR','SE','CH','TH','TG','TO','TT','TN','TR','TV',
  'UG','AE','US','UY','VU','ZM','BO','BN','CG','CZ','VA','FM','MD',
  'PS','KR','TW','TZ','TL','GB'
];

let tff = ['plus', 'on'];

// argument 参数
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

// 国旗
function getCountryFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}

// 时间格式
Date.prototype.Format = function(fmt) {
  var o = {
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }

  return fmt;
};

(async () => {

  let panel_result = {
    title: '📺 流媒体检测 ⏰ ' + new Date().Format('HH:mm:ss'),
    content: '',
    icon: '4k.tv.fill',
    'icon-color': '#f20c00',
  };

  let chatgpt_result = await checkChatGPT();
  let gemini_result = await checkGemini();

  let [{ region, status }] = await Promise.all([
    testDisneyPlus()
  ]);

  let streaming_results = await Promise.all([
    check_youtube_premium(),
    check_netflix()
  ]);

  let disney_result = '';

  if (status == STATUS_COMING) {

    disney_result =
      '𝓓𝓲𝓼𝓷𝓮𝔂+: 即将登陆 ➠ ' +
      `${getCountryFlagEmoji(region)} | ` +
      region.toUpperCase();

  } else if (status == STATUS_AVAILABLE) {

    disney_result =
      '𝓓𝓲𝓼𝓷𝓮𝔂+: 已解锁 ➠ ' +
      `${getCountryFlagEmoji(region)} | ` +
      region.toUpperCase();

  } else if (status == STATUS_NOT_AVAILABLE) {

    disney_result = '𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持 🚫';

  } else if (status == STATUS_TIMEOUT) {

    disney_result = '𝓓𝓲𝓼𝓷𝓮𝔂+: 检测超时 🚦';

  } else {

    disney_result = '𝓓𝓲𝓼𝓷𝓮𝔂+: 检测失败';

  }

  streaming_results.push(disney_result);

  panel_result['content'] = [
    chatgpt_result,
    gemini_result,
    ...streaming_results
  ].join('\n');

  $done(panel_result);

})();

// ChatGPT 检测
async function checkChatGPT() {

  return new Promise((resolve, reject) => {

    $httpClient.get(url, function(error, response, data) {

      if (error) {

        console.log(error);

        resolve('𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 检测失败');

        return;

      }

      let lines = data.split('\n');

      let cf = lines.reduce((acc, line) => {

        let [key, value] = line.split('=');

        if (key && value) {
          acc[key] = value;
        }

        return acc;

      }, {});

      let loc = cf.loc || 'US';

      let region =
        `${getCountryFlagEmoji(loc)} | ${loc.toUpperCase()}`;

      let support = tf.indexOf(loc) !== -1;

      if (support) {

        resolve(
          `𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 已解锁 ➠ ${region}`
        );

      } else {

        resolve(
          `𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 未解锁 ➠ ${region}`
        );

      }

    });

  });

}

async function checkGemini() {

  return new Promise((resolve) => {

    const option = {
      url: 'https://gemini.google.com/app',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept-Language': 'en'
      }
    };

    $httpClient.get(option, function(error, response, data) {

      try {

        // 请求失败
        if (error || !response) {

          resolve('𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败');

          return;
        }

        // 防止 data 为 undefined
        data = data || '';

        let status = response.status || 0;

        // 已解锁
        if (
          status === 200 &&
          (
            data.indexOf('Gemini') !== -1 ||
            data.indexOf('Google AI') !== -1 ||
            data.indexOf('bard') !== -1
          )
        ) {

          resolve('𝑮𝒆𝒎𝒊𝒏𝒊: 已解锁');

          return;
        }

        // 未解锁
        if (
          status === 403 ||
          data.indexOf('unsupported country') !== -1 ||
          data.indexOf('not available') !== -1 ||
          data.indexOf('currently unavailable') !== -1
        ) {

          resolve('𝑮𝒆𝒎𝒊𝒏𝒊: 未解锁');

          return;
        }

        // 其它情况
        resolve('𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败');

      } catch(e) {

        resolve('𝑮𝒆𝒎𝒊𝒏𝒊: 检测异常');

      }

    });

  });

}

// YouTube Premium
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

        if (
          data.indexOf(
            'Premium is not available in your country'
          ) !== -1
        ) {

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

        youtube_check_result +=
          '已解锁 ➠ ' +
          `${getCountryFlagEmoji(code)} | ` +
          code.toUpperCase();

      }

    })
    .catch((error) => {

      youtube_check_result += '检测失败，请刷新面板';

    });

  return youtube_check_result;

}

// Netflix
async function check_netflix() {

  let inner_check = (filmId) => {

    return new Promise((resolve, reject) => {

      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      };

      $httpClient.get(option, function(error, response, data) {

        if (error != null) {
          reject('Error');
          return;
        }

        if (response.status === 403) {
          reject('Not Available');
          return;
        }

        if (response.status === 404) {
          resolve('Not Found');
          return;
        }

        if (response.status === 200) {

          let url = response.headers['x-originating-url'];

          let region = url.split('/')[3];

          region = region.split('-')[0];

          if (region == 'title') {
            region = 'us';
          }

          resolve(region);

          return;

        }

        reject('Error');

      });

    });

  };

  let netflix_check_result = '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: ';

  await inner_check(81215567)

    .then((code) => {

      if (code === 'Not Found') {
        return inner_check(80018499);
      }

      netflix_check_result +=
        '完整版 ➠ ' +
        `${getCountryFlagEmoji(code)} | ` +
        code.toUpperCase();

      return Promise.reject('BreakSignal');

    })

    .then((code) => {

      if (code === 'Not Found') {
        return Promise.reject('Not Available');
      }

      netflix_check_result +=
        '自制剧 ➠ ' +
        `${getCountryFlagEmoji(code)} | ` +
        code.toUpperCase();

      return Promise.reject('BreakSignal');

    })

    .catch((error) => {

      if (error === 'BreakSignal') {
        return;
      }

      if (error === 'Not Available') {

        netflix_check_result += '该节点不支持解锁';

        return;

      }

      netflix_check_result += '检测失败，请刷新面板';

    });

  return netflix_check_result;

}

// Disney+
async function testDisneyPlus() {

  try {

    let { region, cnbl } = await Promise.race([
      testHomePage(),
      timeout(7000)
    ]);

    let {
      countryCode,
      inSupportedLocation
    } = await Promise.race([
      getLocationInfo(),
      timeout(7000)
    ]);

    region = countryCode ?? region;

    if (
      inSupportedLocation === false ||
      inSupportedLocation === 'false'
    ) {

      return {
        region,
        status: STATUS_COMING
      };

    } else {

      return {
        region,
        status: STATUS_AVAILABLE
      };

    }

  } catch (error) {

    if (error === 'Not Available') {

      return {
        status: STATUS_NOT_AVAILABLE
      };

    }

    if (error === 'Timeout') {

      return {
        status: STATUS_TIMEOUT
      };

    }

    return {
      status: STATUS_ERROR
    };

  }

}

function getLocationInfo() {

  return new Promise((resolve, reject) => {

    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization:
          'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query:
          'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
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

      if (error) {
        reject('Error');
        return;
      }

      if (response.status !== 200) {
        reject('Not Available');
        return;
      }

      data = JSON.parse(data);

      if (data?.errors) {
        reject('Not Available');
        return;
      }

      let {
        token: { accessToken },
        session: {
          inSupportedLocation,
          location: { countryCode }
        }
      } = data?.extensions?.sdk;

      resolve({
        inSupportedLocation,
        countryCode,
        accessToken
      });

    });

  });

}

function testHomePage() {

  return new Promise((resolve, reject) => {

    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    };

    $httpClient.get(opts, function(error, response, data) {

      if (error) {
        reject('Error');
        return;
      }

      if (
        response.status !== 200 ||
        data.indexOf(
          'Sorry, Disney+ is not available in your region.'
        ) !== -1
      ) {

        reject('Not Available');
        return;

      }

      let match = data.match(
        /Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/
      );

      if (!match) {

        resolve({
          region: '',
          cnbl: ''
        });

        return;

      }

      let region = match[1];
      let cnbl = match[2];

      resolve({
        region,
        cnbl
      });

    });

  });

}

function timeout(delay = 5000) {

  return new Promise((resolve, reject) => {

    setTimeout(() => {
      reject('Timeout');
    }, delay);

  });

}
