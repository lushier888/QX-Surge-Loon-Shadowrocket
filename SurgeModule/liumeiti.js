/*
 * Stream & AI Unlock Checker
 * Disney+ / YouTube / Netflix / ChatGPT / Gemini
 * Surge Panel Version
 */

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  'Accept-Language': 'en',
};

const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36';

let url = 'https://chat.openai.com/cdn-cgi/trace';

let tf = [
  "T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ",
  "BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF",
  "CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO",
  "EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR",
  "GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ",
  "IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV",
  "LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT",
  "MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR",
  "NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA",
  "PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS",
  "SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES",
  "LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG",
  "AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD",
  "PS","KR","TW","TZ","TL","GB"
];

Date.prototype.Format = function(fmt) {
  var o = {
    "H+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(
        4 - RegExp.$1.length
      )
    );
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? o[k]
          : ("00" + o[k]).substr(
              ("" + o[k]).length
            )
      );
    }
  }

  return fmt;
};

function getCountryFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}

(async () => {

  let panel_result = {
    title:
      '📺 流媒体检测 ⏰ ' +
      new Date().Format("HH:mm:ss"),
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#FF9500',
  };

  let chatgpt_result =
    await checkChatGPT();

  let [{ region, status }] =
    await Promise.all([
      testDisneyPlus()
    ]);

  let streaming_results =
    await Promise.all([
      check_youtube_premium(),
      check_netflix(),
      check_gemini()
    ]);

  let disney_result = "";

  if (status == STATUS_COMING) {

    disney_result =
      "𝓓𝓲𝓼𝓷𝓮𝔂+: 即将登陆 ➠ " +
      `${getCountryFlagEmoji(region)} | ` +
      region.toUpperCase();

  } else if (
    status == STATUS_AVAILABLE
  ) {

    disney_result =
      "𝓓𝓲𝓼𝓷𝓮𝔂+: 已解锁 ➠ " +
      `${getCountryFlagEmoji(region)} | ` +
      region.toUpperCase();

  } else if (
    status == STATUS_NOT_AVAILABLE
  ) {

    disney_result =
      "𝓓𝓲𝓼𝓷𝓮𝔂+: 未支持 🚫 ";

  } else if (
    status == STATUS_TIMEOUT
  ) {

    disney_result =
      "𝓓𝓲𝓼𝓷𝓮𝔂+: 检测超时 🚦";

  }

  streaming_results.push(disney_result);

  panel_result['content'] =
    [
      chatgpt_result,
      ...streaming_results
    ].join('\n');

  $done(panel_result);

})();

async function checkChatGPT() {

  return new Promise((resolve) => {

    $httpClient.get(
      url,
      function(error, response, data) {

        if (error) {

          resolve(
            "ChatGPT: 检测失败"
          );

          return;
        }

        let lines =
          data.split("\n");

        let cf =
          lines.reduce(
            (acc, line) => {

              let [key, value] =
                line.split("=");

              acc[key] = value;

              return acc;

            },
            {}
          );

        let loc =
          getCountryFlagEmoji(
            cf.loc
          ) +
          ' | ' +
          cf.loc;

        let l =
          tf.indexOf(cf.loc);

        let gpt =
          l !== -1
            ? "𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 已解锁 ➠ "
            : "𝑪𝒉𝒂𝒕𝑮𝑷𝑻: 未解锁 ➠ ";

        resolve(`${gpt}${loc}`);

      }
    );

  });

}

async function check_youtube_premium() {

  let youtube_check_result =
    '𝐘𝐨𝐮𝐓𝐮𝐛𝐞: ';

  try {

    let code =
      await new Promise(
        (resolve, reject) => {

          let option = {
            url:
              'https://www.youtube.com/premium',
            headers:
              REQUEST_HEADERS,
          };

          $httpClient.get(
            option,
            function(
              error,
              response,
              data
            ) {

              if (
                error != null ||
                response.status !== 200
              ) {

                reject();

                return;
              }

              if (
                data.indexOf(
                  'Premium is not available in your country'
                ) !== -1
              ) {

                reject();

                return;
              }

              let region = '';

              let re =
                new RegExp(
                  '"countryCode":"(.*?)"',
                  'gm'
                );

              let result =
                re.exec(data);

              if (
                result != null &&
                result.length === 2
              ) {

                region =
                  result[1];

              } else {

                region = 'US';

              }

              resolve(region);

            }
          );

        }
      );

    youtube_check_result +=
      '已解锁 ➠ ' +
      `${getCountryFlagEmoji(code)} | ` +
      code.toUpperCase();

  } catch {

    youtube_check_result +=
      '不支持解锁';

  }

  return youtube_check_result;

}

async function check_netflix() {

  let netflix_check_result =
    '𝐍𝐄𝐓𝐅𝐋𝐈𝐗: ';

  try {

    let code =
      await netflixCheck(
        81215567
      );

    netflix_check_result +=
      '完整版 ➠ ' +
      `${getCountryFlagEmoji(code)} | ` +
      code.toUpperCase();

  } catch {

    try {

      let code =
        await netflixCheck(
          80018499
        );

      netflix_check_result +=
        '自制剧 ➠ ' +
        `${getCountryFlagEmoji(code)} | ` +
        code.toUpperCase();

    } catch {

      netflix_check_result +=
        '该节点不支持解锁';

    }

  }

  return netflix_check_result;

}

function netflixCheck(filmId) {

  return new Promise(
    (resolve, reject) => {

      let option = {
        url:
          'https://www.netflix.com/title/' +
          filmId,
        headers:
          REQUEST_HEADERS,
      };

      $httpClient.get(
        option,
        function(
          error,
          response
        ) {

          if (
            error != null
          ) {

            reject();

            return;
          }

          if (
            response.status === 403
          ) {

            reject();

            return;
          }

          if (
            response.status === 404
          ) {

            reject();

            return;
          }

          if (
            response.status === 200
          ) {

            let url =
              response.headers[
                'x-originating-url'
              ];

            let region =
              url.split('/')[3];

            region =
              region.split('-')[0];

            if (
              region ==
              'title'
            ) {

              region =
                'us';

            }

            resolve(region);

          }

        }
      );

    }
  );

}

async function check_gemini() {

  let gemini_result =
    '𝐆𝐞𝐦𝐢𝐧𝐢: ';

  try {

    let code =
      await new Promise(
        (resolve, reject) => {

          let option = {
            url:
              'https://gemini.google.com/app',
            headers:
              REQUEST_HEADERS,
          };

          $httpClient.get(
            option,
            function(
              error,
              response,
              data
            ) {

              if (
                error != null
              ) {

                reject();

                return;
              }

              if (
                response.status === 302 ||
                response.status === 301
              ) {

                reject();

                return;
              }

              if (
                data.indexOf(
                  'not available'
                ) !== -1
              ) {

                reject();

                return;
              }

              let region =
                '';

              let re =
                new RegExp(
                  '"countryCode":"(.*?)"',
                  'gm'
                );

              let result =
                re.exec(data);

              if (
                result != null &&
                result.length === 2
              ) {

                region =
                  result[1];

              } else {

                region = 'US';

              }

              resolve(region);

            }
          );

        }
      );

    gemini_result +=
      '已解锁 ➠ ' +
      `${getCountryFlagEmoji(code)} | ` +
      code.toUpperCase();

  } catch {

    gemini_result +=
      '该节点不支持解锁';

  }

  return gemini_result;

}

async function testDisneyPlus() {

  try {

    let {
      region
    } =
      await Promise.race([
        testHomePage(),
        timeout(7000)
      ]);

    return {
      region,
      status:
        STATUS_AVAILABLE
    };

  } catch {

    return {
      status:
        STATUS_NOT_AVAILABLE
    };

  }

}

function testHomePage() {

  return new Promise(
    (resolve, reject) => {

      let opts = {
        url:
          'https://www.disneyplus.com/',
        headers: {
          'Accept-Language':
            'en',
          'User-Agent':
            UA,
        },
      };

      $httpClient.get(
        opts,
        function(
          error,
          response,
          data
        ) {

          if (
            error ||
            response.status !== 200
          ) {

            reject();

            return;
          }

          let match =
            data.match(
              /Region: ([A-Za-z]{2})/
            );

          if (!match) {

            resolve({
              region:
                'US'
            });

            return;
          }

          resolve({
            region:
              match[1]
          });

        }
      );

    }
  );

}

function timeout(
  delay = 5000
) {

  return new Promise(
    (resolve, reject) => {

      setTimeout(() => {

        reject();

      }, delay);

    }
  );

}