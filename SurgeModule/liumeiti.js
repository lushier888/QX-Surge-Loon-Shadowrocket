const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
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
    title: '流媒体 & AI 检测 (No MITM)',
    content: results.join('\n'),
    icon: 'shield.fill',
    'icon-color': '#34C759'
  });
})();

// Netflix: 根据是否跳转到搜索页或特定标题页判定
async function checkNetflix() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.netflix.com/title/81215561',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Netflix: ❌连接失败');
      else if(res.status===200) r('Netflix: ✅完整解锁');
      else if(res.status===404) r('Netflix: ⚠️仅限自制剧');
      else r('Netflix: ❌被封锁');
    });
  });
}

// Disney+: 依据地区限制跳转 302 判定
async function checkDisneyPlus() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.disneyplus.com',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Disney+: ❌连接失败');
      else if(res.status===200 || res.status===302) r('Disney+: ✅已解锁');
      else r('Disney+: ❌不支持此地区');
    });
  });
}

// YouTube: 探测 Premium 页面状态码
async function checkYouTube() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.youtube.com/premium',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('YouTube: ❌连接失败');
      else if(res.status===200) r('YouTube: ✅Premium可用');
      else r('YouTube: ❌不支持地区');
    });
  });
}

// HBO Max: 探测 Max 官网响应
async function checkHBO() {
  return new Promise((r) => {
    $httpClient.get({url:'https://www.max.com',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('HBO Max: ❌连接失败');
      else if(res.status===200 || res.status===302) r('HBO Max: ✅已解锁');
      else r('HBO Max: ❌被封锁');
    });
  });
}

// ChatGPT: 探测 iOS API 接口
async function checkChatGPT() {
  return new Promise((r) => {
    $httpClient.get({url:'https://ios.chat.openai.com/',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('ChatGPT: ❌连接失败');
      // 无MITM时，能通即视为解锁，因为封锁通常直接 403 或 拒绝连接
      else if(res.status===200 || res.status===403) r(res.status===200?'✅已解锁':'❌被封锁');
      else r('ChatGPT: ❓状态异常');
    });
  });
}

// Gemini: 探测 Google 地区受限接口
async function checkGemini() {
  return new Promise((r) => {
    $httpClient.get({url:'https://gemini.google.com/app',headers:REQUEST_HEADERS},(err,res)=>{
      if(err) r('Gemini: ❌连接失败');
      else if(res.status===200) r('Gemini: ✅已解锁');
      else r('Gemini: ❌不支持');
    });
  });
}
