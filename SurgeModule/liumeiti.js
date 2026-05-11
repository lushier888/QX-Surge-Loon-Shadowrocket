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
  "T1":"未知","XX":"其他地区","AL":"阿尔巴尼亚","DZ":"阿尔及利亚","AD":"安道尔","AO":"安哥拉","AG":"安提瓜和巴布达","AR":"阿根廷","AM":"亚美尼亚","AU":"澳大利亚","AT":"奥地利","AZ":"阿塞拜疆","BS":"巴哈马","BD":"孟加拉国","BB":"巴巴多斯","BE":"比利时","BZ":"伯利兹","BJ":"贝宁","BT":"不丹","BA":"波黑","BW":"博茨瓦纳","BR":"巴西","BG":"保加利亚","BF":"布基纳法索","CV":"佛得角","CA":"加拿大","CL":"智利","CO":"哥伦比亚","KM":"科摩罗","CR":"哥斯达黎加","HR":"克罗地亚","CY":"塞浦路斯","DK":"丹麦","DJ":"吉布提","DM":"多米尼克","DO":"多米尼加","EC":"厄瓜多尔","SV":"萨尔瓦多","EE":"爱沙尼亚","FJ":"斐济","FI":"芬兰","FR":"法国","GA":"加蓬","GM":"冈比亚","GE":"格鲁吉亚","DE":"德国","GH":"加纳","GR":"希腊","GD":"格林纳达","GT":"危地马拉","GN":"几内亚","GW":"几内亚比绍","GY":"圭亚那","HT":"海地","HN":"洪都拉斯","HU":"匈牙利","IS":"冰岛","IN":"印度","ID":"印度尼西亚","IQ":"伊拉克","IE":"爱尔兰","IL":"以色列","IT":"意大利","JM":"牙买加","JP":"日本","JO":"约旦","KZ":"哈萨克斯坦","KE":"肯尼亚","KI":"基里巴斯","KW":"科威特","KG":"吉尔吉斯斯坦","LV":"拉脱维亚","LB":"黎巴嫩","LS":"莱索托","LR":"利比里亚","LI":"列支敦士登","LT":"立陶宛","LU":"卢森堡","MG":"马达加斯加","MW":"马拉维","MY":"马来西亚","MV":"马尔代夫","ML":"马里","MT":"马耳他","MH":"马绍尔群岛","MR":"毛里塔尼亚","MU":"毛里求斯","MX":"墨西哥","MC":"摩纳哥","MN":"蒙古","ME":"黑山","MA":"摩洛哥","MZ":"莫桑比克","MM":"缅甸","NA":"纳米比亚","NR":"瑙鲁","NP":"尼泊尔","NL":"荷兰","NZ":"新西兰","NI":"尼加拉瓜","NE":"尼日尔","NG":"尼日利亚","MK":"北马其顿","NO":"挪威","OM":"阿曼","PK":"巴基斯坦","PW":"帕劳","PA":"巴拿马","PG":"巴布亚新几内亚","PE":"秘鲁","PH":"菲律宾","PL":"波兰","PT":"葡萄牙","QA":"卡塔尔","RO":"罗马尼亚","RW":"卢旺达","KN":"圣基茨和尼维斯","LC":"圣卢西亚","VC":"圣文森特和格林纳丁斯","WS":"萨摩亚","SM":"圣马力诺","ST":"圣多美和普林西比","SN":"塞内加尔","RS":"塞尔维亚","SC":"塞舌尔","SL":"塞拉利昂","SG":"新加坡","SK":"斯洛伐克","SI":"斯洛文尼亚","SB":"所罗门群岛","ZA":"南非","ES":"西班牙","LK":"斯里兰卡","SR":"苏里南","SE":"瑞典","CH":"瑞士","TH":"泰国","TG":"多哥","TO":"汤加","TT":"特立尼达和多巴哥","TN":"突尼斯","TR":"土耳其","TV":"图瓦卢","UG":"乌干达","AE":"阿联酋","US":"美国","UY":"乌拉圭","VU":"瓦努阿图","ZM":"赞比亚","BO":"玻利维亚","BN":"文莱","CG":"刚果(布)","CZ":"捷克","VA":"梵蒂冈","FM":"密克罗尼西亚","MD":"摩尔多瓦","PS":"巴勒斯坦","KR":"韩国","TW":"台湾地区","TZ":"坦桑尼亚","TL":"东帝汶","GB":"英国"
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