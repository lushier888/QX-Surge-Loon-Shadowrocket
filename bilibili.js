/**
 * 解锁 B 站 4K 画质脚本
 * 逻辑：劫持 playurl 接口响应，强制修改画质等级(qn)与会员状态
 */

let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        if (obj.data) {
            // 强制指定画质 qn=120 (4K)
            obj.data.quality = 120;
            
            // 补全画质列表，确保 UI 出现 4K 选项
            if (obj.data.accept_quality) {
                if (!obj.data.accept_quality.includes(120)) {
                    obj.data.accept_quality.unshift(120);
                    obj.data.accept_description.unshift("超清 4K");
                }
            }
            
            // 修改会员逻辑：2 为大会员，1 为正常状态
            // 提示：若服务端有二次校验，此项仅能解锁 UI 按钮
            obj.data.vip_type = 2;
            obj.data.vip_status = 1;
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("B站4K解锁脚本执行出错: " + e);
        $done({});
    }
} else {
    $done({});
}
