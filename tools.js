/* ============================================================
   工具数据：以后只改这个文件，不用动 index.html
   ------------------------------------------------------------
   字段说明：
   id        唯一编号（随便填，不重复就行）
   name      工具名称
   version   版本号，如 v1.2.0
   date      发布时间，格式 2026-09-16
   cat       分类，要和下面的 CATEGORIES 对得上
   desc      一句话简介
   detail    弹窗里的详细说明（可选，不填就用 desc）
   platforms 适用平台，从 'windows','macos','linux','android','ios','web' 里选
   pinned    设为 true 可置顶并高亮左侧色条（可选）
   tags      卡片上的标签数组，如 ['Cap','开源录屏']（可选，不填不显示）
   thumb     卡片缩略图，建议 320×240（留空自动生成占位图）
   thumbAnim 悬停时才播放的动图（gif / webp），建议 ≤ 500KB
             鼠标移上去才下载，首屏不加载，移开还原静图（可选）
   cover     弹窗里的大图，建议 800×600（留空就用 thumb 放大）
   icon      列表小图标（一般不用管，留空）
   link      网盘地址（点“领取”后跳转）
   code      提取码（没有就留空）

   ---- 网盘（弹窗里会多一行「网盘」徽章）----
   pan       网盘代号，不填会按 link 域名自动识别。
             可用代号：quark(夸克) baidu(百度) xunlei(迅雷) 123(123云盘)
                       aliyun(阿里云盘) uc(UC) tianyi(天翼) lanzou(蓝奏)
                       weiyun(微云) caiyun(移动云) onedrive google
                       magnet(磁力) ed2k(电驴) direct(直链)
   panName   自定义网盘名称（填了就覆盖上面的预设，如 '我的网盘'）
   panIcon   自定义图标 —— 可以填 emoji（'🚀'），也可以填图片路径
             （'ico/quark.png'），填路径会自动渲染成小图
   panColor  自定义徽章颜色（如 '#4a6cf7'）

   【多网盘】一个资源同时放了好几个网盘时用 pans 数组：
   pans: [
       { pan: 'quark', link: 'https://pan.quark.cn/s/xxx', code: 'abcd' },
       { pan: 'baidu', link: 'https://pan.baidu.com/s/yyy', code: '8888' }
   ]
   → 弹窗里显示两个网盘按钮，用户点哪个就用哪个链接和提取码；
     不点默认用第一个。pan/link/code 等字段在数组每项里同样可用。
   ------------------------------------------
   ============================================================ */

var CATEGORIES = ['全部', 'AI前沿', '工具软件', '创业项目', '素材资源'];

var TOOLS = [
    {
        id: 1,
        pinned: true,                       // ← 置顶示范：左侧有青色高亮条
        name: 'Cap 开源录屏',
        version: 'v0.6.0',
        date: '2026-09-16',
        cat: '工具软件',
        subCat: '录屏截图',
        tags: ['Cap', '全平台', '工具软件'],
        desc: '开源录屏与轻量编辑工具，支持屏幕、窗口、摄像头与系统音频录制',
        detail: '完全开源的屏幕录制方案，录制后可直接生成分享链接，支持屏幕 / 窗口 / 摄像头与系统音频同时采集，内置简单的剪辑与标注。',
        platforms: ['windows', 'macos', 'linux'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        // ★ 悬停动图示例：鼠标移到这张卡片上才加载动图（首屏不受影响）
        //   自己用时把路径换成你的 gif / webp 动图即可
        thumbAnim: 'images/demo-anim.gif',
        // ★ 多网盘示例：同一个资源夸克和百度都有，用户可以点选
        //   不点就用第一个（这里默认夸克）
        pans: [
            { pan: 'quark', link: 'https://pan.quark.cn/s/示例链接1', code: 'abcd' },
            { pan: 'baidu', link: 'https://pan.baidu.com/s/示例链接2', code: '8888' }
        ],
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接1',
        code: 'abcd'
    },
    {
        id: 2,
        pinned: true,                       // ← 置顶示范
        name: '洛雪音乐',
        version: 'v2.12.4',
        date: '2026-09-13',
        cat: '工具软件',
        tags: ['全平台', '工具软件'],
        desc: '安卓官方版丨工具箱 iOS v1.8.2 适配版丨附音源与图文教程',
        detail: '聚合多平台音源的免费音乐播放器，支持 Windows / macOS / Linux / 安卓，本次提供安卓官方版与 iOS 适配版，附带可用音源与图文配置教程。',
        platforms: ['windows', 'macos', 'linux', 'android', 'ios'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接2',
        code: ''
    },
    {
        id: 3,
        name: 'PixPin 截图',
        version: 'v2.1.0',
        date: '2026-09-11',
        cat: '工具软件',
        subCat: '录屏截图',
        tags: ['PixPin', '桌面端', '工具软件'],
        desc: '截图 + 贴图 + OCR 文字识别，长截图与滚动截图一键完成',
        detail: '轻量截图工具，支持区域截图、长截图、滚动截图，截完可直接贴图悬浮在桌面上，内置 OCR 文字识别与简单标注。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接3',
        code: '6666'
    },
    {
        id: 4,
        name: '极限投屏',
        version: 'v5.2.1.0',
        date: '2026-09-11',
        cat: '工具软件',
        tags: ['全平台', '工具软件'],
        desc: 'Windows / macOS / Linux 安卓投屏丨USB / WiFi 连接丨分组与批量控制',
        detail: '免费支持 10 台设备同时连接，可通过 USB 或 WiFi 将安卓设备投屏到电脑，支持分组管理与批量控制，适合多设备调试与演示。',
        platforms: ['windows', 'macos', 'linux', 'android'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接4',
        code: ''
    },
    {
        id: 5,
        name: '豆包输入法',
        version: 'v2026.09.09',
        date: '2026-09-10',
        cat: 'AI前沿',
        tags: ['桌面端', 'AI前沿'],
        desc: '语音识别与智能文字整理丨Windows / macOS 官方安装包',
        detail: 'AI 输入法，语音识别准确率高，支持语音输入后自动整理成通顺文本，去掉口头禅并自动分段加标点。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接5',
        code: ''
    },
    {
        id: 6,
        name: 'ComfyUI 整合包',
        version: '本地部署版',
        date: '2026-09-08',
        cat: 'AI前沿',
        subCat: 'AI绘图',
        tags: ['ComfyUI', '桌面端', 'AI前沿'],
        desc: 'AI 绘图工作流本地部署丨喂饭级教程 + 懒人整合包，解压即用',
        detail: '节点式 AI 绘图工具，整合包已预置常用模型与工作流，双击启动脚本即可在浏览器打开使用，附完整图文部署教程。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接6',
        code: '8888'
    },
    {
        id: 7,
        name: '自媒体一键分发',
        version: '开源免费',
        date: '2026-05-17',
        cat: '创业项目',
        tags: ['桌面端', '创业项目'],
        desc: '抖音 / 快手 / 视频号 / 小红书 / B站 多平台作品自动发布',
        detail: '本地运行的多平台分发工作台，支持账号管理、素材队列、平台封面、话题填充与定时发布，发布过程不占用键盘鼠标，完全开源免费。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 8,
        name: '剪辑音效素材库',
        version: '70000+',
        date: '2026-08-20',
        cat: '素材资源',
        subCat: '音效素材',
        tags: ['在线工具', '素材资源'],
        desc: '7 万个剪辑音效 + 背景音乐合集，无版权可直接商用',
        detail: '包含转场音效、环境音、UI 提示音、背景音乐等分类，均为无版权素材，短视频剪辑可直接取用。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接8',
        code: 'vip'
    }
    ,
    {
        id: 9,
        name: 'OBS Studio',
        version: 'v30.2',
        date: '2026-08-18',
        cat: '工具软件',
        subCat: '录屏截图',
        tags: ['OBS', '全平台', '工具软件'],
        desc: '开源免费录屏与直播推流工具，插件生态丰富',
        detail: '老牌开源录屏直播软件，支持多场景切换、自定义推流地址与丰富插件，适合长时间录制与多平台直播。',
        platforms: ['windows', 'macos', 'linux'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接9',
        code: ''
    },
    {
        id: 10,
        name: 'Bandicam 录屏',
        version: 'v7.0',
        date: '2026-08-15',
        cat: '工具软件',
        subCat: '录屏截图',
        tags: ['Bandicam', '桌面端', '工具软件'],
        desc: '轻量高清录屏，支持游戏模式与硬件加速',
        detail: '占用资源低的高清录屏工具，支持矩形区域、全屏与游戏录制模式，输出体积小画质好。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接10',
        code: '8888'
    },
    {
        id: 11,
        name: 'Snipaste 截图',
        version: 'v2.8',
        date: '2026-08-12',
        cat: '工具软件',
        subCat: '录屏截图',
        tags: ['Snipaste', '桌面端', '工具软件'],
        desc: '截图 + 贴图神器，可以把截图钉在桌面上',
        detail: '极简截图工具，截完按 F3 即可把图片悬浮贴在屏幕任意位置，支持取色、标注与多屏。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接11',
        code: ''
    },
    {
        id: 12,
        name: 'Everything 搜索',
        version: 'v1.4.1',
        date: '2026-08-10',
        cat: '工具软件',
        subCat: '系统工具',
        tags: ['Everything', '桌面端', '工具软件'],
        desc: '秒级全盘文件搜索，输入即出结果',
        detail: '基于 NTFS 索引的本地文件搜索工具，几百万文件的硬盘也能瞬间定位，支持正则与高级语法。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接12',
        code: ''
    },
    {
        id: 13,
        name: 'ChatBox 客户端',
        version: 'v1.9',
        date: '2026-08-08',
        cat: 'AI前沿',
        subCat: '大模型客户端',
        tags: ['ChatBox', '全平台', 'AI前沿'],
        desc: '多模型 AI 对话客户端，支持本地与云端模型',
        detail: '统一的 AI 对话界面，可接入多种云端与本地模型，支持对话分组、提示词管理与导出。',
        platforms: ['windows', 'macos', 'linux', 'web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 14,
        name: 'Ollama 本地模型',
        version: '最新版',
        date: '2026-08-05',
        cat: 'AI前沿',
        subCat: '大模型客户端',
        tags: ['Ollama', '全平台', 'AI前沿'],
        desc: '一行命令在本地跑大模型，含图文教程',
        detail: '本地大模型运行框架，一条命令即可拉取并运行开源模型，附带常见问题排查与显卡适配说明。',
        platforms: ['windows', 'macos', 'linux'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接14',
        code: ''
    },
    {
        id: 15,
        name: 'Whisper 语音转写',
        version: '整合包',
        date: '2026-08-02',
        cat: 'AI前沿',
        subCat: '语音克隆',
        tags: ['Whisper', '桌面端', 'AI前沿'],
        desc: '本地离线语音转文字，支持中英日多语言',
        detail: '离线语音识别整合包，不联网也能把录音转成文字，支持批量处理与字幕导出。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接15',
        code: 'ai66'
    },
    {
        id: 16,
        name: '短视频封面模板',
        version: '120 套',
        date: '2026-07-28',
        cat: '素材资源',
        subCat: '视频模板',
        tags: ['在线工具', '素材资源'],
        desc: '横屏竖屏通用封面模板，可一键改字换图',
        detail: '涵盖知识口播、好物分享、情感语录等风格的封面模板，分层文件可直接替换文字与配图。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接16',
        code: ''
    },
    {
        id: 17,
        name: '无版权视频素材',
        version: '7 个站点',
        date: '2026-07-25',
        cat: '素材资源',
        tags: ['在线工具', '素材资源'],
        desc: '7 个无需科学上网的无版权视频素材库合集',
        detail: '整理了可直接下载、可商用的视频素材站点清单，附各站授权说明与检索技巧。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接17',
        code: ''
    },
    {
        id: 18,
        name: '免费商用字体包',
        version: '300+',
        date: '2026-07-22',
        cat: '素材资源',
        tags: ['在线工具', '素材资源'],
        desc: '可商用中英文字体合集，附授权说明',
        detail: '按风格分类的免费商用字体包，每款都标注了授权范围，避免字体侵权风险。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接18',
        code: 'font'
    },
    {
        id: 19,
        name: '自媒体矩阵工具',
        version: '开源',
        date: '2026-07-18',
        cat: '创业项目',
        tags: ['桌面端', '创业项目'],
        desc: '多平台账号管理与内容排期，本地运行',
        detail: '把分散在各平台的账号、素材与发布计划集中到一个本地工作台，数据全部留在自己电脑上。',
        platforms: ['windows', 'macos'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 20,
        name: '网盘资源检索',
        version: '网页版',
        date: '2026-07-15',
        cat: '创业项目',
        tags: ['在线工具', '创业项目'],
        desc: '聚合多个网盘检索入口，找资源少走弯路',
        detail: '整理了常用的网盘资源检索站点与搜索语法，附带失效链接的替代方案。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接20',
        code: ''
    },
    {
        id: 21,
        name: '剪映模板合集',
        version: '125 套',
        date: '2026-07-10',
        cat: '素材资源',
        tags: ['全平台', '素材资源'],
        desc: '快闪 / 婚礼 / 企业年会等模板，含预览与源文件',
        detail: '覆盖横屏竖屏的剪映模板合集，含预览视频与可编辑源文件，导入即可替换素材。',
        platforms: ['windows', 'macos', 'android', 'ios'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接21',
        code: 'jian'
    },
    {
        id: 22,
        name: '二维码生成器',
        version: '离线版',
        date: '2026-07-05',
        cat: '工具软件',
        tags: ['桌面端', '工具软件'],
        desc: '离线二维码生成，支持批量与自定义样式',
        detail: '不联网也能生成二维码，支持批量导入文本、调整颜色与嵌入 Logo，适合批量出码场景。',
        platforms: ['windows', 'web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接22',
        code: ''
    },
    {
        id: 23,
        name: '图床上传工具',
        version: 'v2.3',
        date: '2026-07-01',
        cat: '工具软件',
        tags: ['全平台', '工具软件'],
        desc: '一键上传图片生成外链，支持多家图床',
        detail: '拖拽即可上传图片并自动生成 Markdown 外链，支持配置多个图床与历史记录管理。',
        platforms: ['windows', 'macos', 'web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 24,
        name: 'AI 提示词合集',
        version: '12000+',
        date: '2026-06-25',
        cat: 'AI前沿',
        tags: ['AI', '在线工具', 'AI前沿'],
        desc: '按场景分类的提示词库，含绘画与写作',
        detail: '收录绘画、写作、办公等场景的提示词模板，附调用示例与调整思路，可离线查阅。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接24',
        code: 'tip'
    }
    ,
    {
        id: 25,
        name: 'LocalSend 传文件',
        version: 'v1.15',
        date: '2026-06-20',
        cat: '工具软件',
        tags: ['LocalSend', '全平台', '工具软件'],
        desc: '局域网互传文件，无需数据线不经过服务器',
        detail: '开源跨平台局域网传输工具，同一 WiFi 下即可互传文件，不走服务器速度快，支持多设备批量发送。',
        platforms: ['windows', 'macos', 'linux', 'android', 'ios'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 26,
        name: 'PotPlayer 播放器',
        version: '绿色版',
        date: '2026-06-15',
        cat: '工具软件',
        tags: ['PotPlayer', '桌面端', '工具软件'],
        desc: '万能本地视频播放器，解码能力强无广告',
        detail: '免安装绿色版，支持几乎所有视频格式与字幕，内置多种滤镜与倍速播放，无广告弹窗。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接26',
        code: 'play'
    },
    {
        id: 27,
        name: 'Quicker 效率工具',
        version: 'v1.5',
        date: '2026-06-10',
        cat: '工具软件',
        tags: ['Quicker', '桌面端', '工具软件'],
        desc: '鼠标中键唤出快捷面板，常用动作一步到位',
        detail: 'Windows 效率神器，可自定义动作面板，把重复操作做成一键按钮，支持文本处理、截图、打开常用目录等。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接27',
        code: ''
    },
    {
        id: 28,
        name: 'uTools 插件工具箱',
        version: 'v5.0',
        date: '2026-06-05',
        cat: '工具软件',
        tags: ['uTools', '全平台', '工具软件'],
        desc: '快捷键唤起，插件化的效率工具集合',
        detail: '通过 Alt+空格 唤起搜索框，插件市场提供翻译、剪贴板、聚合搜索等能力，按需安装不臃肿。',
        platforms: ['windows', 'macos', 'linux'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接28',
        code: ''
    },
    {
        id: 29,
        name: '沉浸式翻译',
        version: '插件版',
        date: '2026-05-30',
        cat: 'AI前沿',
        tags: ['在线工具', 'AI前沿'],
        desc: '双语对照网页翻译，看外文资料不再卡壳',
        detail: '浏览器插件，中英对照显示原文与译文，支持 PDF、字幕与输入框翻译，可切换多种翻译引擎。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://github.com/',
        code: ''
    },
    {
        id: 30,
        name: 'AI 去除水印',
        version: '离线版',
        date: '2026-05-25',
        cat: 'AI前沿',
        tags: ['AI', '桌面端', 'AI前沿'],
        desc: '本地离线去水印，图片视频均可处理',
        detail: '整合了常见的去水印方案，本地运行不上传文件，支持图片与视频，附参数调整说明。',
        platforms: ['windows'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.baidu.com/s/示例链接30',
        code: 'ws88'
    },
    {
        id: 31,
        name: 'PPT 模板合集',
        version: '2500 套',
        date: '2026-05-20',
        cat: '素材资源',
        tags: ['PPT', '在线工具', '素材资源'],
        desc: '活动策划 / 岗位竞聘 / 商业计划书等模板',
        detail: '按场景分类的演示文稿模板合集，含国风、商务、学术等风格，源文件可直接替换内容。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://pan.quark.cn/s/示例链接31',
        code: 'ppt'
    },
    {
        id: 32,
        name: '抠图去背景合集',
        version: '6 个站点',
        date: '2026-05-15',
        cat: '素材资源',
        tags: ['在线工具', '素材资源'],
        desc: '免费在线抠图站点合集，无需安装软件',
        detail: '整理了可直接上传图片自动去背景的在线工具，标注了免费额度与导出清晰度差异。',
        platforms: ['web'],
        icon: '',
        thumb: '',   // 卡片缩略图 320×240，留空自动生成占位图
        cover: '',
        link: 'https://www.123pan.com/s/示例链接32',
        code: ''
    }

];

/* ============================================================
   站点信息：底部四张卡片的弹窗内容
   ⚠ 下面这些文案是占位示例，请务必改成你自己的话
   ============================================================ */
var SITE = {
    name: '小雷工具箱',                   // ← 站点名（导航栏 logo 旁 + 浏览器标签，两处一起变）
    titleSuffix: 'AI工具、效率软件与素材资源库',  // ← 浏览器标签的后半句，不填就用这句默认
    slogan: '收录 AI 工具 · 效率软件 · 项目资源 · 素材合集，持续更新',  // ← 大标题下的副标题
    contact: '517383843@qq.com',        // ← 改成你的邮箱
    pageSize: 12,                         // 每页显示几个工具（2 列 × 6 行）

    // ===== 二级类目（可选）=====
    // 格式：{ '一级类目名': ['二级1', '二级2', ...] }
    // 一级类目名必须和上面 CATEGORIES 里的完全一致
    // 配了的二级会在侧栏显示成可展开的列表，不配就保持原样（点一级直接筛选）
    //
    // ⚠️ 加在 var SITE = { ... } 这个大括号里面就行，位置随意，
    //    但每一项末尾要带英文逗号，否则 JS 会报错
    subCats: {
        '工具软件': ['录屏截图', '系统工具', '效率办公'],
        'AI前沿':   ['AI绘图', '语音克隆', '大模型客户端'],
        '素材资源': ['音效素材', '视频模板']
        // 想给「创业项目」也加，就补一行：
        // '创业项目': ['项目模板', '商业计划书'],
    },

    newsCount: 3,                          // 「更新动态」横条显示几条

    // ===== 弹窗底部的分享 / 关注按钮 =====
    // ⚠️ url 请填你自己的主页链接，不要填别人的账号地址
    // 留空就不显示这一排按钮
    share: [
        { name: '抖音',   icon: '🎵', url: '' },
        { name: 'B站',    icon: '📺', url: '' },
        { name: '小红书', icon: '📕', url: '' },
        { name: '微信',   icon: '💬', url: '' }
    ],

    // ===== 底部合规页脚 =====
    footer: {
        brand: '小雷工具箱',                        // 站点名（不填就用上面的 name）
        desc:  '本站资源链接均来自网络，仅供学习交流使用',                   // 一句免责说明（留空不显示）
        // ⚠️ 备案号必须换成你自己备案下来的号，不能填别人的
        //    国内服务器上的站点，底部展示备案号是合规要求
        icp:   '辽ICP备xxxxxxxxxx',                                 // 例：'鲁ICP备2024081540号-2'
        icpLink: 'https://beian.miit.gov.cn',       // 工信部备案查询（一般不用改）
        ga:    '辽公网安备xxxxxxxxxxx号',                                 // 公安备案号（可选，没有就留空）
        gaLink: 'https://www.beian.gov.cn',
        // 额外链接，可加多个；url 支持 mailto:
        links: [
            { text: '版权反馈', url: '517383843@qq.com' }
            // { text: '友情链接', url: 'https://example.com' }
        ],
        copyright: '© 2026 小雷工具箱'                              // 例：'© 2026 我的工具箱'
    },

    // ===== 图片设置 =====
    // 卡片缩略图尺寸（CSS 宽高比，实际显示宽度自适应，不用改）
    thumbRatio: '4 / 3',                   // 320×240 = 4:3，想改成 16:9 就写 '16 / 9'
    autoPlaceholder: true,                 // 没填 thumb 时，自动生成带文字的占位图
    about: {
        en: 'ABOUT',
        title: '关于工具箱',
        sub: '站主给大家说句话',
        icon: 'ℹ️',
        body: [
            '建站初衷—分享有用的资源与工具。',
            '分享的工具和资源都是亲自使用过的，保证都是精品的软件与工具。',
            '如果你喜欢我的内容，记得常来溜达。'
        ],
        sign: '—— 小雷工具箱'
    },
    feedback: {
        en: 'FEEDBACK',
        title: '反馈与建议',
        sub: '遇到问题欢迎告诉我',
        icon: '✉️',
        body: [
            '可以反馈这些内容：',
            '· 资源链接失效、提取码错误',
            '· 页面显示异常、体验问题',
            '· 希望收录的新工具或资源',
            '发送时请带上资源名称、截图等信息，处理会更快。'
        ]
    },
    notice: {
        en: 'NOTICE',
        title: '免责声明',
        sub: '资源仅供学习与研究',
        icon: '🛡️',
        body: [
            '本站资源链接均搜集自网络，版权归原作者所有。',
            '· 本站不收取任何费用',
            '· 资源仅限学习研究使用',
            '· 请勿用于商业或非法用途',
            '· 由此产生的后果由使用者自行承担',
            '若内容侵犯了你的权益，请联系删除。'
        ]
    },
    submit: {
        en: 'SUBMIT',
        title: '投稿推荐',
        sub: '有好东西欢迎分享',
        icon: '📤',
        body: [
            '适合投稿的内容：',
            '· 好用的软件或 AI 工具',
            '· 素材资源与实用教程',
            '· 你的原创经验与踩坑总结',
            '投稿时请写清名称、用途和获取方式，方便核实后收录。'
        ]
    }
};

/* ============================================================
   顶部轮播：项目上方的「工具动态」横幅
   ------------------------------------------------------------
   字段：
   title    大标题
   desc     副标题
   tag      左上角小标签（如「最新收录」）
   link     点击跳转（留空则不跳转，只展示）
   bg       背景渐变（CSS 语法，留空用默认）
   emoji    右侧装饰图标（留空不显示）
   ============================================================ */
var BANNERS = [
    {
        tag: '最新收录',
        title: '洛雪音乐 v2.12.4',
        desc: '安卓官方版 + iOS 适配版，附可用音源与图文配置教程',
        link: 'https://pan.quark.cn/s/示例链接2',
        bg: 'linear-gradient(120deg, #1f6feb 0%, #7c5cff 100%)',
        emoji: '🎵'
    },
    {
        tag: '热门工具',
        title: 'Cap 开源录屏 v0.6.0',
        desc: '开源录屏与轻量编辑，支持屏幕、窗口、摄像头与系统音频',
        link: 'https://github.com/',
        bg: 'linear-gradient(120deg, #7c5cff 0%, #d711ff 100%)',
        emoji: '🎬'
    },
    {
        tag: 'AI 前沿',
        title: 'ComfyUI 本地整合包',
        desc: '喂饭级教程 + 懒人整合包，解压即用，无需配置环境',
        link: 'https://www.123pan.com/s/示例链接6',
        bg: 'linear-gradient(120deg, #0d9488 0%, #2f81f7 100%)',
        emoji: '🤖'
    }
];

/* ============================================================
   图片怎么用（重要）
   ------------------------------------------------------------
   两种做法，选一种：

   ① 只填 thumb（最省事）
      卡片显示这张图，弹窗自动把同一张放大显示。
      只需准备一套 320×240 的图。

   ② thumb + cover 都填（效果最好，就是你要的那种）
      thumb = 卡片小图 320×240
      cover = 弹窗大图 800×600
      点开后弹窗显示清晰的大图，卡片用小图加载更快。

   图片放哪：仓库里建个 images/ 目录，然后写
      thumb: 'images/cap.jpg',
      cover: 'images/cap-large.jpg'

   ⚠️ 图片请用自己截图或已授权的素材，不要直接搬运他人网站的宣传图。
   ============================================================ */
