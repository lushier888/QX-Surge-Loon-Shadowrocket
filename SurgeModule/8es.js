/*
Egern/Surge Script: 8se.me 完美去广告、不花屏、视频放行版
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    // 1. 注入纯净安全的 CSS：只隐藏已知的广告特征类，绝对不乱改 html/body 的 display 属性，防止花屏
    const injectCSS = `
    <style>
        /* 隐藏带有 ad 标识的悬浮、固定、横幅广告，不影响网页原生排版 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"],
        div[style*="position: fixed"][style*="z-index"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 强制允许页面滚动，防止被恶心遮罩层锁死 */
        html, body {
            overflow: auto !important;
            position: unset !important;
        }
    </style>
    `;
    
    // 2. 注入原生 JS：用最标准的 DOM 操作代替 CSS，精准肉眼可见地干掉“检测弹窗”
    const injectJS = `
    <script>
        (function() {
            // 瞒天过海：提前宣告广告加载成功，让它的反去广告逻辑直接失灵
            window.adblock = false;
            window.isAdBlockActive = false;
            window.FuckAdBlock = function() {
                this.onDetected = function() { return this; };
                this.onNotDetected = function(cb) { cb(); return this; };
                this.check = function() {};
            };
            
            // 锁死点击弹窗
            window.open = function() { return null; };
            
            // 毫秒级动态补刀：每 200 毫秒扫描页面，只要发现有 div 包含“广告拦截”或“维持运营”，直接物理抹除
            setInterval(function() {
                var divs = document.getElementsByTagName('div');
                for (var i = 0; i < divs.length; i++) {
                    var text = divs[i].textContent || divs[i].innerText || "";
                    if (text.includes('广告拦截') || text.includes('维持运营')) {
                        // 顺着节点往上找，连带它那个模糊阴影的黑色背景遮罩层（通常是它的父级）一起干掉
                        if (divs[i].getAttribute('id') !== 'app' && divs[i].getAttribute('id') !== 'wrapper') {
                            divs[i].remove();
                        }
                    }
                }
            }, 200);
        })();
    </script>
    `;

    // 严丝合缝注入头部和尾部
    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
