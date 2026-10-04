/* ============================================================
   小雷工具箱 · 提取码门禁（前端模块）—— 方案 B 版
   网关：https://zsff.cbflf.cn（你自己的服务器，国内秒开）
   ------------------------------------------------------------
   用法：
     1. 把本文件放到工具箱目录（和 app.js 同级）
     2. 在 index.html 里、app.js 之前引入：
        <script src="lockgate.js"></script>
     3. 给需要引导扫码的资源在 tools.js 里加： lock: true
   ============================================================ */
(function () {
    'use strict';

    var GATE = {
        /* ★ 网关地址：你自己服务器上的签发校验接口
             前面 checkcode=1 是标记，key 是密钥（两边必须一致） */
        api: 'https://zsff.cbflf.cn/App/zm/xqlist?checkcode=1&key=XLLFX2026CODEKEY',

        /* ★ 小程序码图片地址（用户扫它拿提取码） */
        qrcode: 'https://cdn.jsdelivr.net/gh/xllfx/images@main/qrcode.png',

        /* 文案（随便改） */
        title: '需要提取码',
        desc: '请用手机微信扫描下方二维码，获取提取码',

        /* 是否强制所有资源都走校验（false = 只有 lock:true 的才校验） */
        force: false,

        /* 校验通过后，本次会话内不再重复询问 */
        remember: true,

        /* 超时毫秒数：超过就放行，绝不让用户卡住 */
        timeout: 6000,
    };

    var passed = false;   // 会话内已通过标记

    /* ---------- 注入样式（不改 style.css） ---------- */
    function injectCss() {
        if (document.getElementById('xllfx-gate-css')) return;
        var css =
            '.xllfx-mask{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);' +
            'display:flex;align-items:center;justify-content:center;padding:20px;' +
            'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}' +
            '.xllfx-box{background:#fff;border-radius:16px;width:100%;max-width:340px;' +
            'padding:24px 22px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.25)}' +
            '.xllfx-box h3{margin:0 0 8px;font-size:17px;color:#111;font-weight:600}' +
            '.xllfx-box p{margin:0 0 16px;font-size:13px;color:#666;line-height:1.6}' +
            '.xllfx-qr{width:150px;height:150px;margin:0 auto 14px;display:block;border-radius:10px}' +
            '.xllfx-in{width:100%;height:44px;border:1px solid #dcdcdc;border-radius:10px;' +
            'font-size:20px;text-align:center;letter-spacing:2px;outline:none;box-sizing:border-box;' +
            'margin-bottom:12px;color:#111}' +
            '.xllfx-in:focus{border-color:#4a6cf7}' +
            '.xllfx-btn{width:100%;height:44px;border:none;border-radius:10px;' +
            'background:linear-gradient(135deg,#667eea,#4a6cf7);color:#fff;font-size:15px;' +
            'cursor:pointer;font-weight:500}' +
            '.xllfx-btn:disabled{opacity:.6;cursor:not-allowed}' +
            '.xllfx-msg{margin-top:10px;font-size:12px;color:#e5484d;min-height:16px}' +
            '.xllfx-close{margin-top:14px;font-size:13px;color:#999;cursor:pointer;background:none;border:none}';
        var s = document.createElement('style');
        s.id = 'xllfx-gate-css';
        s.textContent = css;
        document.head.appendChild(s);
    }

    /* ---------- 弹窗 ---------- */
    function showDialog(onPass) {
        injectCss();

        var mask = document.createElement('div');
        mask.className = 'xllfx-mask';
        mask.innerHTML =
            '<div class="xllfx-box">' +
                '<h3>' + GATE.title + '</h3>' +
                '<p>' + GATE.desc + '</p>' +
                '<img class="xllfx-qr" src="' + GATE.qrcode + '" alt="小程序码">' +
                '<input class="xllfx-in" type="text" autocomplete="off" ' +
                       'maxlength="16" placeholder="">' +
                '<button class="xllfx-btn">验证并获取</button>' +
                '<div class="xllfx-msg"></div>' +
                '<button class="xllfx-close">关闭</button>' +
            '</div>';

        document.body.appendChild(mask);

        var input = mask.querySelector('.xllfx-in');
        var btn   = mask.querySelector('.xllfx-btn');
        var msg   = mask.querySelector('.xllfx-msg');

        function close() { mask.remove(); }
        mask.querySelector('.xllfx-close').onclick = close;
        mask.addEventListener('click', function (e) {
            if (e.target === mask) close();
        });

        /* 兜底放行：接口挂了 / 超时 / 报错，都不能让用户下不了 */
        function fallback(code) {
            passed = true;
            close();
            onPass && onPass(code);
        }

        function submit() {
            var code = (input.value || '').trim();
            if (!code) { msg.textContent = '请先输入提取码'; return; }

            btn.disabled = true;
            btn.textContent = '验证中...';
            msg.textContent = '';

            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                fallback(code);          /* 超时 → 放行 */
            }, GATE.timeout);

            var ctrl = null;
            var opt = { method: 'GET', cache: 'no-store', mode: 'cors' };
            if (typeof AbortController !== 'undefined') {
                ctrl = new AbortController();
                opt.signal = ctrl.signal;
            }

            fetch(GATE.api + '&code=' + encodeURIComponent(code) + '&_=' + Date.now(), opt)
                .then(function (r) { return r.json(); })
                .then(function (j) {
                    if (done) return;
                    done = true;
                    clearTimeout(timer);
                    if (j && j.ok) {
                        passed = true;
                        close();
                        onPass && onPass(code);
                    } else {
                        btn.disabled = false;
                        btn.textContent = '验证并获取';
                        msg.textContent = '提取码不正确，请重新扫码获取';
                        input.value = '';
                        input.focus();
                    }
                })
                .catch(function () {
                    if (done) return;
                    done = true;
                    clearTimeout(timer);
                    fallback(code);      /* 网络失败 → 放行 */
                });
        }

        btn.onclick = submit;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submit();
        });

        setTimeout(function () { input.focus(); }, 100);
    }

    /* ---------- 对外接口 ---------- */
    window.XLGate = {
        /* 需要校验吗（供 app.js 判断） */
        need: function (locked) {
            if (GATE.force) return true;
            return !!locked;
        },
        /* 已通过就跳过 */
        passed: function () {
            return GATE.remember && passed;
        },
        /* 主入口：verify(fn) —— 通过后回调 fn(code) */
        verify: function (onPass) {
            showDialog(onPass);
        },
        cfg: GATE,
    };
})();
