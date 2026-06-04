/*
Egern/Surge Script: 8se.me 视觉蒸发威力加强版
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    const injectCSS = `
    <style>
        /* 1. 强力隐形所有带 ad、pop、float 标识的广告层和 iframe 框架 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"], 
        div[style*="position: fixed"][style*="z-index"],
        .pop-ad, .float-ad, #ad-container, [class*="banner"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 2. 隐藏提示关闭去广告的弹窗遮罩，不干扰网页主体 */
        .modal-backdrop, .fade.show, [style*="backdrop-filter"], [style*="blur"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
    </style>
    `;
    
    const injectJS = `
    <script>
        (function() {
            // 瞒天过海：提前声明广告加载成功
            window.adblock = false;
            window.isAdBlockActive = false;
            window.FuckAdBlock = function() {
                this.onDetected = function() { return this; };
                this.onNotDetected = function(cb) { cb(); return this; };
                this.check = function() {};
            };
            
            // 锁死点击弹窗重定向
            window.open = function() { return null; };
            
            // 定时器补刀：每 300 毫秒扫描一次页面，只要发现含有提示文字的 div，直接物理抹除
            setInterval(function() {
                // 恢复滚动条
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

    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
