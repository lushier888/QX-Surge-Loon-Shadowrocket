/*
Egern/Surge Script: 8se.me 终极完美去广告 + 视频放行修复版
以 GitHub 仓库为最高准则
*/

let body = $response.body;

if (body) {
    // 【核心修复】：删除了原先一刀切删除整个 <script> 标签的霸道正则（防止误杀视频播放器初始化代码）
    // 改为只精准剔除可能混在 HTML 里的恶意广告商域名直链字符串，保证视频脚本完整存活
    body = body.replace(/(popads|exoclick|juicyads|fuckadblock|blockadblock)\.com/g, 'localhost');

    // 2. 注入针对性样式：只隐藏特定广告和弹窗，但必须强制恢复网页主体的显示与滚动
    const injectCSS = `
    <style>
        /* 精准隐藏广告，绝不误伤网页主体结构 */
        [class*="ad-"], [id*="ad-"], iframe[src*="ads"],
        div[style*="position: fixed"][style*="z-index"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 强行震碎提示关闭插件的弹窗和遮罩层 */
        div:contains("广告拦截"), div:contains("维持运营"),
        div[style*="backdrop-filter"], .modal-backdrop, .fade.show, [style*="blur"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 核心防锁死：强制让网页内容元素恢复可见，防止它自杀变白 */
        html, body, #app, #wrapper, .main-content, #main {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            overflow: auto !important;
            position: unset !important;
        }
    </style>
    `;
    
    // 3. 注入高维伪装 JS：抢在网页所有脚本运行前，伪装成“老子已经高高兴兴把广告全看完了”的样子
    const injectJS = `
    <script>
        (function() {
            // 劫持反广告拦截插件常用的全局变量，提前声明“没有拦截广告”
            window.adblock = false;
            window.isAdBlockActive = false;
            window.FuckAdBlock = function() {
                this.onDetected = function() { return this; };
                this.onNotDetected = function(cb) { cb(); return this; };
                this.check = function() {};
            };
            
            // 阻止网页弹窗劫持
            window.open = function() { return null; };
            
            // 定时器补刀：如果它在运行过程中动态生成了锁死页面的 class，直接干掉
            setInterval(function() {
                // 解锁滚动
                if (document.body) {
                    document.body.style.setProperty('overflow', 'auto', 'important');
                    document.body.style.setProperty('position', 'unset', 'important');
                }
                // 移除流氓弹窗元素
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

    // 严丝合缝地注入到 HTML 头部和尾部
    body = body.replace('</head>', injectCSS + '</head>');
    body = body.replace('<body>', '<body>' + injectJS);
}

$done({ body });
