/*
Egern/Surge Script: 8se.me 视频放行+去广告纯净版
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    // 1. 注入高维伪装：抢在网页所有脚本运行前，向系统宣告“老子已经把广告全看完了”
    // 这样它就不会触发任何“自杀锁死”或者隐藏视频的代码
    const injectJS = `
    <script>
        (function() {
            // 伪装反广告检测变量，让网页以为广告加载成功
            window.adblock = false;
            window.isAdBlockActive = false;
            window.FuckAdBlock = function() {
                this.onDetected = function() { return this; };
                this.onNotDetected = function(cb) { cb(); return this; };
                this.check = function() {};
            };
            
            // 阻止网页各种恶心的点击弹窗
            window.open = function() { return null; };
            
            // 定时器暗杀：网页加载后，每隔 300 毫秒定向清除“强迫关闭广告插件”的流氓弹窗元素
            // 绝不使用 window.stop() 或大范围修改变量，保证视频流正常跑
            setInterval(function() {
                // 恢复由于流氓弹窗导致的页面无法滚动
                if (document.body) {
                    document.body.style.setProperty('overflow', 'auto', 'important');
                    document.body.style.setProperty('position', 'unset', 'important');
                }
                
                var divs = document.getElementsByTagName('div');
                for (var i = 0; i < divs.length; i++) {
                    if (divs[i].innerText && (divs[i].innerText.includes('广告拦截') || divs[i].innerText.includes('维持运营'))) {
                        divs[i].remove();
                    }
                }
            }, 300);
        })();
    </script>
    `;

    // 2. 强行注入纯视觉 CSS：只把小广告、悬浮层、提示词隐藏，不破坏任何网页的 div 结构和图片/视频容器
    const injectCSS = `
    <style>
        /* 隐藏各种固定的、悬浮的、带 ad 标识的狗皮膏药广告 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"],
        div[style*="position: fixed"][style*="z-index"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 隐藏提示关闭去广告的遮罩层，但绝对不影响网页主体的 display */
        div:contains("广告拦截"), div:contains("维持运营"),
        div[style*="backdrop-filter"], .modal-backdrop, .fade.show, [style*="blur"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 强制确保播放器区域和网页主体 100% 可见 */
        html, body, video, .video-player, #player {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
    </style>
    `;

    // 严丝合缝地注入，不破坏原生 HTML 的任何一行旧代码
    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
