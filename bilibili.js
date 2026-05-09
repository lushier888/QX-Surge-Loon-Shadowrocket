 let obj = JSON.parse($response.body);

// 逻辑：强制修改画质参数 qn
// 120 代表 4K，116 代表 1080P 高码率，112 代表 1080P+
if (obj.data) {
    if (obj.data.quality) obj.data.quality = 120;
    if (obj.data.accept_quality) {
        // 确保 120 在可选列表中
        if (!obj.data.accept_quality.includes(120)) {
            obj.data.accept_quality.unshift(120);
            obj.data.accept_description.unshift("超清 4K");
        }
    }
    // 强制将会员状态改为 1 (大会员)
    if (obj.data.vip_type !== undefined) obj.data.vip_type = 2;
    if (obj.data.vip_status !== undefined) obj.data.vip_status = 1;
}

$done({body: JSON.stringify(obj)});
