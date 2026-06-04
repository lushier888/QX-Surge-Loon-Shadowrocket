/*
Egern/Surge Script: 8se.me 终极去广告与反检测破解
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    // 1. 强行注入针对性的 CSS，不仅隐藏广告，连它弹出来的“请关闭广告拦截”遮罩层一起人间蒸发
    const injectCSS = `
    <style>
        /* 隐藏底部悬浮的垃圾广告 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"],
        div[style*="position: fixed"][style*="z-index"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 强行破解“请关闭广告拦截”的流氓遮罩层和弹窗 */
        div:contains("广告拦截"), div:contains("维持运营"),
        div[style*="backdrop-filter"], .modal-backdrop, .fade.show,
        [style*="blur"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        /* 恢复由于弹窗导致的网页主体无法滚动问题 */
        body, html {
            overflow: auto !important;
            position: unset !important;
        }
    </style>
    `;
    
    // 2. 注入 JS 脚本，从根源上把检测广告拦截的判定逻辑（通常是定时器或检测全局变量）给直接废掉
    const injectJS = `
    <script>
        (function() {
            // 劫持劫持再劫持，禁止网页随便弹窗和重定向
            window.open = function() { return null; };
            
            // 破解反广告拦截检测：如果有脚本在找广告元素，直接模拟它们存在
            window.adblock = false;
            window.isAdBlockActive = false;
            
            // 定时清除可能动态生成的遮罩层文本
            setInterval(function() {
                var divs = document.getElementsByTagName('div');
                for (var i = 0; i < divs.length; i++) {
                    if (divs[i].innerText && (divs[i].innerText.includes('广告拦截') || divs[i].innerText.includes('维持运营'))) {
                        divs[i].remove();
                    }
                }
            }, 500);
        })();
    </script>
    `;

    // 拼装并注入
    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
