/**
 * Egern小组件: 流媒体与 AI 解锁检测
 */
export default async function(ctx) {
  // === 💡 请在这里填写你在 Egern 中的代理策略组名称 ===
  const PROXY_POLICY = "Proxy"; 

  const C = {
    bg: { light: '#FFFFFF', dark: '#2C2C2E' },
    text: { light: '#1C1C1E', dark: '#FFFFFF' },
    dim: { light: '#8E8E93', dark: '#8E8E93' },
    green: { light: '#34C759', dark: '#30D158' },
    red: { light: '#FF3B30', dark: '#FF453A' },
    blue: { light: '#007AFF', dark: '#0A84FF' }
  };

  const getFlag = (code) => {
    if (!code || code === 'XX') return ''; 
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt()));
  };

  const BASE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  const commonHeaders = { "User-Agent": BASE_UA };

  // 统一封装请求参数，确保走代理策略组
  const reqOptions = (extra = {}) => {
    return {
      timeout: 4000,
      policy: PROXY_POLICY,
      ...extra
    };
  };

  const fetchProxy = async () => {
    try {
      const res = await ctx.http.get('http://ip-api.com/json/?lang=zh-CN', reqOptions());
      const data = JSON.parse(await res.text());
      return { cc: data.countryCode || "XX", flag: getFlag(data.countryCode) };
    } catch (e) { return { cc: "XX", flag: "" }; }
  };

  async function checkNetflix() {
    try {
      const checkStatus = async (id) => {
        const r = await ctx.http.get(`https://www.netflix.com/title/${id}`, reqOptions({ headers: commonHeaders, followRedirect: false })).catch(() => null);
        return r ? r.status : 0;
      };
      const sFull = await checkStatus(70143836); 
      if (sFull === 200) return { status: "已解锁", code: "OK" }; 
      return { status: "未解锁", code: "" }; 
    } catch { return { status: "未解锁", code: "❌" }; }
  }

  async function checkDisney() {
    try {
      const res = await ctx.http.get("https://www.disneyplus.com", reqOptions({ headers: commonHeaders, followRedirect: false })).catch(() => null);
      if (!res || res.status === 403) return { status: "未解锁", code: "❌" };
      return { status: "已解锁", code: "OK" }; 
    } catch { return { status: "未解锁", code: "❌" }; }
  }

  async function checkChatGPT() {
    try {
      const traceRes = await ctx.http.get("https://chatgpt.com/cdn-cgi/trace", reqOptions({ timeout: 3000 })).catch(() => null);
      if (!traceRes) return { status: "未解锁", code: "❌" };
      const tb = await traceRes.text();
      const m = tb?.match(/loc=([A-Z]{2})/);
      return { status: "已解锁", code: m?.[1] ? m[1].toUpperCase() : "OK" };
    } catch { return { status: "未解锁", code: "❌" }; }
  }

  async function checkClaude() {
    try {
      const res = await ctx.http.get("https://claude.ai/login", reqOptions({ timeout: 5000, headers: commonHeaders })).catch(() => null);
      if (!res) return { status: "未解锁", code: "❌" };
      return { status: "已解锁", code: "OK" };
    } catch { return { status: "未解锁", code: "❌" }; }
  }

  async function checkGemini() {
    try {
      const res = await ctx.http.get("https://gemini.google.com/app", reqOptions({ headers: commonHeaders, followRedirect: false })).catch(() => null);
      if (!res) return { status: "未解锁", code: "" };
      return { status: "已解锁", code: "OK" };
    } catch { return { status: "未解锁", code: "" }; }
  }

  const [proxyData, rNF, rDP, rGPT, rCL, rGM] = await Promise.all([
    fetchProxy(),
    checkNetflix(), checkDisney(),
    checkChatGPT(), checkClaude(), checkGemini()
  ]);

  const Row = (label, val, valCol) => ({
    type: 'stack', 
    direction: 'row', 
    alignItems: 'center', 
    gap: 4,
    children: [
      { type: 'text', text: label, font: { size: 13, weight: 'medium' }, textColor: C.text, width: 70 }, 
      { type: 'spacer' },
      { type: 'text', text: val, font: { size: 11, weight: 'medium' }, textColor: valCol, maxLines: 1, minScale: 0.5 }
    ]
  });

  const fmtResult = (res, cc) => {
    if (res.code === "❌") return "未解锁";
    const flag = res.code === "OK" ? getFlag(cc) : getFlag(res.code);
    const code = res.code === "OK" ? cc : res.code;
    return `${res.status} › ${flag}${code}`;
  };

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    type: 'widget', 
    padding: [8, 12, 8, 12],  
    backgroundColor: C.bg,
    children: [
      { 
        type: 'stack', 
        direction: 'row', 
        alignItems: 'center', 
        gap: 4, 
        children: [
          { type: 'image', src: 'sf-symbol:lock.open.fill', color: C.blue, width: 14, height: 14 },
          { type: 'text', text: '解锁检测', font: { size: 14, weight: 'bold' }, textColor: C.text },
          { type: 'spacer' },
          { type: 'image', src: 'sf-symbol:arrow.clockwise', color: C.dim, width: 11, height: 11 },
          { type: 'text', text: timeStr, font: { size: 11 }, textColor: C.dim }
        ]
      },
      
      { 
        type: 'stack', 
        direction: 'column', 
        gap: 2,
        flex: 1,  
        children: [
          { type: 'text', text: '流媒体解锁', font: { size: 11, weight: 'bold' }, textColor: C.blue },
          Row("YouTube", `已解锁 › ${proxyData.flag}${proxyData.cc}`, C.green),
          Row("Netflix", fmtResult(rNF, proxyData.cc), rNF.code === "❌" ? C.red : C.green),
          Row("Disney+", fmtResult(rDP, proxyData.cc), rDP.code === "" ? C.red : C.green),
          { type: 'spacer', length: 4 },
          { type: 'text', text: 'AI 服务检测', font: { size: 11, weight: 'bold' }, textColor: C.blue },
          Row("ChatGPT", fmtResult(rGPT, proxyData.cc), rGPT.code === "❌" ? C.red : C.green),
          Row("Claude", fmtResult(rCL, proxyData.cc), rCL.code === "❌" ? C.red : C.green),
          Row("Gemini", fmtResult(rGM, proxyData.cc), rGM.code === "" ? C.red : C.green)
        ]
      }
    ]
  };
}
