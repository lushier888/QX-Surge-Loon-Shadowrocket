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
      else if(res.status===404) r('Netflix
