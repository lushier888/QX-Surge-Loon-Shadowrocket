// ==UserScript==
// @ConfigName        墨鱼自用的QX配置文件
// @Author            @ddgksf2013
// @TgChannel         https://t.me/ddgksf2021
// @ID                墨鱼手记
// @UpdateTime        2026/04/19 11:51UTC/GMT +8
// @Function          请参考对应的注释或Tag
// @MainFunction      去开屏广告、应用净化、超级VIP、智能分流、自动优选、图标订阅、流媒体查询、Boxjs订阅、IOS更新屏蔽
// @ExpressThanks     @ddgksf2013,@Nick-workflow,@KOP-XIAO,@DivineEngine,@blackmatrix7,@Orz-3,@yjqiang,@O7Y0,@Peng-YM,@Neurogram-R,@id77,@NobyDa,@17mon
// @ConfigVersion     2.0 (V267)
// @ConfigURL         https://ddgksf2013.top/Profile/QuantumultX.conf
// ==/UserScript==


# 𝐂𝐮𝐭𝐭𝐥𝐞𝐟𝐢𝐬𝐡 𝐒𝐞𝐥𝐟-𝐮𝐬𝐞 𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐭𝐢𝐨𝐧 𝐂𝐡𝐚𝐧𝐠𝐞𝐥𝐨𝐠 𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲 𝐝𝐝𝐠𝐤𝐬𝐟𝟐𝟎𝟏𝟑
# [+]2022-03-01  1、QX小白配置2.0已全面更新，重点更新[rewrite_remote]内容  
# [+]2022-03-15  2、QX配置头增加网易云解锁指导、图标库、IOS屏蔽更新、旧版文档、Crack腾讯文档  
# [+]2022-03-26  3、增加[替换支付宝内淘票票评分为豆瓣评分]和[豆瓣添加便捷播放按钮&展示在映流媒体平台]  
# [+]2022-03-30  4、增加墨鱼专属VIPcrack订阅[请自行添加hostname]  
# [+]2022-03-30  5、新增QX的GeoIP自动更新Url链接[内容见header]  
# [+]2022-03-31  6、新增什么值得买APP去广告的引用@blackmatrix7  
# [+]2022-04-04  7、增加@Orz-3的big和mini图标链接  
# [+]2022-04-14  8、添加QX进阶版使用教程@kopshawn  
# [+]2022-04-14  9、添加魔法订阅，仅供临时使用  
# [+]2022-04-21 10、添加Siri与搜索2.0配置@VirgilClyne  
# [+]2022-04-26 11、添加微信解锁被屏蔽的URL@zZPiglet  
# [+]2022-04-30 12、对rewrite_remote进行分类，并添加Q-Search  
# [+]2022-05-02 13、更换魔法订阅链接，仅供临时使用[订阅来源于网络]  
# [+]2022-05-06 14、贴吧去广告更换为@app2smile的库链接，删除[server_local]下无用的网易云解锁节点 
# [-]2022-05-12 15、从实用性角度出发，小白2.0配置注释掉Siri搜索与油管字幕翻译，有需要者自行去掉注释  
# [+]2022-05-15 16、增加网易云的policy，替换网易云policy的图标url  
# [+]2022-05-28 17、微博油管去广告替换为原作者独有链接  
# [+]2022-06-09 18、建议网易云解锁订阅后加上[#checkurl=http://interface3.music.163.com]，添加喜马拉雅去广告  
# [+]2022-07-10 19、精简DNS，添加更多geo_location_checker选项  
# [-]2022-07-31 20、去除B站自动策略，有需要，请自行添加，精简配置头的部分说明
# [+]2022-08-05 21、新增节点响应时间限制server_check_timeout
# [-]2022-08-15 22、将geo_location_checker设置为disabled，删除几条通用去广告（与StartUp.conf有部分重复，也与知乎、值得买等有重复）
# [+]2022-08-17 23、将DivineEngine的更改为blackmatrix7的Advertising.conf，将未启用的重写放置QX界面最下端，
# [+]2022-08-21 24、添加dprefer-doh3(doh-server = https://223.5.5.5/dns-query, https://223.6.6.6/dns-query)QX1.0.30+
# [+]2022-09-19 25、将final分流绑定黑白名单policy，由用户自行选择直连或是代理，server_check_url响应地址改为http://www.gstatic.com/generate_204
# [+]2022-09-29 26、直连分流替换为VirgilClyne 的ASN.China.list，添加不mimt抖音、ios天气、google的host；更换header图标说明
# [+]2022-10-19 27、应群友邮件需求，墨鱼小白配置2.0中策略组新增自动选择，更新方法，可将policy部分进行替换
# [+]2022-10-22 28、策略组tolerance调整，自动选择的策略组自动排除网易云节点，油管去广告换回墨鱼整理的
# [+]2022-11-06 30、添加icloud、qq、tencent、weixin指定域名的DNS解析，并添加两个mitm域名排除
# [-]2022-11-13 31、删除QQ域名的DNS解析
# [+]2022-11-24 32、替换失效的临时使用魔法订阅，新增一条分流
# [+]2022-11-30 32、新建github库，并替换失效连接，删除ForOwnUse.conf引用链接，添加一个豆瓣电影网页快捷跳转重写
# [+]2022-12-03 33、小白配置分流新增微信直连分流，以改善微信转圈问题
# [-]2022-12-11 34、删除dohDNS解析，兼容低版本QX，同时改善商店应用下载速度过慢情况
# [+]2022-12-16 35、添加一条微博去开屏广告的直连分流，将微博去广告换成ddgksf2013的链接
# [+]2022-12-28 36、替换两个重写的路径，由Function改为Html
# [+]2022-12-29 37、将Streaming.list与StreamingSE.list里面的爱奇艺分流删除，港台番剧名称改为B站番剧
# [+]2023-01-08 38、添加高德地图APP净化重写，使用时需卸载重新安装
# [+]2023-01-18 39、优化policy组下子策略分配，将B站番剧更名为哔哩哔哩
# [+]2023-01-31 40、更新IOS系统屏蔽系统更新描述文件的URL地址
# [+]2023-02-01 41、随原作者@blackmatrix7更换知乎净化助手的引用链接
# [-]2023-02-19 42、去广告分流已简化为一条墨鱼自用的链接anti-ad.net，删除部分本地分流
# [-]2023-02-24 43、移除什么值得买去广告[无法MITM]
# [-]2023-03-22 44、为国际媒体与全球加速policy添加DIRECT选项，方便某些用户使用QX仅用于去广告与Crack
# [-]2023-04-10 45、删除流媒体HK、TW、JP、US分流，添加OpenAi分流
# [-]2023-05-09 46、添加网易云音乐、百度地图广告净化重写，使用前建议卸载两APP，重新安装，移除AMDC本地分流
# [-]2023-06-02 47、替换苹果服务分流规则为@blackmatrix7，解决懒人配置中苹果服务部分域名无法走指定policy的问题[已调整位置]
# [-]2023-06-04 48、移除部分重写，添加小红书去水印重写，重新整理重写Part部分
# [-]2023-06-28 49、调整本地夸克APP的分流规则，删除什么值得买的排除域名-*api.smzdm.com，新版已可MITM，替换Apple的Policy图标
# [+]2023-07-10 50、新增一条临时使用的机场订阅，方便小白对配置进行更新，此外对节点名称统一命名，命名方式为tg-ddgksf2021-num-序号，大家有空可以研究研究解析器，强大好用
# [+]2023-08-05 51、QX通知中，建议关闭NetWork状态通知及关闭分流匹配优化开关，若你在登录AppleStore账户时遇到问题，请将 -*apple.com, 内容复制粘贴到hostname = 后面
# [+]2023-08-20 52、鉴于不断有小白发邮件咨询为什么AppleStore无法切换登录账户，故在小白配置中，默认添加-*.apple.com，有相关破解需求者请自行移除
# [+]2023-09-08 53、替换百度网盘倍速的重写链接，新的重写可去除百度网盘开屏广告、应用内广告以及解锁会员倍速功能
# [+]2023-10-05 54、移除哔哩哔哩自动换区的重写[新版失效]，单独增加Spotify应用的分流，默认指向香港节点[自行按照需求去掉;以启用该条分流]
# [-]2023-11-09 55、移除酷我音乐纯净版SVIP重写，经群友反馈，纯净版酷我APP内部分VIP音乐无法聆听，故删除
# [-]2023-11-10 56、启用临时使用1订阅，屏蔽临时使用2订阅[无法更新]，提醒订阅仅供临时使用，推荐注册花云https://shrtm.nu/gCi
# [+]2023-11-18 57、为墨鱼小白QX2.0配置添加直连CDN链接[ https://cdn.jsdelivr.net/gh/ddgksf2013/Profile/QuantumultX.conf ]
# [+]2023-11-22 58、将OpenAI的分流替换为blackmatrix7，以保证分流规则的实时可用性
# [+]2023-12-06 59、添加QuantumultX播放IPV6直播源方法：删去DNS下面的「no-ipv6」，并在「VPN」栏中，开启「兼容性增强」
# [+]2023-12-29 60、修复微信110脚本问题，将重写地址更改为墨鱼库，待后续作者@zZPiglet修复Bug后再换回原作
# [+]2024-01-31 61、添加IOS屏蔽更新操作说明，需要将手机时间调至23年12月，安装后，重启恢复时间设置
# [+]2024-02-07 62、修改哔哩哔哩重写的TAG文字说明[B站去广告+1080P高码率]->[哔哩哔哩广告净化]
# [+]2024-03-11 63、修改部分TAG说明，注释比价脚本[因api接口失效，比价无意义，推荐使用慢慢买APP]，将自动测速600秒增加到900秒
# [+]2024-03-18 64、将广告屏蔽的分流[https://anti-ad.net/surge2.txt]更换为[https://raw.githubusercontent.com/Cats-Team/AdRules/main/qx.conf]
# [+]2024-03-21 65、由于广告屏蔽无法做到100%完美，故由墨鱼维护Unbreak.list分流，用以修正误屏蔽的域名，请及时更新替换
# [+]2024-04-24 66、修复用户反馈的开启running_mode，Wifi直连下，掌上银行或招商银行无法联网的BUG
# [-]2024-05-03 67、移除TikTok重写，新版已无需重写解锁，建议将手机地区换成非国区，然后使用TikTok分流即可[小白配置2.0已自带,并已更换为BK7]
# [-]2024-06-01 68、因DivineEngine删除，替换GV分流，并将全球加速的分流换成另外一个，同时替换Google重定向重写
# [+]2024-06-09 69、增加如何将[自动选择]切换成[手动选择]的文字说明，满足不同群体的需求
# [+]2024-06-27 70、将全球加速的分流链接替换为@ConnersHua，以防全球加速中分流与OPENAI冲突
# [-]2024-07-20 71、因网易云音乐灰色解锁节点年久失修，故简化配置，删除网易云的分流和policy，并删除相关文字描述
# [+]2024-08-02 72、移除Netflix评分、油管字幕翻译、影视网站去广告重写，添加彩云天气净化重写
# [+]2024-08-25 73、dns_exclusion_list列表添加广电APP域名
# [-]2024-09-01 74、移除百度地图净化重写[去广告影响APP正常功能，故删之]
# [+]2024-09-05 75、替换网易云音乐去广告重写URL，并修改提示，新的重写无需对于网易云音乐去广告无需卸载重装
# [+]2024-09-27 76、修改彩云天气重写TAG，增TKV推荐
# [+]2024-10-16 77、因用户反馈，移除本地分流[gg.caixin.com]，调整Policy顺序
# [+]2024-10-24 78、解决部分用户浏览淘宝时出现卡顿问题
# [-]2024-10-28 79、移除配置Header的部分描述，移除本地关于百度贴吧的分流[该分流会导致百度地图搜索出现问题]
# [+]2024-11-12 80、增加广电用户微信转圈的解决方法
# [+]2024-11-21 81、替换IOS更新屏蔽的URL链接，有需要的可自行安装屏蔽IOS更新
# [+]2024-12-04 82、将blackmatrix7的知乎去广告脚本换成墨鱼自用的Zhihu.Adblock.js脚本
# [-]2025-01-04 83、移除海外抖音分流，与今日头条域名冲突，有需要者可自行添加使用，另添加github本地代理分流
# [+]2025-04-05 84、更换去开屏广告地址，旧的去开屏rewrite已删除
# [+]2025-04-12 85、将OpenAI分流替换为墨鱼自用的AI all in one的分流
# [+]2025-06-15 86、添加非国行苹果手机使用Apple Intelligence的分流
# [+]2025-06-23 87、启用[udp_whitelist=1-442, 444-65535]，以免油管小红书去广告失效，但对淘宝QQ可能有影响
# [+]2025-07-19 88、添加udp_drop_list = 443, STUN, QUIC，需要QX版本≥1.5.2
# [+]2025-09-01 89、替换微博和高德地图重写的URL[随原地址更换]
# [+]2025-09-07 90、去除微信小程序去广告重写[已无意思，建议换外区手机号]，增加闲鱼净化重写
# [+]2025-09-12 91、为墨鱼小白QX2.0配置中的分流和重写添加ICON图标
# [+]2025-11-14 92、更换墨鱼去开屏广告重写地址
# [+]2025-12-17 93、在[task_local]下添加IP纯净度查询，供用户参考，方便注册一些要求较高的网站
# [+]2026-01-17 94、更新B站去广告重写地址
# [-]2026-03-06 95、移除forown.conf，相关VIP解锁可自行去主页添加使用
# [-]2026-04-19 96、调整部分URL更新间隔及调整部分重写



# > 建议在「其他设置」里「GeoLite2」的「来源」填写使用下面链接「任选一个」，并开启「自动更新」
; https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb
; https://github.com/Hackl0us/GeoIP2-CN/raw/release/Country.mmdb


# > QuantumultX图标库订阅，打开以下URL，手机端点击图片即可快捷添加「1.0.30+」
; https://github.com/ddgksf2013/Icon/blob/master/README.md


# > 利用描述文件屏蔽IOS更新提醒（安装后重启手机）
; https://d-updater.i4.cn/web/mobileconfig/iOS18.mobileconfig


# > 广电用户使用QuantumultX微信出现转圈现象解决方案
; 打开QuantumultX的兼容性增强开关[应该有改善][开关打开后微博及部分APP去广告会失效]


# > QuantumultX @ddgksf2013 设置推荐
; 「通知」栏中，建议仅开启[策略检测通知]和[脚本通知]开关，「VPN」栏中，建议关闭[兼容性增强]、[分流匹配优化]和[MPM]开关


# 🟢 墨鱼提醒以上全部内容[包括本行]可自行在配置中删除，对使用并无影响

[general]

# > 用于节点延迟测试
server_check_url= http://www.gstatic.com/generate_204
# > 服务器测试超时时间 (毫秒)
server_check_timeout = 3000
# > 用于设置图标显示
profile_img_url=https://github.githubassets.com/images/modules/site/integrators/google.png
# > 用于Check节点IP地址(以下geo_location_checker任选一个即可)
geo_location_checker=disabled
;geo_location_checker=http://ip-api.com/json/?lang=zh-CN, https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/IP_API.js
# > 功能强大的解析器，用于引用资源的转换
resource_parser_url=https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js
# > 下列路径将不经过QuanX的处理
excluded_routes=239.255.255.250/32, 24.105.30.129/32, 185.60.112.157/32, 185.60.112.158/32, 182.162.132.1/32
#udp_whitelist=1-442, 444-65535
# > 第一个filter为4g模式开启规则分流，第二个filter为其他wifi下开启规则分流，第三个wifi1修改成你路由器翻墙的wifi名开启直连模式，第四个wifi2为你公司或者其他有路由器翻墙的WiFi名走直连）
# > 默认关闭根据wifi切换模式，如需开启，删除下方的"#"即可
#running_mode_trigger=filter, filter, wifi1:all_direct, wifi2: all_direct
# > dns_exclusion_list
dns_exclusion_list=*.10099.com.cn, *.cmpassport.com, *.jegotrip.com.cn, *.icitymobile.mobi, id6.me, *.pingan.com.cn
# > udp_drop_list 可直接屏蔽 STUN、QUIC 等协议的数据包
udp_drop_list = 443, STUN, QUIC


[task_local]

# > 请手动添加下面的订阅（流媒体Task订阅集合）
; https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/UI-Action.json
# > 流媒体解锁查询
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js, tag=流媒体解锁查询, img-url=arrowtriangle.right.square.system, enabled=true
# > IP纯净度查询
event-interaction https://ddgksf2013.top/scripts/server-info-pure.js, tag=节点纯净度详情, img-url=checkmark.shield.fill.system



[rewrite_local]



[rewrite_remote]

# ======= 会员解锁 ======= #
https://ddgksf2013.top/rewrite/BiliBiliAdsLite.conf, tag=哔哩广告净化Lite@ddgksf2013, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/bilibili.png, update-interval=86400, opt-parser=false, enabled=true
https://raw.githubusercontent.com/app2smile/rules/master/module/spotify.conf, tag=Spotify音乐VIP[音质≤高]@app2smile, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Spotify.png, update-interval=86400, opt-parser=false, enabled=true


# ======= 广告净化 ======= #
https://ddgksf2013.top/rewrite/StartUpAds.conf, tag=墨鱼去开屏2.0@ddgksf2013, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Advertising.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/CaiYunAds.conf, tag=彩云天气净化@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/caiyuntianqi.png, update-interval=86400, opt-parser=false, enabled=true
https://ddgksf2013.top/scripts/zhihu.ads.js, tag=知乎净化助手@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/zhihu.png, update-interval=86400, opt-parser=true, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/YoutubeAds.conf, tag=油管去广告@Maasea, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/YouTube.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/WeiboAds.conf, tag=微博去广告@ddgksf2013, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Weibo.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/AmapAds.conf, tag=高德地图净化[卸载重装]@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/gaode.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/NeteaseAds.conf, tag=网易云净化@ddgksf2013, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Netease_Music.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/GoofishAds.conf, tag=闲鱼净化[卸载重装]@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/xianyu.png, update-interval=86400, opt-parser=false, enabled=true


# ======= 网页优化 ======= #
https://github.com/ddgksf2013/Rewrite/raw/master/Html/Q-Search.conf, tag=Safari超级搜索@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/search.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/Html/Douban.conf, tag=豆瓣网页观影快捷跳转@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/douban.png, update-interval=86400, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/Html/General.conf, tag=Google重定向@DivineEngine, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Google.png, update-interval=86400, opt-parser=false, enabled=true


# ======= 功能增强 ======= #
https://ddgksf2013.top/rewrite/XiaoHongShuAds.conf, tag=小红书净化+去水印@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/xiaohongshu.png, update-interval=86400, opt-parser=false, enabled=true
https://ddgksf2013.top/scripts/bdpan.ads.js, tag=百度网盘净化@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/baiduwangpan.png, update-interval=86400, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/Function/UnblockURLinWeChat.conf, tag=微信解锁被屏蔽的URL@zZPiglet, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/WeChat.png, update-interval=86400, opt-parser=false, enabled=true
https://ddgksf2013.top/scripts/bdpan.unlock.js, tag=百度网盘倍速@ddgksf2013, img-url=https://github.com/ddgksf2013/Icon/raw/master/qx/baiduwangpan.png, update-interval=86400, opt-parser=true, enabled=true

[server_local]



[server_remote]

# > 魔法仅供临时使用from@Ruk1ng001
https://raw.githubusercontent.com/Ruk1ng001/freeSub/main/clash.yaml#delreg=.*&rename=@tg%40ddgksf2021-+@num-$index7, tag=🐟临时使用, update-interval=3600, opt-parser=true, enabled=true



[dns]

;prefer-doh3
;doh-server = https://223.5.5.5/dns-query, https://223.6.6.6/dns-query
# > QuantumultX开启IPV6方法，删去下面的「no-ipv6」，在「VPN」栏中，开启「兼容性增强」
no-ipv6
no-system
server=223.5.5.5
server=119.29.29.29
server=114.114.114.114
server=/*.icloud.com/119.29.29.29
server=/*.icloud.com.cn/119.29.29.29
server=/*.tencent.com/119.29.29.29
server=/*.weixin.com/119.29.29.29



[policy]

static=苹果服务, direct, 香港节点, 台湾节点, 美国节点, 日本节点, 狮城节点, proxy, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png
static=全球加速, 自动选择, direct, 香港节点, 台湾节点, 日本节点, 狮城节点, 美国节点, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Global.png
static=哔哩哔哩, direct, 香港节点, 台湾节点, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili.png
static=声田音乐, 美国节点, 自动选择, direct, 台湾节点, 香港节点, 日本节点, 狮城节点, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Spotify.png
static=国际媒体, 台湾节点, 自动选择, direct, 香港节点, 日本节点, 美国节点, 狮城节点, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Streaming.png
static=兜底分流, 自动选择, 全球加速, direct, 香港节点, 台湾节点, 日本节点, 狮城节点, 美国节点, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Final.png

#默认设置15分钟测速一次，可自行修改check-interval=后面的数值（单位：秒），tolerance=后面的数值不建议修改
#将下面的url-latency-benchmark的内容替换成static，并删除[check-interval=1200, tolerance=0, ]即可手动选择节点
url-latency-benchmark=自动选择, server-tag-regex=^(?!.*(?:网易|墨鱼)).*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png
url-latency-benchmark=香港节点, server-tag-regex=(?=.*(港|HK|(?i)Hong))^((?!(台|日|韩|新|美)).)*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/HK.png
url-latency-benchmark=台湾节点, server-tag-regex=(?=.*(台|TW|(?i)Taiwan))^((?!(港|日|韩|新|美)).)*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/TW.png
url-latency-benchmark=日本节点, server-tag-regex=(?=.*(日|JP|(?i)Japan))^((?!(港|台|韩|新|美)).)*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/JP.png
url-latency-benchmark=狮城节点, server-tag-regex=(?=.*(新|狮|獅|SG|(?i)Singapore))^((?!(港|台|日|韩|美)).)*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/SG.png
url-latency-benchmark=美国节点, server-tag-regex=(?=.*(美|US|(?i)States|American))^((?!(港|台|日|韩|新)).)*$, check-interval=1200, tolerance=0, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/US.png



[filter_remote]

https://raw.githubusercontent.com/ddgksf2013/Filter/master/Unbreak.list, tag=规则修正, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Direct.png, force-policy=direct, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/Cats-Team/AdRules/main/qx.conf, tag=广告终结者, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Advertising.png, force-policy=reject, update-interval=86400, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/WeChat/WeChat.list, tag=微信直连, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/WeChat.png, force-policy=direct, update-interval=604800, opt-parser=false, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/GoogleVoice.list, tag=Google Voice, img-url=https://raw.githubusercontent.com/ddgksf2013/Icon/master/qx/googlevoice.png, force-policy=美国节点, update-interval=604800, opt-parser=true, enabled=true
https://ddgksf2013.top/filter/Ai.yaml, tag=Ai-All-In-One, img-url=https://raw.githubusercontent.com/ddgksf2013/Icon/master/qx/ai.png, force-policy=美国节点, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Spotify/Spotify.list, tag=Spotify音乐, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Spotify.png, force-policy=声田音乐, update-interval=86400, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/Streaming.list, tag=国际媒体, force-policy=国际媒体, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/GlobalMedia.png, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/StreamingSE.list, tag=哔哩哔哩, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/bilibili.png, force-policy=哔哩哔哩, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Apple/Apple.list, tag=苹果服务, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Apple.png, force-policy=苹果服务, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Proxy.list, tag=全球加速, force-policy=全球加速, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Global.png, update-interval=604800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/VirgilClyne/GetSomeFries/main/ruleset/ASN.China.list, tag=国内网站, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/China.png, force-policy=direct, update-interval=604800, opt-parser=true, enabled=true



[filter_local]

# > 一些比较容易忽视的分流
host, ad.12306.cn, direct
host, sdkapp.uve.weibo.com, direct
host-keyword, github, proxy

# > local
ip-cidr, 10.0.0.0/8, direct
ip-cidr, 127.0.0.0/8, direct
ip-cidr, 172.16.0.0/12, direct
ip-cidr, 192.168.0.0/16, direct
ip-cidr, 224.0.0.0/24, direct
ip-cidr, 182.254.116.0/24, direct
geoip, cn, direct
final, 兜底分流



[http_backend]

# > Boxjs设置，改为使用http backend方式，访问地址改为http://127.0.0.1:9999，更新配置后请长按风车-更新，然后重启代理
# > BoxJs相关教程参考「https://docs.boxjs.app」
https://raw.githubusercontent.com/chavyleung/scripts/master/chavy.box.js, host=boxjs.com, tag=BoxJS, path=^/, enabled=false



[mitm]

skip_validating_cert = true
force_sni_domain_name = false