/*
Egern/Surge Script: 8se.me 纯脚本接管版
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    // 1. 注入纯视觉 CSS：只把小广告、悬浮层、提示词隐藏，绝不破坏网页任何的 div 结构、图片容器和播放器
    const injectCSS = `
    <style>
        /* 精准隐藏带有 ad 标识的悬浮、固定、底栏横幅广告，不影响网页原生排版 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"],
        div[style*="position: fixed"][style*="z-index"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 隐藏提示关闭去广告的遮罩层 */
        div:contains("广告拦截"), div:contains("维持运营"),
        div[style*="backdrop-filter"], .modal-backdrop, .fade.show, [style*="blur"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 强制确保整个网页、图片流和滚动条 100% 可滚动、可见 */
        html, body, #app, #wrapper, .main-content, video {
            overflow: auto !important;
            position: unset !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
    </style>
    `;
    
    // 2. 注入高维伪装 JS：骗过反广告拦截检测，同时毫秒级定点清除弹窗元素
    const injectJS = `
    <script>
        (function() {
            // 瞒天过海：提前声明广告加载成功，废掉它的反去广告逻辑
            window.adblock = false;
            window.isAdBlockActive = false;
            window.FuckAdBlock = function() {
                this.onDetected = function() { return this; };
                this.onNotDetected = function(cb) { cb(); return this; };
                this.check = function() {};
            };
            
            // 锁死点击弹窗重定向
            window.open = function() { return null; };
            
            // 定时器暗杀：每 300 毫秒扫描一次页面，发现“广告拦截”字样的提示框直接从 DOM 树中抹除
            setInterval(function() {
                if (document.body) {
                    document.body.style.setProperty('overflow', 'auto', 'important');
                    document.body.style.setProperty('position', 'unset', 'important');
                }
                var divs = document.getElementsByTagName('div');
                for (var i = 0; i < divs.length; i++) {
                    var text = divs[i].textContent || divs[i].innerText || "";
                    if (text.includes('广告拦截') || text.includes('维持运营')) {
                        if (divs[i].getAttribute('id') !== 'app' && divs[i].getAttribute('id') !== 'wrapper') {
                            divs[i].remove();
                        }
                    }
                }
            }, 300);
        })();
    </script>
    `;

    // 注入到 HTML 中
    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
