/**
 * Sub-Store 流量查询小组件（中号多机场大字号 V8 - 纯净流量版 - 支持显示重置日）
 *
 * 环境变量示例：
 * SUB_NAMES=机场A,机场B                            # 指定显示的订阅名称
 * TITLE=我的套餐                                   # 小组件标题
 */

export default async function (ctx) {
  const cfg = getConfig(ctx);
  const cache = readCache(ctx, cfg);

  try {
    const subs = await fetchSubscriptions(ctx, cfg);
    const selected = selectSubscriptions(subs, cfg);
    if (!selected.length) {
      return errorWidget(cfg, '未找到订阅', 'SUB_NAMES 没有匹配到 Sub-Store 里的订阅名称');
    }

    const items = [];
    const selectedItems = selected.slice(0, cfg.maxItems);
    await Promise.all(selectedItems.map(async (sub, index) => {
      items[index] = await fetchFlowItem(ctx, cfg, sub);
    }));

    const payload = {
      at: Date.now(),
      source: cfg.baseUrl,
      items: cfg.hideErrors ? items.filter((item) => !item.error) : items,
    };
    writeCache(ctx, cfg, payload);
    return renderWidget(cfg, payload, false);
  } catch (e) {
    if (cache && Array.isArray(cache.items) && cache.items.length) {
      return renderWidget(cfg, cache, true, shortError(e));
    }
    return errorWidget(cfg, 'Sub-Store 连接失败', shortError(e));
  }
}

function getConfig(ctx) {
  const env = ctx.env || {};
  const family = ctx.widgetFamily || 'systemMedium';
  const defaultMax = {
    accessoryInline: 1,
    accessoryCircular: 1,
    accessoryRectangular: 1,
    systemSmall: 1,
    systemMedium: 2, 
    systemLarge: 5,
    systemExtraLarge: 7,
  }[family] || 2;

  const baseUrls = unique([
    env.SUB_STORE_BASE_URL,
    env.SUB_STORE_URL,
    env.BASE_URL,
    'http://sub.store',
    'https://sub.store',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ].map(normalizeBaseUrl).filter(Boolean));

  return {
    family,
    title: env.TITLE || 'Sub-Store 套餐',
    baseUrl: baseUrls[0] || 'http://sub.store',
    baseUrls,
    openUrl: env.OPEN_URL || 'https://sub-store.vercel.app',
    names: parseList(env.SUB_NAMES || env.SUB_NAME || env.SUBS || ''),
    matchContains: bool(env.MATCH_CONTAINS, false),
    maxItems: clampInt(env.MAX_ITEMS, defaultMax, 1, 12),
    refreshMinutes: clampInt(env.REFRESH_MINUTES, 30, 5, 1440),
    timeout: clampInt(env.TIMEOUT_MS || env.TIMEOUT, 8000, 1000, 60000),
    flowUserAgent: env.FLOW_USER_AGENT || 'clash.meta/v1.19.23',
    insecureTls: bool(env.INSECURE_TLS, false),
    useCache: bool(env.USE_CACHE, true),
    hideErrors: bool(env.HIDE_ERRORS, false),
    cacheKey: env.CACHE_KEY || 'substore-flow-widget-cache-v2',
  };
}

async function fetchSubscriptions(ctx, cfg) {
  const storedSubs = readStoredSubscriptions(ctx);
  if (storedSubs.length) return storedSubs;

  let lastError;
  const urls = Array.isArray(cfg.baseUrls) && cfg.baseUrls.length ? cfg.baseUrls : [cfg.baseUrl];
  for (const base of urls) {
    try {
      const json = await requestJson(ctx, apiUrl(base, '/api/subs'), cfg);
      const data = unwrapData(json);
      let subs = null;
      if (Array.isArray(data)) subs = data.filter(Boolean);
      else if (data && typeof data === 'object') subs = Object.values(data).filter(Boolean);
      if (subs) {
        cfg.baseUrl = base;
        return subs;
      }
      throw new Error('订阅列表格式异常');
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('无法连接 Sub-Store');
}

function selectSubscriptions(subs, cfg) {
  if (!cfg.names.length) return subs.filter(isRemoteSub);
  return cfg.names.map((name) => {
    const wanted = String(name).trim();
    let found = subs.find((s) => String(s?.name || '') === wanted);
    if (!found && cfg.matchContains) {
      found = subs.find((s) => String(s?.name || '').includes(wanted));
    }
    return found || { name: wanted, missing: true };
  });
}

function isRemoteSub(sub) {
  if (!sub || typeof sub !== 'object') return false;
  if (sub.subUserinfo) return true;
  if (sub.source === 'remote') return true;
  if (sub.url && /^https?:\/\//i.test(String(sub.url).trim())) return true;
  return false;
}

async function fetchFlowItem(ctx, cfg, sub) {
  const name = String(sub && sub.name ? sub.name : '未命名订阅');
  if (sub.missing) {
    return {
      name,
      error: '订阅不存在',
    };
  }

  try {
    const storedFlow = readStoredFlow(ctx, name);
    if (storedFlow) return decorateItem(sub, storedFlow, cfg);

    if (sub.__apiFlowUrl) {
      try {
        const json = await requestJson(ctx, sub.__apiFlowUrl, cfg);
        const flow = normalizeFlow(unwrapData(json));
        if (hasUsableFlow(flow)) return decorateItem(sub, flow, cfg);
      } catch (_) {}
    }

    const json = await requestJson(
      ctx,
      apiUrl(cfg.baseUrl, '/api/sub/flow/' + encodeURIComponent(name)),
      cfg,
    );
    const flow = normalizeFlow(unwrapData(json));
    if (!hasUsableFlow(flow)) throw new Error('无可用流量信息');
    return decorateItem(sub, flow, cfg);
  } catch (e) {
    try {
      const directFlow = await fetchDirectFlow(ctx, cfg, sub);
      if (hasUsableFlow(directFlow)) return decorateItem(sub, directFlow, cfg);
    } catch (_) {}
    return {
      name,
      error: shortError(e),
    };
  }
}

async function fetchDirectFlow(ctx, cfg, sub) {
  const raw = firstHttpUrl(sub.url || sub.subUserinfo || '');
  if (!raw) throw new Error('订阅链接不可用');
  const parts = splitUrlArgs(raw);
  const args = parts.args;
  if (args.noFlow) throw new Error('noFlow');

  const url = args.flowUrl || parts.url;
  const headers = {
    'User-Agent': args.flowUserAgent || cfg.flowUserAgent,
  };
  Object.assign(headers, parseHeaderObject(args.flowHeaders || args.headers));

  const opt = {
    headers,
    timeout: cfg.timeout,
    redirect: 'follow',
    insecureTls: cfg.insecureTls || !!args.insecure,
  };

  if (args.flowUrl) {
    const resp = await ctx.http.get(url, opt);
    const bodyFlow = parseFlowString(await safeText(resp));
    if (hasUsableFlow(bodyFlow)) return bodyFlow;
    const headerFlow = parseFlowHeaders(resp.headers);
    if (hasUsableFlow(headerFlow)) return headerFlow;
  }

  try {
    const resp = await ctx.http.head(url, opt);
    const flow = parseFlowHeaders(resp.headers);
    if (hasUsableFlow(flow)) return flow;
  } catch (_) {}

  const resp = await ctx.http.get(url, opt);
  const flow = parseFlowHeaders(resp.headers);
  if (hasUsableFlow(flow)) return flow;
  throw new Error('响应头未包含流量信息');
}

function decorateItem(sub, flow, cfg) {
  const total = num(flow.total);
  const upload = finiteOrZero(flow.upload);
  const download = finiteOrZero(flow.download);
  const used = upload + download;
  const remain = Number.isFinite(total) && total > 0 ? Math.max(0, total - used) : NaN;
  const usedRatio = Number.isFinite(total) && total > 0 ? clamp(used / total, 0, 1) : NaN;
  const remainRatio = Number.isFinite(usedRatio) ? 1 - usedRatio : NaN;

  // 提取订阅链接中的 resetDay 参数
  const args = parseArgs(sub.url || sub.subUserinfo || '');
  const resetDay = args.resetDay ? String(args.resetDay) : null;

  return {
    name: String(sub.name || '订阅'),
    planName: flow.planName || '',
    total,
    upload,
    download,
    used,
    remain,
    usedRatio,
    remainRatio,
    expireAt: Number.isFinite(flow.expires) && flow.expires > 0 ? new Date(flow.expires * 1000) : null,
    appUrl: flow.appUrl || '',
    resetDay, // 将重置日传给渲染层
  };
}

function normalizeFlow(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const usage = data.usage && typeof data.usage === 'object' ? data.usage : {};
  return {
    total: num(data.total),
    upload: num(usage.upload ?? data.upload),
    download: num(usage.download ?? data.download),
    expires: num(data.expires ?? data.expire),
    planName: String(data.planName || data.plan_name || ''),
    appUrl: String(data.appUrl || data.app_url || ''),
  };
}

function hasUsableFlow(flow) {
  return flow && Number.isFinite(flow.total) && flow.total > 0 && Number.isFinite(flow.upload) && Number.isFinite(flow.download);
}

function parseFlowHeaders(headers) {
  if (!headers) return {};
  const subInfo = getHeaderValue(headers, 'subscription-userinfo');
  const appUrl = getHeaderValue(headers, 'profile-web-page-url');
  const planName = getHeaderValue(headers, 'plan-name');
  const flow = parseFlowString(subInfo);
  if (appUrl) flow.appUrl = appUrl;
  if (planName) flow.planName = planName;
  return flow;
}

function parseFlowString(raw) {
  const s = String(raw || '');
  const field = (key) => {
    const m = s.match(new RegExp(key + '=([-+]?)([0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)'));
    return m ? Number(m[1] + m[2]) : NaN;
  };
  const strField = (key) => {
    const m = s.match(new RegExp(key + '=(.*?)\\s*?(;|$)'));
    if (!m) return '';
    return safeDecode(m[1]);
  };
  return normalizeFlow({
    upload: field('upload'),
    download: field('download'),
    total: field('total'),
    expire: field('expire'),
    app_url: strField('app_url'),
    plan_name: strField('plan_name'),
  });
}

function renderWidget(cfg, payload, stale, staleMsg) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const fam = cfg.family;

  if (fam === 'accessoryInline') {
    return {
      type: 'widget',
      refreshAfter: refreshISO(cfg.refreshMinutes),
      url: cfg.openUrl,
      children: [renderInline(cfg, items[0], stale)],
    };
  }

  if (fam === 'accessoryCircular') {
    return root(cfg, [renderCircular(items[0], stale, cfg)], stale);
  }

  if (fam === 'accessoryRectangular') {
    return root(cfg, [renderAccessoryRectangular(cfg, items[0], stale)], stale);
  }

  const limit = fam === 'systemLarge' || fam === 'systemExtraLarge' ? 5 : fam === 'systemSmall' ? 1 : 2;
  const shown = items.slice(0, limit);
  const children = [header(cfg, payload, stale)];

  if (items.length > 1) {
    children.push(summaryCard(aggregate(items)));
  }

  if (fam === 'systemSmall') {
    children.push(renderSmallCard(shown[0]));
  } else {
    for (const item of shown) children.push(renderCard(item));
  }

  children.push(footer(cfg, payload, stale, staleMsg));
  return root(cfg, children, stale);
}

function root(cfg, children, stale) {
  return {
    type: 'widget',
    url: cfg.openUrl,
    refreshAfter: refreshISO(cfg.refreshMinutes),
    padding: [6, 14, 4, 14], 
    gap: 4,                  
    backgroundColor: stale ? {
      light: '#FFFBEB',
      dark: '#2B1B0F'
    } : {
      light: '#FFFFFF',
      dark: '#1C1C1E'
    },
    children,
  };
}

function header(cfg, payload, stale) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    gap: 6,
    children: [
      {
        type: 'image',
        src: stale ? 'sf-symbol:exclamationmark.triangle.fill' : 'sf-symbol:chart.bar.xaxis',
        color: stale ? '#F59E0B' : '#3B82F6',
        width: 12,
        height: 12,
      },
      text(stale ? cfg.title + ' · 缓存' : cfg.title, 'footnote', 'bold', { light: '#1C1C1E', dark: '#E5E7EB' }, 1.0),
      { type: 'spacer' },
      text(fmtClock(payload.at || Date.now()), 'caption1', 'regular', { light: '#6B7280', dark: '#94A3B8' }, 1.0),
    ],
  };
}

function summaryCard(summary) {
  const textVal = summary ? summary.text : '--';
  const colorVal = summary ? summary.color : '#10B981';
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    gap: 8,
    padding: [4, 10],
    backgroundColor: { light: '#E0F2FE65', dark: '#0EA5E910' },
    borderRadius: 5,
    children: [
      { type: 'image', src: 'sf-symbol:sum', color: { light: '#0284C7', dark: '#BAE6FD' }, width: 12, height: 12 },
      text('合计剩余', 'footnote', 'semibold', { light: '#0369A1', dark: '#BAE6FD' }, 1.0),
      { type: 'spacer' },
      text(textVal, 'body', 'bold', colorVal, 1.0),
    ],
  };
}

function renderCard(item) {
  if (!item) return missingCard('未选择订阅');
  if (item.error) return errorCard(item.name || '订阅', item.error);

  const sublineChildren = [
    text('已用 ' + formatBytes(item.used) + ' / ' + totalText(item), 'caption2', 'regular', { light: '#6B7280', dark: '#94A3B8' }, 0.85)
  ];

  // 如果链接里配置了重置日，展示到副标题中
  if (item.resetDay) {
    sublineChildren.push(text('  |  重置: 每月 ' + item.resetDay + ' 号', 'caption2', 'regular', { light: '#6B7280', dark: '#94A3B8' }, 0.85));
  }

  if (item.expireAt && !isNaN(item.expireAt.getTime())) {
    sublineChildren.push(text('  |  到期: ' + fmtDate(item.expireAt), 'caption2', 'regular', { light: '#6B7280', dark: '#94A3B8' }, 0.85));
  }

  sublineChildren.push({ type: 'spacer' });
  sublineChildren.push(text(ratioText(item.remainRatio), 'caption2', 'semibold', colorForRemain(item.remainRatio), 0.9));

  return {
    type: 'stack',
    direction: 'column',
    gap: 2, 
    padding: [2, 0, 2, 0],
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        children: [
          text(displayName(item), 'body', 'bold', { light: '#111827', dark: '#FFFFFF' }, 1.0),
          { type: 'spacer' },
          text(remainText(item), 'body', 'bold', colorForRemain(item.remainRatio), 1.0)
        ]
      },
      
      progressBar(item.usedRatio, item.remainRatio),
      
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        children: sublineChildren
      }
    ],
  };
}

function renderSmallCard(item) {
  if (!item) return missingCard('未选择订阅');
  if (item.error) return errorCard(item.name || '订阅', item.error);

  return {
    type: 'stack',
    direction: 'column',
    gap: 4,
    padding: [6, 8],
    backgroundColor: { light: '#F3F4F6', dark: '#FFFFFF12' },
    borderRadius: 8,
    children: [
      text(displayName(item), 'caption1', 'semibold', { light: '#111827', dark: '#FFFFFF' }, 1.0),
      text(remainText(item), 'subheadline', 'bold', colorForRemain(item.remainRatio), 1.0),
      progressBar(item.usedRatio, item.remainRatio)
    ],
  };
}

function renderInline(cfg, item, stale) {
  if (!item) return text('未选择订阅', 'caption1', 'semibold', { light: '#111827', dark: '#FFFFFF' }, 1.0);
  if (item.error) return text(displayName(item) + ' · ' + item.error, 'caption1', 'semibold', '#EF4444', 1.0);
  const body = displayName(item) + ' 剩余 ' + remainText(item);
  return text(body, 'caption1', 'semibold', stale ? '#D97706' : { light: '#111827', dark: '#FFFFFF' }, 1.0);
}

function renderCircular(item, stale, cfg) {
  const pct = Number.isFinite(item && item.remainRatio) ? Math.round(item.remainRatio * 100) + '%' : '--';
  return {
    type: 'widget',
    url: cfg.openUrl,
    refreshAfter: refreshISO(cfg.refreshMinutes),
    padding: 4,
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0)',
    children: [
      { type: 'image', src: 'sf-symbol:chart.pie.fill', color: stale ? '#F59E0B' : colorForRemain(item && item.remainRatio), width: 16, height: 16 },
      text(pct, 'headline', 'bold', { light: '#111827', dark: '#FFFFFF' }, 1.0, { textAlign: 'center' }),
    ],
  };
}

function renderAccessoryRectangular(cfg, item, stale) {
  if (!item) return missingCard('未选择订阅');
  if (item.error) return errorCard(item.name || '订阅', item.error);
  return {
    type: 'stack',
    direction: 'column',
    gap: 2,
    padding: 6,
    backgroundColor: { light: '#F3F4F6', dark: '#FFFFFF10' },
    borderRadius: 8,
    children: [
      text(displayName(item), 'caption1', 'semibold', { light: '#111827', dark: '#FFFFFF' }, 1.0),
      text(remainText(item), 'headline', 'bold', colorForRemain(item.remainRatio), 1.0)
    ],
  };
}

function footer(cfg, payload, stale, staleMsg) {
  const source = payload.source || cfg.baseUrl;
  const msg = stale ? '缓存模式 · ' + (staleMsg || '最新请求失败') : '数据源 ' + source;
  return text(msg, 'caption2', 'regular', stale ? '#D97706' : { light: '#9CA3AF', dark: '#71717A' }, 1.0);
}

function errorWidget(cfg, title, msg) {
  return {
    type: 'widget',
    url: cfg.openUrl,
    refreshAfter: refreshISO(cfg.refreshMinutes),
    padding: 12,
    gap: 6,
    backgroundColor: { light: '#FEF2F2', dark: '#2D1A1A' },
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        children: [
          { type: 'image', src: 'sf-symbol:exclamationmark.triangle.fill', color: '#EF4444', width: 14, height: 14 },
          text(title, 'headline', 'bold', { light: '#991B1B', dark: '#FFFFFF' }, 1.0),
        ],
      },
      text(msg, 'caption1', 'regular', { light: '#B91C1C', dark: '#FCA5A5' }, 1.0),
    ],
  };
}

function missingCard(msg) {
  return {
    type: 'stack',
    direction: 'column',
    gap: 4,
    padding: [6, 8],
    backgroundColor: { light: '#E5E7EB', dark: '#FFFFFF12' },
    borderRadius: 8,
    children: [
      text('提示', 'caption1', 'semibold', { light: '#374151', dark: '#FFFFFF' }, 1.0),
      text(msg, 'caption2', 'regular', { light: '#4B5563', dark: '#CBD5E1' }, 1.0),
    ],
  };
}

function errorCard(title, msg) {
  return {
    type: 'stack',
    direction: 'column',
    gap: 4,
    padding: [6, 8],
    backgroundColor: { light: '#FEE2E2', dark: '#7F1D1D55' },
    borderRadius: 8,
    children: [
      text(title, 'caption1', 'semibold', { light: '#991B1B', dark: '#FFFFFF' }, 1.0),
      text(msg, 'caption2', 'regular', { light: '#B91C1C', dark: '#FCA5A5' }, 1.0),
    ],
  };
}

function progressBar(usedRatio, remainRatio) {
  if (!Number.isFinite(usedRatio)) {
    return {
      type: 'stack',
      direction: 'row',
      alignItems: 'center',
      gap: 4,
      children: [
        { type: 'image', src: 'sf-symbol:infinity', color: '#10B981', width: 10, height: 10 },
        text('无限流量', 'caption2', 'semibold', '#10B981', 1.0),
      ],
    };
  }
  const pct = clamp(usedRatio, 0, 1);
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    height: 6, 
    backgroundColor: { light: '#E5E7EB', dark: '#FFFFFF15' },
    borderRadius: 3,
    children: [
      {
        type: 'stack',
        height: 6,
        backgroundColor: colorForRemain(remainRatio),
        borderRadius: 3,
        flex: pct > 0.02 ? pct : 0.02,
        children: [{ type: 'spacer' }],
      },
      { type: 'spacer', flex: (1 - pct) > 0 ? (1 - pct) : 0.001 },
    ],
  };
}

function aggregate(items) {
  const finite = items.filter((i) => i && Number.isFinite(i.total) && i.total > 0 && Number.isFinite(i.remain));
  if (!finite.length) return null;
  const remain = finite.reduce((sum, i) => sum + i.remain, 0);
  const total = finite.reduce((sum, i) => sum + i.total, 0);
  const ratio = total > 0 ? remain / total : NaN;
  return {
    text: formatBytes(remain),
    color: colorForRemain(ratio),
  };
}

function remainText(item) {
  if (!item) return '--';
  if (!Number.isFinite(item.total) || item.total <= 0) return '无限流量';
  return formatBytes(item.remain);
}

function totalText(item) {
  if (!item || !Number.isFinite(item.total) || item.total <= 0) return '无限';
  return formatBytes(item.total);
}

function ratioText(remainRatio) {
  if (!Number.isFinite(remainRatio)) return '无限';
  return Math.round(clamp(remainRatio, 0, 1) * 100) + '%';
}

function displayName(item) {
  if (!item) return '订阅';
  return item.name || '订阅';
}

function colorForRemain(remainRatio) {
  if (!Number.isFinite(remainRatio)) return '#10B981';
  if (remainRatio <= 0.3) return '#EF4444';
  if (remainRatio <= 0.5) return '#F59E0B';
  return '#10B981';
}

function parseArgs(rawUrl) {
  const url = String(rawUrl || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean) || '';
  const idx = url.indexOf('#');
  if (idx < 0) return {};
  const frag = url.slice(idx + 1).trim();
  if (!frag) return {};

  try {
    const obj = JSON.parse(safeDecode(frag));
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
  } catch (_) {}

  const out = {};
  for (const part of frag.split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = eq < 0 ? part : part.slice(0, eq);
    const val = eq < 0 ? '' : part.slice(eq + 1);
    out[key] = val === '' ? true : safeDecode(val);
  }
  return out;
}

function requestJson(ctx, url, cfg) {
  return ctx.http
    .get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Egern-SubStore-Widget',
      },
      timeout: cfg.timeout,
      redirect: 'follow',
      insecureTls: cfg.insecureTls,
    })
    .then(async (resp) => {
      const text = await safeText(resp);
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error('HTTP ' + resp.status + ' ' + preview(text, 120));
      }
      try {
        return JSON.parse(text);
      } catch (_) {
        throw new Error('JSON 解析失败 ' + preview(text, 120));
      }
    });
}

function unwrapData(json) {
  if (json && typeof json === 'object' && 'data' in json) return json.data;
  return json;
}

async function safeText(resp) {
  try { return await resp.text(); } catch (_) { return ''; }
}

function apiUrl(base, path) {
  const b = normalizeBaseUrl(base);
  const p = String(path || '').startsWith('/') ? String(path || '') : '/' + String(path || '');
  if (/\/api$/i.test(b) && p.startsWith('/api/')) return b + p.slice(4);
  return b + p;
}

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

 function unique(arr) {
  const out = [];
  for (const item of arr) {
    if (item && !out.includes(item)) out.push(item);
  }
  return out;
}

function firstHttpUrl(raw) {
  const lines = String(raw || '').split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
  return lines.find((s) => /^https?:\/\//i.test(s)) || '';
}

function splitUrlArgs(raw) {
  const s = String(raw || '');
  const idx = s.indexOf('#');
  if (idx < 0) return { url: s, args: {} };
  return { url: s.slice(0, idx), args: parseArgs(s) };
}

function parseHeaderObject(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  try {
    const obj = JSON.parse(String(raw));
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  } catch (_) {
    return {};
  }
}

function getHeaderValue(headers, name) {
  if (!headers) return '';
  try { if (typeof headers.get === 'function') return headers.get(name) || ''; } catch (_) {}
  const lower = String(name).toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      const v = headers[key];
      return Array.isArray(v) ? v.join(', ') : String(v || '');
    }
  }
  return '';
}

function parseList(v) {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(v || '').trim();
  if (!s) return [];
  if (s[0] === '[') {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String).map((x) => x.trim()).filter(Boolean);
    } catch (_) {}
  }
  return s.split(/[\n,|]+/).map((x) => x.trim()).filter(Boolean);
}

function readStoredSubscriptions(ctx) {
  const storage = ctx && ctx.storage;
  if (!storage) return [];
  const candidates = [];
  const keys = ['subs', 'sub-store', 'Sub-Store', 'substore', 'SubStore', 'subscriptions'];
  for (const key of keys) {
    try { if (typeof storage.getJSON === 'function') candidates.push(storage.getJSON(key)); } catch (_) {}
    try { if (typeof storage.get === 'function') candidates.push(parseMaybeJSON(storage.get(key))); } catch (_) {}
  }
  for (const value of candidates) {
    const subs = extractSubsFromValue(value);
    if (subs.length) return subs;
  }
  return [];
}

function readStoredFlow(ctx, name) {
  const storage = ctx && ctx.storage;
  if (!storage) return null;
  const keys = ['flow:' + name, 'flow_' + name, 'sub-flow:' + name, 'sub_flow_' + name, 'substore-flow:' + name, 'substore_flow_' + name];
  for (const key of keys) {
    try {
      if (typeof storage.getJSON === 'function') {
        const flow = normalizeFlow(storage.getJSON(key));
        if (hasUsableFlow(flow)) return flow;
      }
    } catch (_) {}
    try {
      if (typeof storage.get === 'function') {
        const flow = normalizeFlow(parseMaybeJSON(storage.get(key)));
        if (hasUsableFlow(flow)) return flow;
      }
    } catch (_) {}
  }
  return null;
}

function parseMaybeJSON(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch (_) { return null; }
}

function extractSubsFromValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    const arr = value.filter((item) => item && typeof item === 'object' && item.name);
    if (arr.length) return arr.map((item) => ({ ...item, source: item.source || 'storage' }));
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value.subs)) return extractSubsFromValue(value.subs);
    if (value.data) return extractSubsFromValue(value.data);
    if (value.cache) return extractSubsFromValue(value.cache);
    if (value['sub-store']) return extractSubsFromValue(value['sub-store']);
    const vals = Object.values(value);
    const arr = vals.filter((item) => item && typeof item === 'object' && item.name && (item.url || item.content || item.subUserinfo));
    if (arr.length) return arr.map((item) => ({ ...item, source: item.source || 'storage' }));
  }
  return [];
}

function bool(v, def) {
  if (v == null || v === '') return !!def;
  const s = String(v).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on', 'y'].includes(s);
}

function text(value, size, weight, color, minScale) {
  return {
    type: 'text',
    text: value == null ? '' : String(value),
    font: { size: size || 'body', weight: weight || 'regular' },
    textColor: color || '#FFFFFF',
    maxLines: 1,
    minScale: minScale || 1.0, 
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function clampInt(v, def, min, max) {
  const n = parseInt(v, 10);
  const x = Number.isFinite(n) ? n : def;
  return Math.min(max, Math.max(min, x));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function finiteOrZero(v) { return Number.isFinite(v) ? v : 0; }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function refreshISO(minutes) { return new Date(Date.now() + minutes * 60000).toISOString(); }
function pad2(n) { return String(n).padStart(2, '0'); }
function safeDecode(s) { try { return decodeURIComponent(String(s).replace(/\+/g, '%20')); } catch (_) { return String(s); } }

function fmtClock(ts) {
  const d = new Date(ts);
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

function fmtDate(d) {
  if (!d || isNaN(d.getTime())) return '';
  return (d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function shortError(err) {
  const msg = err && err.message ? err.message : String(err || '未知错误');
  return preview(msg, 80);
}

function preview(s, len) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

function writeCache(ctx, cfg, payload) {
  if (!cfg.useCache || !ctx.storage || !ctx.storage.setJSON) return;
  try { ctx.storage.setJSON(cfg.cacheKey, payload); } catch (_) {}
}

function readCache(ctx, cfg) {
  if (!cfg.useCache || !ctx.storage || !ctx.storage.getJSON) return null;
  try { return ctx.storage.getJSON(cfg.cacheKey); } catch (_) { return null; }
}
