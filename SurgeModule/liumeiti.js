const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

(async () => {
  let results = await Promise.all([
    checkNetflix(),
    checkDisneyPlus(),
    checkYouTube(),
    checkHBO(),
    checkChatGPT(),
    checkGemini()
  ]);

  $done({
    title: '流媒体 & AI 解锁检测',
    content: results.join('\n'),
    icon: 'sparkles.tv.fill',
    'icon-color': '#FF9500'
  });
})();

async function checkNetflix() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.netflix.com/title/81215561',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Netflix: ❌网络错误');
      else if(res.status===200) r('Netflix: ✅完整解锁');
      else if(res.status===404) r('Netflix: ⚠️仅限自制剧');
      else r('Netflix: ❌被封锁');
    });
  });
}

async function checkDisneyPlus() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.disneyplus.com',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Disney+: ❌网络错误');
      else if(res.status===200) r('Disney+: ✅已解锁');
      else r('Disney+: ❌不支持此地区');
    });
  });
}

async function checkYouTube() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.youtube.com/premium',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('YouTube: ❌网络错误');
      else if(res.status===200 && res.body.indexOf('Premium is not available')===-1) r('YouTube: ✅Premium可用');
      else r('YouTube: ❌未解锁/不支持地区');
    });
  });
}

async function checkHBO() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.max.com',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('HBO Max: ❌网络错误');
      else if(res.status===200) r('HBO Max: ✅已解锁');
      else r('HBO Max: ❌被封锁');
    });
  });
}

async function checkChatGPT() {
  return new Promise((r) => {
    $httpClient.get({url:'https://ios.chat.openai.com/',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('ChatGPT: ❌网络错误');
      else if(res.status===200) r('ChatGPT: ✅已解锁');
      else r('ChatGPT: ❌被封锁');
    });
  });
}

async function checkGemini() {
  return new Promise((r) => {
    $httpClient.get({url:'https://gemini.google.com/app',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Gemini: ❌网络错误');
      else if(res.status===200) r('Gemini: ✅已解锁');
      else r('Gemini: ❌被封锁');
    });
  });
}
