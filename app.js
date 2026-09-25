/* ============================================================
   页面逻辑：渲染卡片 / 分类筛选 / 搜索 / 分页 / 底部信息弹窗
   一般不用改这里，改内容请编辑 tools.js
   ============================================================ */
(function () {
    'use strict';

    // 平台英文 -> 显示图标
    // ---------- 标签自动配色 ----------
    // 按标签文本算稳定色相（同一标签永远同色，不同标签尽量错开）
    var TAG_HUES = [212, 262, 152, 32, 340, 190, 96, 18];
    // HTML 转义（所有插入 innerHTML 的动态内容都要过一遍）
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // 生成占位图（data URI 的 SVG，不依赖网络）
    function placeholder(name, w, h) {
        var text = String(name || '').slice(0, 12);
        // 按名字算色相，每个工具颜色不同
        var hue = 0;
        for (var i = 0; i < text.length; i++) hue = (hue * 31 + text.charCodeAt(i)) % 360;
        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0" stop-color="hsl(' + hue + ',62%,54%)"/>' +
                    '<stop offset="1" stop-color="hsl(' + ((hue + 42) % 360) + ',58%,38%)"/>' +
                '</linearGradient></defs>' +
                '<rect width="100%" height="100%" fill="url(#g)"/>' +
                '<text x="50%" y="50%" fill="#fff" font-size="' + Math.max(11, Math.round(h * 0.17)) + '" ' +
                    'font-family="sans-serif" text-anchor="middle" dominant-baseline="central">' +
                    text.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
                '</text>' +
            '</svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    // 从网址提取域名
    function hostOf(url) {
        if (!url) return '';
        var s = String(url).trim();
        if (!/^(https?:)?\/\//i.test(s)) s = 'https://' + s;
        try { return new URL(s).hostname.replace(/^www\./, ''); }
        catch (e) {
            var m = s.match(/^(?:https?:)?\/\/([^\/]+)/i);
            return m ? m[1].replace(/^www\./, '') : '';
        }
    }

    function tagHue(text) {
        var h = 0;
        for (var i = 0; i < text.length; i++) {
            h = (h * 31 + text.charCodeAt(i)) >>> 0;
        }
        return TAG_HUES[h % TAG_HUES.length];
    }

    // ---------- 常用 DOM 元素 ----------
    var grid      = document.getElementById('grid');
    var tabsBox   = document.getElementById('tabs');
    var searchInp = document.getElementById('search');
    var pagerBox  = document.getElementById('pager');
    var footCards = document.getElementById('foot-cards');
    var sliderBox = document.getElementById('slider');
    var newsBox   = document.getElementById('newsbar');
    var mask      = document.getElementById('mask');
    var box       = document.getElementById('modal-box');

    // ---------- 常用 DOM 元素 ----------
    var grid      = document.getElementById('grid');
    var tabsBox   = document.getElementById('tabs');
    var searchInp = document.getElementById('search');
    var pagerBox  = document.getElementById('pager');
    var footCards = document.getElementById('foot-cards');
    var sliderBox = document.getElementById('slider');
    var newsBox   = document.getElementById('newsbar');
    var mask      = document.getElementById('mask');
    var box       = document.getElementById('modal-box');

    // ---------- 状态 ----------
    var PAGE_SIZE  = (typeof SITE !== 'undefined' && SITE.pageSize) || 12;
    var curCat     = '全部';
    var curSub     = '';      // 当前二级类目（空=不限）
    var openCat    = '';      // 当前展开的一级类目（手风琴，同时只有一个）
    var curPage    = 1;
    var curKey     = '';      // 搜索关键词
    var totalCount = 0;       // 筛选后的总条数

    var PLAT = {
        windows: '🪟', macos: '🍎', linux: '🐧',
        android: '🤖', ios: '📱', web: '🌐'
    };

    // ---------- 网盘识别 ----------
    // key 是网盘代号，填在 tools.js 的 pan 字段里；不填则按 link 域名自动判断
    // icon 支持 emoji，也支持图片路径（'ico/quark.png'），写了路径就渲染成小图
    // 想改图标 / 名字 / 颜色，直接改下面这张表即可
    var PAN = {
        quark:   { name: '夸克网盘', icon: '🚀', color: '#4a6cf7', hosts: ['pan.quark.cn'] },
        baidu:   { name: '百度网盘', icon: '🐻', color: '#2e6be6', hosts: ['pan.baidu.com', 'yun.baidu.com'] },
        xunlei:  { name: '迅雷网盘', icon: '⚡', color: '#ff6a00', hosts: ['pan.xunlei.com'] },
        '123':   { name: '123云盘', icon: '1️⃣', color: '#3b82f6', hosts: ['123pan.com', '123684.com', '123912.com'] },
        aliyun:  { name: '阿里云盘', icon: '☁️', color: '#ff7d00', hosts: ['aliyundrive.com', 'alipan.com'] },
        uc:      { name: 'UC网盘',  icon: '🅤', color: '#f0405c', hosts: ['drive.uc.cn'] },
        tianyi:  { name: '天翼云盘', icon: '📡', color: '#0069d9', hosts: ['cloud.189.cn'] },
        lanzou:  { name: '蓝奏云',  icon: '🔷', color: '#4c9af5', hosts: ['lanzoup.com', 'lanzoux.com', 'lanzoui.com', 'lanzouy.com'] },
        weiyun:  { name: '腾讯微云', icon: '🐧', color: '#12b7f5', hosts: ['share.weiyun.com'] },
        caiyun:  { name: '移动云盘', icon: '📱', color: '#0f9d58', hosts: ['caiyun.139.com'] },
        onedrive:{ name: 'OneDrive', icon: '🗂️', color: '#0078d4', hosts: ['1drv.ms', 'onedrive.live.com'] },
        google:  { name: 'Google Drive', icon: '📁', color: '#1fa463', hosts: ['drive.google.com'] },
        magnet:  { name: '磁力链接', icon: '🧲', color: '#8b5cf6', hosts: [] },
        ed2k:    { name: '电驴链接', icon: '🐴', color: '#8b5cf6', hosts: [] },
        direct:  { name: '直链下载', icon: '⬇️', color: '#64748b', hosts: [] }
    };

    // 按 link 域名自动判断网盘（tools.js 里没写 pan 时用它）
    function panFromLink(link) {
        var u = String(link || '');
        if (/^magnet:/i.test(u)) return 'magnet';
        if (/^ed2k:/i.test(u))   return 'ed2k';
        var h = hostOf(u);
        if (!h) return '';
        for (var k in PAN) {
            var hosts = PAN[k].hosts || [];
            for (var i = 0; i < hosts.length; i++) {
                // 精确匹配域名，或以 .域名 结尾（覆盖二级域）
                if (h === hosts[i] || h.indexOf('.' + hosts[i]) !== -1) return k;
            }
        }
        return '';
    }

    // ---------- 网盘：统一成数组 ----------
    // tools.js 里可以只写单个 link（老写法），也可以写 pans 数组（多网盘）
    // 这里统一归一成数组，后面的渲染/切换逻辑只认数组
    function normalizePans(t) {
        var arr = [];

        // ① 新写法：pans 数组
        if (t.pans && t.pans.length) {
            t.pans.forEach(function (p) {
                if (!p) return;
                arr.push({
                    key:   p.pan || panFromLink(p.link || t.link),
                    name:  p.panName,
                    icon:  p.panIcon,
                    color: p.panColor,
                    link:  p.link  || t.link || '',
                    code:  p.code  || ''
                });
            });
        }

        // ② 老写法：单个 link
        if (!arr.length && t.link) {
            arr.push({
                key:   t.pan || panFromLink(t.link),
                name:  t.panName,
                icon:  t.panIcon,
                color: t.panColor,
                link:  t.link,
                code:  t.code || ''
            });
        }

        // 补全预设（没手填 name/icon/color 的，从 PAN 表里取）
        return arr.map(function (p) {
            var info = PAN[p.key] || null;
            return {
                key:   p.key,
                name:  p.name  || (info ? info.name : ''),
                icon:  p.icon  || (info ? info.icon : ''),
                color: p.color || (info ? info.color : ''),
                link:  p.link,
                code:  p.code,
                // 没识别出来的：兜底显示域名
                host:  hostOf(p.link)
            };
        }).filter(function (p) {
            // 连链接都没有的整项丢弃
            return !!p.link;
        });
    }

    // 单个网盘的图标 HTML（emoji 或图片）
    function panIconHtml(icon) {
        if (!icon) return '';
        var isImg = /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(String(icon)) ||
                    /^(https?:)?\/\//i.test(String(icon));
        return isImg
            ? '<img class="pan-img" src="' + esc(icon) + '" alt="">'
            : '<i class="pan-emo">' + esc(icon) + '</i>';
    }

    // 渲染「网盘」行：一个网盘=静态徽章，多个=可点击切换的按钮组
    function panHtml(t) {
        var list = normalizePans(t);
        if (!list.length) return '';

        var multi = list.length > 1;

        var inner = list.map(function (p, i) {
            var info = PAN[p.key] || null;
            var name  = p.name  || p.host || '网盘';
            var icon  = p.icon  || (info ? info.icon : PAN.direct.icon);
            var color = p.color || (info ? info.color : PAN.direct.color);

            var tag  = multi ? 'button' : 'span';
            var attr = multi
                ? ' type="button" data-idx="' + i + '"' +
                  ' aria-pressed="' + (i === 0 ? 'true' : 'false') + '"' +
                  ' title="点击选用' + esc(name) + '的链接"'
                : '';

            return '<' + tag + ' class="pan-badge' + (multi && i === 0 ? ' on' : '') + '"' +
                       attr + (color ? ' style="--pan-c:' + esc(color) + '"' : '') + '>' +
                       panIconHtml(icon) +
                       '<b>' + esc(name) + '</b>' +
                   '</' + tag + '>';
        }).join('');

        return '<div class="row pan-row">' +
                   '<span>网盘</span>' +
                   '<span class="pan-list' + (multi ? ' multi' : '') + '">' + inner + '</span>' +
               '</div>';
    }

    // ---------- 图标多源兜底 ----------
    // 顺序：本地 ico/ → 国内源 → 境外源 → 占位
    var ICON_SOURCES = [
        function (h) { return 'ico/' + h + '.png'; },                         // ① 本地（最快最稳）
        function (h) { return 'https://api.iowen.cn/favicon/' + h + '.png'; },// ② 国内：一为
        function (h) { return 'https://favicon.im/' + h; },                   // ③ 境外
        function (h) { return 'https://icons.duckduckgo.com/ip3/' + h + '.ico'; } // ④ 境外备用
    ];

    // 按顺序尝试图源，前一个 404/超时就换下一个
    function loadIcon(img, host, fallbackName) {
        if (!host) { img.src = placeholder(fallbackName || '', 64, 64); return; }
        var i = 0;
        function tryNext() {
            if (i >= ICON_SOURCES.length) {
                img.src = placeholder(fallbackName || host, 64, 64);
                return;
            }
            var url = ICON_SOURCES[i++](host);
            var probe = new Image();
            var done = false;
            var timer = setTimeout(function () {
                if (done) return; done = true; probe.src = ''; tryNext();
            }, 4000);
            probe.onload = function () {
                if (done) return; done = true; clearTimeout(timer);
                if (probe.naturalWidth < 8) { tryNext(); return; }
                img.src = url;
            };
            probe.onerror = function () {
                if (done) return; done = true; clearTimeout(timer); tryNext();
            };
            probe.src = url;
        }
        tryNext();
    }

    function imgOf(t, isBig) {
        var auto = (typeof SITE !== 'undefined' && SITE.autoPlaceholder !== false);
        if (isBig) {
            // 弹窗：优先 cover，没有就用 thumb 放大，都没有才占位
            if (t.cover) return t.cover;
            if (t.thumb) return t.thumb;
            return auto ? placeholder(t.name, 800, 600) : '';
        }
        // 卡片：优先 thumb，其次 cover，都没有就占位
        if (t.thumb) return t.thumb;
        if (t.cover) return t.cover;
        return auto ? placeholder(t.name, 320, 240) : '';
    }

    // ---------- 图片智能加载 ----------
    // 参考同类站点：预加载距离随「省流量模式」收缩（360px → 160px）
    var saveData = false;
    try {
        var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
        saveData = !!(conn && conn.saveData);
    } catch (e) {}

    function idle(fn) {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(fn, { timeout: 1200 });
        } else {
            setTimeout(fn, 80);
        }
    }

    // 预加载一批图片（空闲时做，不抢主线程）
    function preload(urls) {
        idle(function () {
            urls.forEach(function (u) {
                if (!u || u.indexOf('data:') === 0) return;   // 占位图不用预加载
                var im = new Image();
                im.decoding = 'async';
                im.src = u;
            });
        });
    }

    // 观察图片：进入视口附近才真正加载，并把后面几张一并预热
    var imgObserver = null;
    function initLazyImages() {
        var imgs = grid.querySelectorAll('img[data-lazy]');
        if (!imgs.length) return;

        // 不支持 IntersectionObserver 就直接全部加载，不做懒加载
        if (typeof IntersectionObserver === 'undefined') {
            imgs.forEach(function (im) { im.src = im.getAttribute('data-lazy'); });
            return;
        }

        if (imgObserver) imgObserver.disconnect();
        var margin = saveData ? '160px 0px' : '360px 0px';

        imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var im = en.target;
                im.src = im.getAttribute('data-lazy');
                im.removeAttribute('data-lazy');
                imgObserver.unobserve(im);

                // 顺手预热后面 2 张，翻页/滚动时不会白屏
                var all = [].slice.call(grid.querySelectorAll('img[data-lazy]'));
                preload(all.slice(0, saveData ? 1 : 2).map(function (x) {
                    return x.getAttribute('data-lazy');
                }));
            });
        }, { rootMargin: margin });

        imgs.forEach(function (im) { imgObserver.observe(im); });
    }

    // 图片加载失败：换成占位图，不留破图
    function onImgError(im) {
        if (im.dataset.fallback === '1') return;
        im.dataset.fallback = '1';
        var name = im.getAttribute('alt') || '';
        im.src = placeholder(name, 320, 240);
    }

    // 当前筛选后的完整列表
    function filtered() {
        return TOOLS.filter(function (t) {
            var okCat = (curCat === '全部') || (t.cat === curCat);
            if (!okCat) return false;
            // 选了二级就再筛一层（没填 subCat 的条目不会出现在二级下）
            if (curSub && t.subCat !== curSub) return false;
            if (!curKey) return true;
            var k = curKey.toLowerCase();
            return (t.name + ' ' + t.desc + ' ' + (t.detail || '') + ' ' + t.cat)
                .toLowerCase().indexOf(k) !== -1;
        });
    }

    // ---------- 工具动态轮播 ----------
    var slideIdx = 0;
    var slideTimer = null;

    function renderSlider() {
        var list = (typeof BANNERS !== 'undefined' && BANNERS.length) ? BANNERS : [];
        if (!list.length) { sliderBox.innerHTML = ''; return; }

        var slides = list.map(function (b, i) {
            return '' +
                '<div class="slide' + (i === 0 ? ' on' : '') + '" data-i="' + i + '"' +
                     ' style="background:' + esc(b.bg || 'linear-gradient(120deg,#1f6feb,#7c5cff)') + '">' +
                    '<div class="slide-txt">' +
                        (b.tag ? '<span class="slide-tag">' + esc(b.tag) + '</span>' : '') +
                        '<h3 class="slide-title">' + esc(b.title || '') + '</h3>' +
                        (b.desc ? '<p class="slide-desc">' + esc(b.desc) + '</p>' : '') +
                    '</div>' +
                    (b.emoji ? '<div class="slide-emoji">' + esc(b.emoji) + '</div>' : '') +
                '</div>';
        }).join('');

        var dots = list.map(function (b, i) {
            return '<button class="s-dot' + (i === 0 ? ' on' : '') +
                   '" data-i="' + i + '" aria-label="第' + (i + 1) + '张"></button>';
        }).join('');

        sliderBox.innerHTML = '' +
            '<div class="slider-view">' +
                slides +
                (list.length > 1
                    ? '<button class="s-arrow prev" id="s-prev">‹</button>' +
                      '<button class="s-arrow next" id="s-next">›</button>' +
                      '<div class="s-dots">' + dots + '</div>'
                    : '') +
            '</div>';

        var nodeList = sliderBox.querySelectorAll('.slide');

        function go(n) {
            slideIdx = (n + list.length) % list.length;
            nodeList.forEach(function (el, i) {
                el.classList.toggle('on', i === slideIdx);
            });
            sliderBox.querySelectorAll('.s-dot').forEach(function (d, i) {
                d.classList.toggle('on', i === slideIdx);
            });
        }

        function stop() {
            if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
        }
        function start() {
            stop();
            if (list.length > 1) slideTimer = setInterval(function () { go(slideIdx + 1); }, 4500);
        }

        // 箭头
        var prev = document.getElementById('s-prev');
        var next = document.getElementById('s-next');
        if (prev) prev.addEventListener('click', function () { go(slideIdx - 1); start(); });
        if (next) next.addEventListener('click', function () { go(slideIdx + 1); start(); });

        // 指示点
        sliderBox.querySelectorAll('.s-dot').forEach(function (d) {
            d.addEventListener('click', function () {
                go(parseInt(d.getAttribute('data-i'), 10)); start();
            });
        });

        // 点击整张 -> 跳转
        nodeList.forEach(function (el) {
            el.addEventListener('click', function () {
                var b = list[parseInt(el.getAttribute('data-i'), 10)];
                if (b && b.link) window.open(b.link, '_blank', 'noopener');
            });
        });

        // 鼠标悬停暂停
        var view = sliderBox.querySelector('.slider-view');
        if (view) {
            view.addEventListener('mouseenter', stop);
            view.addEventListener('mouseleave', start);
        }

        start();
    }

    // ---------- 更新动态横条 ----------
    // 直接读 TOOLS 的 date 字段倒序生成，不用另外维护
    // 动态条轮播索引与定时器（模块级，方便暂停/恢复）
    var newsIdx = 0;
    var newsTimer = null;
    var newsList = [];

    function renderNews() {
        if (!newsBox) return;
        var n = (typeof SITE !== 'undefined' && SITE.newsCount) || 3;

        newsList = TOOLS.slice().sort(function (a, b) {
            return String(b.date || '').localeCompare(String(a.date || ''));
        }).slice(0, n);

        if (!newsList.length) { newsBox.innerHTML = ''; return; }

        // 取更多条用于轮播（最多 8 条），避免只有 3 条显得单调
        var pool = TOOLS.slice().sort(function (a, b) {
            return String(b.date || '').localeCompare(String(a.date || ''));
        }).slice(0, Math.max(n, 6));

        var items = pool.map(function (t, i) {
            var d = (t.date || '').slice(5);   // 2026-09-13 -> 09-13
            return '<a class="news-item' + (i === 0 ? ' on' : '') + '"' +
                       ' data-id="' + esc(t.id) + '"' +
                       ' href="javascript:;" role="button"' +
                       ' aria-label="查看：' + esc(t.name) + '">' +
                       '<span class="d">' + esc(d) + '</span>' +
                       '<span class="txt">' + esc(t.name) +
                           (t.version ? ' ' + esc(t.version) : '') + ' 已更新</span>' +
                   '</a>';
        }).join('');

        // 指示点（条数多时显示）
        var dots = pool.length > 1
            ? '<span class="news-dots">' + pool.map(function (t, i) {
                  return '<button class="news-dot' + (i === 0 ? ' on' : '') +
                         '" data-i="' + i + '" aria-label="第' + (i + 1) + '条"></button>';
              }).join('') + '</span>'
            : '';

        newsBox.innerHTML = '' +
            '<div class="newsbar-inner">' +
                '<span class="newsbar-label"><i class="dot"></i>工具箱动态</span>' +
                '<span class="news-viewport">' + items + '</span>' +
                dots +
            '</div>';

        var nodes = newsBox.querySelectorAll('.news-item');
        var dotNodes = newsBox.querySelectorAll('.news-dot');

        function go(i) {
            newsIdx = (i + pool.length) % pool.length;
            nodes.forEach(function (el, k) { el.classList.toggle('on', k === newsIdx); });
            dotNodes.forEach(function (el, k) { el.classList.toggle('on', k === newsIdx); });
        }
        function stop() { if (newsTimer) { clearInterval(newsTimer); newsTimer = null; } }
        function start() {
            stop();
            if (pool.length > 1) newsTimer = setInterval(function () { go(newsIdx + 1); }, 3600);
        }

        // 点击某条 -> 打开对应资源
        nodes.forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                openToolModal(el.getAttribute('data-id'));
            });
        });
        // 点指示点 -> 跳到那条
        dotNodes.forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                go(parseInt(el.getAttribute('data-i'), 10)); start();
            });
        });

        // 悬停暂停，移开恢复
        var inner = newsBox.querySelector('.newsbar-inner');
        if (inner) {
            inner.addEventListener('mouseenter', stop);
            inner.addEventListener('mouseleave', start);
            // 触摸设备：按下暂停，抬起恢复
            inner.addEventListener('touchstart', stop, { passive: true });
            inner.addEventListener('touchend', start);
        }

        // 页面切到后台时停掉，省电
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else start();
        });

        newsIdx = 0;
        start();
    }

    // ---------- 分类（左侧栏 / 手机抽屉，同一份 DOM） ----------
    // 统计每个分类下有多少条
    function catCount(cat) {
        if (cat === '全部') return TOOLS.length;
        return TOOLS.filter(function (t) { return t.cat === cat; }).length;
    }

    // ---------- 二级类目 ----------
    // 配置在 tools.js 的 SITE.subCats，格式：{ '一级类目': ['二级1','二级2'] }
    function subCatsOf(cat) {
        var m = (typeof SITE !== 'undefined' && SITE.subCats) || {};
        return m[cat] || [];
    }

    // 某个二级类目下有几条（只统计同属该一级的）
    function subCount(cat, sub) {
        return TOOLS.filter(function (t) {
            return t.cat === cat && t.subCat === sub;
        }).length;
    }

    // 该一级类目下「没标二级」的条数（兜底，保证点一级时不会漏条目）
    function subUnfiled(cat) {
        return TOOLS.filter(function (t) {
            return t.cat === cat && !t.subCat;
        }).length;
    }

    // 分类图标（可用 SITE.catIcons 覆盖；缺省给一个通用图标）
    var CAT_ICON_DEFAULT = ['🧩', '🤖', '🛠️', '🚀', '🎨', '📦', '📚', '🎬', '🎵', '🔧'];
    function catIcon(cat, i) {
        var m = (typeof SITE !== 'undefined' && SITE.catIcons) || {};
        return m[cat] || CAT_ICON_DEFAULT[i % CAT_ICON_DEFAULT.length];
    }

    // 点一级类目：有二级就切换展开（手风琴，同时只开一个），无二级就直接筛选
    function onPickCat(cat) {
        var subs = subCatsOf(cat);

        if (subs.length) {
            // 再点同一个 = 收起；点别的 = 收起旧的、展开新的
            if (openCat === cat) {
                openCat = '';
                curCat  = cat;   // 收起二级，但一级仍是它
                curSub  = '';
            } else {
                openCat = cat;
                curCat  = cat;
                curSub  = '';    // 展开二级时先不限二级，看该一级全部
            }
        } else {
            openCat = '';
            curCat  = cat;
            curSub  = '';
        }

        curPage = 1;
        renderTabs();
        renderSubBar();
        renderAll();
        if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) {
            closeSidebar();
        }
    }

    // 点二级类目：筛选该子类目
    function onPickSub(cat, sub) {
        curCat  = cat;
        curSub  = sub;
        openCat = cat;
        curPage = 1;
        renderTabs();
        renderSubBar();
        renderAll();
        if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) {
            closeSidebar();
        }
    }

    function renderTabs() {
        // 顶部分类导航条（水平胶囊）
        var topBox = document.getElementById('tabs-top');
        if (topBox) {
            // 顶部只放一级分类（二级挪到「工具箱动态」下面的独立模块里了）
            topBox.innerHTML = CATEGORIES.map(function (c) {
                var on = (c === curCat);
                return '<button class="tab-pill' + (on ? ' on' : '') +
                           '" data-cat="' + esc(c) + '"' +
                           (on ? ' aria-current="true"' : '') + '>' +
                           esc(c) + '<span class="pill-num">' + catCount(c) + '</span>' +
                       '</button>';
            }).join('');
            topBox.querySelectorAll('.tab-pill').forEach(function (b) {
                b.addEventListener('click', function () {
                    onPickCat(b.getAttribute('data-cat'));
                });
            });
        }

        if (!tabsBox) return;

        // 左侧栏（竖排，带图标 + 数量 + 可展开的二级列表）
        var sideHtml = '';
        CATEGORIES.forEach(function (c, i) {
            var n    = catCount(c);
            var on   = (c === curCat);
            var subs = subCatsOf(c);
            var open = (openCat === c) && subs.length > 0;

            sideHtml +=
                '<button class="tab' + (on ? ' on' : '') + (subs.length ? ' has-sub' : '') + '"' +
                    ' data-cat="' + esc(c) + '"' +
                    (on ? ' aria-current="true"' : '') +
                    (subs.length ? ' aria-expanded="' + (open ? 'true' : 'false') + '"' : '') +
                    ' title="' + esc(c) + '（' + n + '）">' +
                    '<span class="tab-ico" aria-hidden="true">' + esc(catIcon(c, i)) + '</span>' +
                    '<span class="tab-name">' + esc(c) + '</span>' +
                    '<span class="tab-num">' + n + '</span>' +
                    (subs.length
                        ? '<i class="sub-toggle" aria-hidden="true">' + (open ? '▾' : '▸') + '</i>'
                        : '') +
                '</button>';

            // 二级列表（展开时才渲染；max-height 过渡在 CSS 里）
            if (subs.length) {
                sideHtml += '<div class="sub-list' + (open ? ' on' : '') +
                                '" data-cat="' + esc(c) + '">';
                subs.forEach(function (sc) {
                    var sn  = subCount(c, sc);
                    var on2 = (curSub === sc && curCat === c);
                    sideHtml +=
                        '<button class="sub-item' + (on2 ? ' on' : '') + '"' +
                            ' data-cat="' + esc(c) + '" data-sub="' + esc(sc) + '"' +
                            ' tabindex="' + (open ? '0' : '-1') + '"' +
                            (on2 ? ' aria-current="true"' : '') + '>' +
                            '<span class="sub-name">' + esc(sc) + '</span>' +
                            '<span class="sub-num">' + sn + '</span>' +
                        '</button>';
                });
                var un = subUnfiled(c);
                if (un) {
                    sideHtml += '<div class="sub-note">未分类 ' + un + ' 条</div>';
                }
                sideHtml += '</div>';
            }
        });
        tabsBox.innerHTML = sideHtml;

        tabsBox.querySelectorAll('.tab').forEach(function (b) {
            b.addEventListener('click', function () {
                onPickCat(b.getAttribute('data-cat'));
            });
        });
        tabsBox.querySelectorAll('.sub-item').forEach(function (b) {
            b.addEventListener('click', function () {
                onPickSub(b.getAttribute('data-cat'), b.getAttribute('data-sub'));
            });
        });

        // 侧边栏底部统计
        var stat = document.getElementById('side-stat');
        if (stat) {
            var curLabel = curCat + (curSub ? ' · ' + curSub : '');
            var curNum   = curSub ? subCount(curCat, curSub) : catCount(curCat);
            stat.innerHTML = '<span class="stat-line">共 <b>' + TOOLS.length + '</b> 个资源</span>' +
                             '<span class="stat-line">当前：<b>' + esc(curLabel) + '</b> · ' +
                             curNum + ' 个</span>';
        }
    }

    // ---------- 二级类目模块（工具箱动态下方的独立区块）----------
    // 选中一级分类时，把它下面的二级横向铺成小胶囊；无二级则整块隐藏。
    // 点击二级 → onPickSub 筛选，顶部导航条保持只显示一级。
    function renderSubBar() {
        var el = document.getElementById('subbar');
        if (!el) return;

        var subs = subCatsOf(curCat);

        // 没配二级 → 整块隐藏（不留空白）
        if (!subs.length) { el.innerHTML = ''; el.hidden = true; return; }

        el.hidden = false;

        var chips = subs.map(function (sc) {
            var n   = subCount(curCat, sc);
            var on  = (curSub === sc);
            return '<button class="sub-chip' + (on ? ' on' : '') + '"' +
                       ' data-sub="' + esc(sc) + '"' +
                       (on ? ' aria-current="true"' : '') +
                       ' title="' + esc(sc) + '（' + n + '）">' +
                       '<span class="chip-name">' + esc(sc) + '</span>' +
                       '<span class="chip-num">' + n + '</span>' +
                   '</button>';
        }).join('');

        // 「全部」：清掉二级筛选，看该一级下的所有条目
        var allOn = !curSub;
        var allHtml =
            '<button class="sub-chip all' + (allOn ? ' on' : '') + '"' +
                ' data-sub="" title="查看' + esc(curCat) + '全部">' +
                '<span class="chip-name">全部</span>' +
                '<span class="chip-num">' + catCount(curCat) + '</span>' +
            '</button>';

        var un = subUnfiled(curCat);
        var note = un ? '<span class="sub-note">另有 ' + un + ' 条未分类</span>' : '';

        el.innerHTML =
            '<div class="subbar-inner">' +
                '<span class="subbar-label">' + esc(curCat) + '</span>' +
                '<div class="subbar-chips">' + allHtml + chips + '</div>' +
                note +
            '</div>';

        el.querySelectorAll('.sub-chip').forEach(function (b) {
            b.addEventListener('click', function () {
                var sub = b.getAttribute('data-sub');
                // 点了当前已选中的「全部」→ 收起二级模块，回到一级全部
                if (!sub && !curSub) { onPickCat(curCat); return; }
                if (sub) onPickSub(curCat, sub);
                else { curSub = ''; curPage = 1; renderTabs(); renderSubBar(); renderAll(); }
            });
        });
    }

    // ---------- 手机端：分类抽屉开关 ----------
    var sidebarEl = document.getElementById('sidebar');
    var maskEl    = document.getElementById('sidebar-mask');
    var menuBtn   = document.getElementById('menu-btn');
    var sideClose = document.getElementById('side-close');
    var lastFocusBeforeSidebar = null;

    function openSidebar() {
        if (!sidebarEl) return;
        lastFocusBeforeSidebar = document.activeElement;
        sidebarEl.classList.add('on');
        if (maskEl) maskEl.classList.add('on');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        // 焦点送进抽屉
        var first = sidebarEl.querySelector('.tab');
        setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, 60);
    }

    function closeSidebar() {
        if (!sidebarEl) return;
        sidebarEl.classList.remove('on');
        if (maskEl) maskEl.classList.remove('on');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.classList.remove('active');
        }
        document.body.style.overflow = '';
        if (lastFocusBeforeSidebar && lastFocusBeforeSidebar.focus) {
            try { lastFocusBeforeSidebar.focus({ preventScroll: true }); } catch (e) {}
        }
        lastFocusBeforeSidebar = null;
    }

    // ---------- 侧栏显示 / 隐藏（顶部按钮控制） ----------
    // hidden=true 表示隐藏侧栏
    function applySideState(hidden) {
        var shell = document.querySelector('.app-shell');
        if (shell) shell.classList.toggle('side-collapsed', !!hidden);

        var box = document.getElementById('side-toggle');
        if (box) box.checked = !!hidden;

        var sw = document.getElementById('side-switch');
        if (sw) {
            var tip = hidden ? '显示分类栏' : '隐藏分类栏';
            sw.setAttribute('title', tip);
            sw.setAttribute('aria-label', tip);
        }

        try { localStorage.setItem('toolbox-side-hidden', hidden ? '1' : '0'); } catch (e) {}

        // 宽度变了：重算 header 高度（sticky 定位依赖它），并让懒加载重新判断
        setTimeout(function () {
            window.dispatchEvent(new Event('resize'));
        }, 340);
    }

    function initSideCollapse() {
        var box = document.getElementById('side-toggle');
        if (!box) return;

        var saved = null;
        try { saved = localStorage.getItem('toolbox-side-hidden'); } catch (e) {}

        applySideState(saved === '1');

        box.addEventListener('change', function () {
            applySideState(box.checked);
        });
    }

    function initSidebar() {
        if (menuBtn) {
            menuBtn.addEventListener('click', function () {
                if (sidebarEl && sidebarEl.classList.contains('on')) closeSidebar();
                else openSidebar();
            });
        }
        if (sideClose) sideClose.addEventListener('click', closeSidebar);
        if (maskEl) maskEl.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (sidebarEl && sidebarEl.classList.contains('on')) { e.preventDefault(); closeSidebar(); }
        });

        // 从手机切到桌面尺寸时，确保抽屉状态被清掉
        if (window.matchMedia) {
            var mq = window.matchMedia('(min-width: 900px)');
            var onChange = function () { closeSidebar(); };
            if (mq.addEventListener) mq.addEventListener('change', onChange);
            else if (mq.addListener) mq.addListener(onChange);
        }
    }

    // ---------- 缩略图悬停动画 ----------
    // 静图（thumb）常显，鼠标移上去才换成动图（thumbAnim），移开还原。
    // 好处：首屏不加载动图（动图常是几 MB），只有用户真正感兴趣时才下载。
    function bindThumbAnim(card) {
        var img = card.querySelector('.c-thumb img');
        if (!img) return;
        var anim = img.getAttribute('data-anim');
        if (!anim) return;

        var still = '';          // 记住静图地址，移开时还原
        var loaded = false;      // 动图是否已缓存过（第二次悬停就秒切）

        card.addEventListener('mouseenter', function () {
            // 静图可能还没懒加载出来，取当前实际显示的
            still = img.getAttribute('data-lazy') || img.src;
            if (!loaded) {
                // 先偷偷预载，下载完再换，避免出现空白或半张图
                var probe = new Image();
                probe.onload = function () { loaded = true; img.src = anim; };
                probe.src = anim;
            } else {
                img.src = anim;
            }
        });

        card.addEventListener('mouseleave', function () {
            if (still) img.src = still;
        });

        // 触摸设备没有 hover，改为「点一下切换」，长按/再点还原
        card.addEventListener('touchstart', function () {
            still = img.getAttribute('data-lazy') || img.src;
            if (img.src.indexOf(anim) === -1) {
                if (!loaded) {
                    var probe = new Image();
                    probe.onload = function () { loaded = true; img.src = anim; };
                    probe.src = anim;
                } else { img.src = anim; }
            }
        }, { passive: true });
    }

    // ---------- 卡片 ----------
    function cardHtml(t) {
        var plats = (t.platforms || []).map(function (p) {
            return '<i class="plat" title="' + esc(p) + '">' + (PLAT[p] || '?') + '</i>';
        }).join('');

        var thumb = imgOf(t, false);
        var ratio = (typeof SITE !== 'undefined' && SITE.thumbRatio) || '4 / 3';
        var tags = (t.tags || []).map(function (x) {
            return '<span class="tag" style="--tag-h:' + tagHue(String(x)) + '">' +
                   esc(x) + '</span>';
        }).join('');

        // 分类属性（供 CSS 按分类着色）+ 置顶标记
        var cls = 'card has-thumb' + (t.pinned ? ' pinned' : '');

        // 占位图（data: 开头）直接显示；真实图片交给 IntersectionObserver 懒加载
        var isPlaceholder = thumb.indexOf('data:') === 0;
        var imgAttr = isPlaceholder
            ? 'src="' + esc(thumb) + '"'
            : 'data-lazy="' + esc(thumb) + '" src="' + esc(placeholder(t.name, 8, 6)) + '"';

        // 悬停动图：thumb 保持静图（省流量），thumbAnim 只在鼠标移上去时才加载
        // 动图往往几 MB，12 张一起放会拖垮首屏，所以默认不预载
        if (t.thumbAnim) imgAttr += ' data-anim="' + esc(t.thumbAnim) + '"';

        return '' +
            '<article class="' + cls + '" data-id="' + esc(t.id) + '"' +
                    ' data-cat="' + esc(t.cat || '') + '"' +
                    ' tabindex="0" role="button"' +
                    ' aria-label="' + esc(t.name) + '，' +
                        ((t.platforms || []).join('、') || '未标注平台') + '，查看详情"' +
                    ' title="' + esc(t.name) + '">' +
                '<div class="c-thumb" style="aspect-ratio:' + esc(ratio) + '">' +
                    '<img ' + imgAttr + ' alt="' + esc(t.name) + '" loading="lazy" decoding="async">' +
                '</div>' +
                '<div class="body">' +
                    /* 顶部行：标题（左） + 日期（右上），上沿与图片上沿齐平 */
                    '<div class="card-head">' +
                        '<h3 title="' + esc(t.name) + '">' + esc(t.name) +
                            (t.version ? '<span class="ver">' + esc(t.version) + '</span>' : '') +
                        '</h3>' +
                        (t.date ? '<span class="card-date" title="更新于 ' +
                                    esc(t.date) + '">' +
                                    esc(String(t.date).slice(5)) + '</span>' : '') +
                    '</div>' +
                    /* 简介：窄屏由 CSS 自动隐藏，宽屏显示 */
                    '<p class="desc" title="' + esc(t.desc || '') + '">' +
                        esc(t.desc) + '</p>' +
                    /* 底部：标签 + 平台图标，绝对定位固定 */
                    '<div class="card-foot">' +
                        (tags ? '<div class="tags">' + tags + '</div>' : '') +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    // 首屏骨架屏：数据渲染前先占位，避免白屏
    function renderSkeleton(n) {
        var one = '' +
            '<div class="skeleton-card">' +
                '<div class="sk-thumb"></div>' +
                '<div class="sk-body">' +
                    '<div class="sk-line title w60"></div>' +
                    '<div class="sk-line w80"></div>' +
                    '<div class="sk-line w40"></div>' +
                '</div>' +
            '</div>';
        grid.innerHTML = new Array(Math.max(0, n || 0)).fill(one).join('');
    }

    function renderCards() {
        var list = filtered();
        var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        if (curPage > totalPages) curPage = totalPages;

        var start = (curPage - 1) * PAGE_SIZE;
        var pageList = list.slice(start, start + PAGE_SIZE);

        if (!pageList.length) {
            grid.innerHTML = '<div class="empty">没有找到相关资源，换个关键词试试</div>';
        } else {
            grid.innerHTML = pageList.map(cardHtml).join('');
            grid.querySelectorAll('.card').forEach(function (c) {
                c.addEventListener('click', function () {
                    openToolModal(c.getAttribute('data-id'));
                });
                bindThumbAnim(c);
                // 键盘：Enter / 空格 打开（和鼠标点击等价）
                c.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        openToolModal(c.getAttribute('data-id'));
                    }
                });
            });

            initLazyImages();

            // 图片加载失败兜底（事件不冒泡，用捕获）
            grid.querySelectorAll('.c-thumb img').forEach(function (im) {
                im.addEventListener('error', function () { onImgError(im); });
            });
        }
        renderPager(totalPages, list.length);
    }

    // ---------- 分页 ----------
    function renderPager(totalPages, totalCount) {
        if (totalPages <= 1) {
            pagerBox.innerHTML = totalCount
                ? '<span class="pager-info">共 ' + totalCount + ' 个资源</span>'
                : '';
            return;
        }

        var html = '<button class="pg" data-p="' + (curPage - 1) + '"' +
                   (curPage === 1 ? ' disabled' : '') + '>上一页</button>';

        // 页码：最多显示 7 个，中间用省略号
        var pages = [];
        if (totalPages <= 7) {
            for (var i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (curPage <= 4) {
                pages = [1, 2, 3, 4, 5, '...', totalPages];
            } else if (curPage >= totalPages - 3) {
                pages = [1, '...', totalPages - 4, totalPages - 3,
                         totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', curPage - 1, curPage, curPage + 1, '...', totalPages];
            }
        }

        pages.forEach(function (p) {
            if (p === '...') {
                html += '<span class="pg-dots">…</span>';
            } else {
                html += '<button class="pg' + (p === curPage ? ' on' : '') +
                        '" data-p="' + p + '">' + p + '</button>';
            }
        });

        html += '<button class="pg" data-p="' + (curPage + 1) + '"' +
                (curPage === totalPages ? ' disabled' : '') + '>下一页</button>';
        html += '<span class="pager-info">共 ' + totalCount + ' 个 / ' +
                totalPages + ' 页</span>';
        html += '<span class="pager-jump">跳到 <input id="jump" type="number" min="1" max="' +
                totalPages + '"> 页 <button class="pg" id="go">GO</button></span>';

        pagerBox.innerHTML = html;

        pagerBox.querySelectorAll('.pg[data-p]').forEach(function (b) {
            b.addEventListener('click', function () {
                var p = parseInt(b.getAttribute('data-p'), 10);
                if (isNaN(p) || p < 1) return;
                curPage = p;
                renderCards();
                scrollTop();
            });
        });

        var goBtn = document.getElementById('go');
        var jump  = document.getElementById('jump');
        if (goBtn) {
            goBtn.addEventListener('click', function () {
                var p = parseInt(jump.value, 10);
                if (!isNaN(p) && p >= 1) { curPage = p; renderCards(); scrollTop(); }
            });
            jump.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') goBtn.click();
            });
        }
    }

    function scrollTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---------- 资源弹窗 ----------
    function openToolModal(id) {
        var t = null;
        for (var i = 0; i < TOOLS.length; i++) {
            if (String(TOOLS[i].id) === String(id)) { t = TOOLS[i]; break; }
        }
        if (!t) return;

        var host = hostOf(t.link);
        var icon = t.icon || '';   // 手填 icon 优先；留空则由 loadIcon 按多源兜底
        var bigImg = imgOf(t, true);   // 弹窗大图：cover > thumb > 占位
        var plats = (t.platforms || []).map(function (p) {
            return '<i class="plat" title="' + esc(p) + '">' + (PLAT[p] || '?') + '</i>';
        }).join('');

        var rows = '';
        rows += '<div class="row"><span>版本</span><span>' + esc(t.version || '-') + '</span></div>';
        rows += '<div class="row"><span>更新</span><span>' + esc(t.date || '-') + '</span></div>';
        rows += '<div class="row"><span>分类</span><span>' + esc(t.cat || '-') + '</span></div>';
        rows += '<div class="row"><span>平台</span><span class="plats">' + plats + '</span></div>';
        // 网盘：优先读 tools.js 里手填的 pan / panName / panIcon / panColor，
        //       没填就按 link 域名自动判断（夸克 / 百度 / 迅雷 / 123 等）
        rows += panHtml(t);

        // 网盘列表（统一后的），多网盘时要能切换
        var panList = normalizePans(t);
        var curPan  = panList[0] || null;   // 默认第一个

        // 始终渲染（第一个网盘可能没码、第二个有，切换时要能显示出来），靠 display 控制显隐
        var codeHtml =
            '<div class="code-box" id="m-codebox"' +
                (curPan && curPan.code ? '' : ' style="display:none"') + '>' +
                '提取码：<b id="m-code">' + esc((curPan && curPan.code) || '') + '</b>' +
                '<button id="m-copy">复制</button></div>';

        var coverHtml = bigImg
            ? '<img src="' + esc(bigImg) + '" alt="' + esc(t.name) + '">'
            : '<span>宣传图<br>（在 tools.js 里填 cover）</span>';

        // 分享 / 关注按钮（在 tools.js 的 SITE.share 里配置，url 为空的不显示）
        var shareHtml = '';
        var shareList = (typeof SITE !== 'undefined' && SITE.share) || [];
        var valid = shareList.filter(function (x) { return x && x.url; });
        if (valid.length) {
            shareHtml = '<div class="detail-share">' +
                '<span class="share-label">分享到</span>' +
                valid.map(function (x) {
                    return '<a class="share-btn" href="' + esc(x.url) + '" target="_blank" ' +
                           'rel="noopener" title="' + esc(x.name) + '">' +
                           '<i>' + esc(x.icon || '') + '</i>' +
                           '<span>' + esc(x.name) + '</span></a>';
                }).join('') +
                '</div>';
        }

        // 结构：overlay > dialog > dialog-title-block + detail-copy-card
        box.innerHTML = '' +
            '<button class="close" id="m-close">&times;</button>' +
            '<div class="dialog">' +
                '<div class="dialog-title-block">' +
                    '<div class="title-main">' +
                        // 手填 icon 直接用；留空则用占位图打底，随后由 loadIcon 按多源替换
                        '<img class="m-icon" id="m-icon" src="' +
                            esc(icon || placeholder(t.name, 64, 64)) + '" alt="">' +
                        '<div class="title-txt">' +
                            '<h2>' + esc(t.name) + '</h2>' +
                            '<div class="sub">' + esc(t.cat || '') +
                                (t.version ? ' · ' + esc(t.version) : '') +
                                (t.date ? ' · ' + esc(t.date) : '') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="title-cover">' + coverHtml + '</div>' +
                '</div>' +
                '<div class="detail-copy-card">' +
                    '<p class="detail">' + esc(t.detail || t.desc) + '</p>' +
                    '<div class="rows">' + rows + '</div>' +
                    codeHtml +
                    shareHtml +
                    '<div class="tip-text">点击下方按钮，立即领取这份资源</div>' +
                    '<button class="get-btn" id="m-get">' +
                        (panList.length > 1 && curPan
                            ? '前往 ' + esc(curPan.name || curPan.host || '网盘') + ' 领取'
                            : '免费领取资源') +
                    '</button>' +
                '</div>' +
            '</div>';

        showMask();

        // 手填 icon 就别去多源探测了；留空才按顺序试本地 → 国内 → 境外
        if (!icon && host) {
            var mIcon = document.getElementById('m-icon');
            if (mIcon) loadIcon(mIcon, host, t.name);
        }

        var getBtn  = document.getElementById('m-get');
        var codeBox = document.getElementById('m-code');
        var copyBtn = document.getElementById('m-copy');
        var panWrap = document.querySelector('#modal-box .pan-list');

        // 切换网盘：更新选中态、提取码、领取按钮文案与目标链接
        function selectPan(i) {
            curPan = panList[i];
            if (!curPan) return;

            if (panWrap) {
                panWrap.querySelectorAll('.pan-badge').forEach(function (b, bi) {
                    var on = (bi === i);
                    b.classList.toggle('on', on);
                    b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
            }

            // 提取码：跟着网盘变（没有就隐藏整行）
            if (codeBox) {
                var box = document.getElementById('m-codebox');
                if (curPan.code) {
                    codeBox.textContent = curPan.code;
                    if (box) box.style.display = '';
                } else if (box) {
                    box.style.display = 'none';
                }
            }

            // 领取按钮：文案带上网盘名
            if (getBtn) {
                getBtn.textContent = panList.length > 1
                    ? '前往 ' + (curPan.name || curPan.host || '网盘') + ' 领取'
                    : '免费领取资源';
            }
        }

        // 多网盘才需要绑定点击
        if (panWrap && panList.length > 1) {
            panWrap.querySelectorAll('.pan-badge').forEach(function (b) {
                b.addEventListener('click', function () {
                    selectPan(parseInt(b.getAttribute('data-idx'), 10));
                });
            });
        }

        if (getBtn) {
            getBtn.addEventListener('click', function () {
                var url = (curPan && curPan.link) || t.link;
                if (url) window.open(url, '_blank', 'noopener');
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var txt = (curPan && curPan.code) || t.code || '';
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(txt).then(function () {
                        copyBtn.textContent = '已复制';
                    });
                } else { copyBtn.textContent = txt; }
                setTimeout(function () { copyBtn.textContent = '复制'; }, 1500);
            });
        }
    }

    // ---------- 底部四张卡片 ----------
    var FOOT_KEYS = ['about', 'feedback', 'notice', 'submit'];

    function renderFootCards() {
        if (typeof SITE === 'undefined') return;
        footCards.innerHTML = FOOT_KEYS.map(function (k) {
            var o = SITE[k];
            if (!o) return '';
            return '' +
                '<div class="fcard" data-k="' + k + '" tabindex="0" role="button"' +
                     ' aria-label="' + esc(o.title || '') + '">' +
                    '<div class="f-ico" aria-hidden="true">' + esc(o.icon || '') + '</div>' +
                    '<div class="f-copy">' +
                        '<p class="f-en">' + esc(o.en || '') + '</p>' +
                        '<div class="f-title">' + esc(o.title || '') + '</div>' +
                        '<div class="f-sub">' + esc(o.sub || '') + '</div>' +
                    '</div>' +
                '</div>';
        }).join('');

        footCards.querySelectorAll('.fcard').forEach(function (c) {
            c.addEventListener('click', function () {
                openInfoModal(c.getAttribute('data-k'));
            });
            c.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    openInfoModal(c.getAttribute('data-k'));
                }
            });
        });
    }

    // ---------- 合规页脚 ----------
    // 内容全部来自 tools.js 的 SITE.footer，改那里即可
    function renderFooter() {
        var el = document.getElementById('site-foot');
        if (!el || typeof SITE === 'undefined') return;

        var f = SITE.footer || {};
        var brand = f.brand || SITE.name || '工具箱';

        // ---- 第一行：站点名 · 说明 ----
        var line1 = '';
        line1 += '<span class="f-brand">' + esc(brand) + '</span>';
        if (f.desc) {
            line1 += '<span class="f-sep" aria-hidden="true">|</span>' +
                     '<span class="f-desc">' + esc(f.desc) + '</span>';
        }

        // ---- 第二行：备案号 + 额外链接 ----
        var items = [];

        // 备案号：有就显示，并链到工信部备案查询
        if (f.icp) {
            items.push('<a class="f-icp" href="' + esc(f.icpLink || 'https://beian.miit.gov.cn') +
                       '" target="_blank" rel="noopener">' + esc(f.icp) + '</a>');
        }
        // 公安备案（可选）
        if (f.ga) {
            items.push('<a class="f-ga" href="' + esc(f.gaLink || 'https://www.beian.gov.cn') +
                       '" target="_blank" rel="noopener">' + esc(f.ga) + '</a>');
        }
        // 自定义链接（如「版权反馈」）
        (f.links || []).forEach(function (l) {
            if (!l || !l.text) return;
            var href = l.url || '#';
            var isMail = href.indexOf('mailto:') === 0;
            items.push('<a class="f-link"' +
                       (isMail ? '' : ' target="_blank" rel="noopener"') +
                       ' href="' + esc(href) + '">' + esc(l.text) + '</a>');
        });

        // ---- 第三行：版权年份（可选）----
        var line3 = '';
        if (f.copyright) {
            line3 = '<div class="f-copyright">' + esc(f.copyright) + '</div>';
        }

        el.innerHTML =
            '<div class="f-line f-line1">' + line1 + '</div>' +
            (items.length ? '<div class="f-line f-line2">' +
                              items.join('<span class="f-dot" aria-hidden="true">·</span>') +
                          '</div>' : '') +
            line3;
    }

    // ---------- 信息弹窗 ----------
    function openInfoModal(key) {
        var o = (typeof SITE !== 'undefined') ? SITE[key] : null;
        if (!o) return;

        // 以 · 开头的行渲染成列表项，连续的列表项自动包进一个 <ul>
        var bodyHtml = '';
        var inList = false;
        (o.body || []).forEach(function (line) {
            var isItem = /^[·•]/.test(line);
            if (isItem) {
                if (!inList) { bodyHtml += '<ul>'; inList = true; }
                bodyHtml += '<li>' + esc(line.replace(/^[·•]\s*/, '')) + '</li>';
            } else {
                if (inList) { bodyHtml += '</ul>'; inList = false; }
                bodyHtml += '<p>' + esc(line) + '</p>';
            }
        });
        if (inList) bodyHtml += '</ul>';

        var showMail = (key === 'feedback' || key === 'submit' || key === 'notice');

        box.innerHTML = '' +
            '<button class="close" id="m-close">&times;</button>' +
            '<div class="info-modal">' +
                '<div class="info-ico">' + esc(o.icon || '') + '</div>' +
                '<div class="info-en">' + esc(o.en || '') + '</div>' +
                '<h2>' + esc(o.title || '') + '</h2>' +
                '<div class="info-sub">' + esc(o.sub || '') + '</div>' +
                '<div class="info-body">' + bodyHtml + '</div>' +
                (o.sign ? '<div class="info-sign">' + esc(o.sign) + '</div>' : '') +
                (showMail && SITE.contact
                    ? '<div class="mail-box">联系邮箱：<b id="m-mail">' + esc(SITE.contact) + '</b>' +
                      '<button id="m-mailcopy">复制</button></div>'
                    : '') +
            '</div>';

        showMask();

        var mb = document.getElementById('m-mailcopy');
        if (mb) {
            mb.addEventListener('click', function () {
                var txt = SITE.contact || '';
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(txt).then(function () {
                        mb.textContent = '已复制';
                    });
                } else { mb.textContent = txt; }
                setTimeout(function () { mb.textContent = '复制'; }, 1500);
            });
        }
    }

    // ---------- 弹窗开关：焦点陷阱 + 滚动锁 ----------
    var lastFocused = null;   // 记住打开弹窗前的焦点，关闭后还回去

    // 可聚焦元素选择器（照参考站的做法）
    var FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), ' +
                    '[tabindex]:not([tabindex="-1"])';

    // 锁滚动：补一个 padding-right，避免滚动条消失导致页面横向跳动
    function lockScroll() {
        var sw = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (sw > 0) document.body.style.paddingRight = sw + 'px';
    }
    function unlockScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    // Tab 键在弹窗内循环，不让焦点跑到背景页面上
    function trapTab(e) {
        if (e.key !== 'Tab') return;
        var list = [].slice.call(box.querySelectorAll(FOCUSABLE))
                     .filter(function (el) { return el.offsetParent !== null; });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        var active = document.activeElement;

        if (e.shiftKey && (active === first || !box.contains(active))) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault(); first.focus();
        }
    }

    function showMask() {
        lastFocused = document.activeElement;
        mask.classList.add('on');
        lockScroll();

        // 无障碍属性
        mask.setAttribute('role', 'dialog');
        mask.setAttribute('aria-modal', 'true');

        var btn = document.getElementById('m-close');
        if (btn) {
            btn.addEventListener('click', closeModal);
            // 打开后把焦点送进弹窗（不触发滚动）
            setTimeout(function () { btn.focus({ preventScroll: true }); }, 30);
        }
        mask.addEventListener('click', function (e) {
            if (e.target === mask) closeModal();
        });
    }

    function closeModal() {
        mask.classList.remove('on');
        mask.removeAttribute('role');
        mask.removeAttribute('aria-modal');
        unlockScroll();
        // 焦点还给原来的元素（比如刚才点的那张卡片）
        if (lastFocused && lastFocused.focus) {
            try { lastFocused.focus({ preventScroll: true }); } catch (e) {}
        }
        lastFocused = null;
    }

    // ---------- 事件 ----------
    searchInp.addEventListener('input', function () {
        curKey = this.value.trim();
        curPage = 1;
        renderCards();
    });

    document.addEventListener('keydown', function (e) {
        if (!mask.classList.contains('on')) return;
        if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
        trapTab(e);
    });

    // ---------- 站点名 ----------
    // 顶部横幅已去掉，站点名显示在导航栏 logo 旁 + 浏览器标签
    function renderBrand() {
        if (typeof SITE === 'undefined') return;
        var n = SITE.name || '工具箱';
        var b = document.getElementById('brand-name');
        if (b) b.textContent = n;
        // 副标语：如果页面上有 #site-slogan 就填，没有就跳过（现在默认没有）
        var s = document.getElementById('site-slogan');
        if (s && SITE.slogan) s.textContent = SITE.slogan;
        // 浏览器标签：站点名 + 后缀（后缀可在 SITE.titleSuffix 改，不填用默认）
        var suffix = SITE.titleSuffix || 'AI工具、效率软件与素材资源库';
        document.title = n + ' - ' + suffix;
    }

    // ---------- 白天 / 黑夜切换 ----------
    function initTheme() {
        var root = document.documentElement;
        var btn  = document.getElementById('theme-btn');
        var current = 'dark';

        function paint(t) {
            root.setAttribute('data-theme', t);
            current = t;
            if (btn) {
                btn.textContent = (t === 'light') ? '☀️' : '🌙';
                var tip = (t === 'light') ? '切换到夜间模式' : '切换到日间模式';
                btn.setAttribute('title', tip);
                btn.setAttribute('aria-label', tip);
            }
            try { localStorage.setItem('toolbox-theme', t); } catch (e) {}
        }

        // 平滑切换：切换瞬间挂上 .theme-switching，让颜色走 CSS 过渡，
        // 过渡结束立刻摘掉，避免影响 hover / 弹窗等其它动画。
        // （不用 View Transitions —— 它要截整页快照，移动端容易白闪、掉帧）
        var switchTimer = null;
        function apply(t) {
            var reduce = window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reduce) { paint(t); return; }

            root.classList.add('theme-switching');
            paint(t);

            if (switchTimer) clearTimeout(switchTimer);
            switchTimer = setTimeout(function () {
                root.classList.remove('theme-switching');
                switchTimer = null;
            }, 320);
        }

        var saved = null;
        try { saved = localStorage.getItem('toolbox-theme'); } catch (e) {}

        // 没手动选过就跟随系统；系统也没表态就默认深色
        var sysLight = window.matchMedia &&
                       window.matchMedia('(prefers-color-scheme: light)').matches;
        paint(saved || (sysLight ? 'light' : 'dark'));

        if (btn) {
            btn.addEventListener('click', function () {
                apply(current === 'light' ? 'dark' : 'light', btn);
            });
        }

        // 用户没手动选过时，跟随系统实时变化
        if (!saved && window.matchMedia) {
            var mq = window.matchMedia('(prefers-color-scheme: light)');
            var onChange = function (e) { paint(e.matches ? 'light' : 'dark'); };
            if (mq.addEventListener) mq.addEventListener('change', onChange);
            else if (mq.addListener) mq.addListener(onChange);
        }
    }

    // ---------- 吸顶导航：滚动后加阴影 ----------
    // 顺便把 header 实际高度写进 --header-h，供左侧栏 sticky 定位使用
    // （header 高度会随分类换行变化，写死数值会错位）
    function initSticky() {
        var header = document.getElementById('header');
        if (!header) return;

        function syncHeaderH() {
            var h = header.offsetHeight || 62;
            document.documentElement.style.setProperty('--header-h', h + 'px');
        }

        function onScroll() {
            header.classList.toggle('scrolled', window.scrollY > 10);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', syncHeaderH);
        if (window.ResizeObserver) {
            try { new ResizeObserver(syncHeaderH).observe(header); } catch (e) {}
        }
        syncHeaderH();
        onScroll();
    }

    // ---------- 启动 ----------
    function renderAll() { renderCards(); }

    initTheme();
    initSticky();
    initSideCollapse();
    initSidebar();
    renderBrand();
    // 先画骨架屏占位，随后立刻换成真实内容
    renderSkeleton(PAGE_SIZE > 12 ? 12 : PAGE_SIZE);
    renderSlider();
    renderNews();
    renderTabs();
    renderSubBar();
    renderFootCards();
    renderFooter();
    renderAll();
})();
