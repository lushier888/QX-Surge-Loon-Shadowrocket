/*
Egern Script: 8se.me Ad Killer
*/

let body = $response.body;

if (body) {
    // 1. 清理 HTML 内部常见的第三方恶意/广告脚本标签
    body = body.replace(/<script[^>]*src="[^"]*(popads|exoclick|juicyads|analytics|ad-delivery|pussycats)[^"]*"[^>]*><\/script>/gi, '');
    
    // 2. 强行注入 CSS 样式，把网页里可能存在的隐藏广告层、弹窗层、悬浮窗直接 display:none
    const injectCSS = `
    <style>
        /* 屏蔽可能存在的悬浮、弹窗和横幅广告 class/id */
        [class*="ad-"], [id*="ad-"], 
        .popup-ad, .float-ad, #pop-overlay,
        iframe[src*="ads"], 
        div[style*="position: fixed"][style*="z-index: 999"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
    `;
    
    // 将 CSS 注入到 </head> 标签之前
    body = body.replace('</head>', injectCSS + '</head>');
    
    // 3. 拦截常见的全局弹窗重定向（劫持 window.open）
    const injectJS = `
    <script>
        (function() {
            // 冻结 window.open 防止点击网页任意地方弹窗
            var originalOpen = window.open;
            window.open = function() { return null; };
            console.log("Egern: 网页弹窗重定向已被拦截");
        })();
    </script>
    `;
    // 将 JS 注入到 <body> 标签之后
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
