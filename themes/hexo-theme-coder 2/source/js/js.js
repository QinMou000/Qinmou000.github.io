var web_style = $("#web_style").val();
var valine_appid = $("#valine_appid").val();
var valine_appKey = $("#valine_appKey").val();
var valineContainer = document.getElementById('vcomments');

if (valineContainer && typeof Valine !== 'undefined' && valine_appid && valine_appKey) {
    new Valine({
        el: '#vcomments',
        appId: valine_appid,
        appKey: valine_appKey,
        placeholder: '有什么想说的吗？',
        avatar: "wavatar"
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre').forEach((block) => {
        // 跳过已被 Hexo 服务端高亮的代码块，避免客户端重复高亮覆盖服务端结果
        if (block.closest('figure.highlight')) return;
        hljs.highlightBlock(block);
    });
});

function setCookie(key, value) {
    localStorage.setItem(key, value);
}

function getCookie(key) {
    var data = localStorage.getItem(key);
    return data
}

function updateStyle() {
    var themeToggle = document.getElementById('theme-toggle');
    var themeToggleIcon = themeToggle ? themeToggle.querySelector('.theme-toggle-icon') : null;

    if (getCookie("style") == "white") {
        $("#footer").attr("style", "color: #969696;");
        $(".flink").attr("style", "color: #969696;");
        $(".ba").attr("style", "color: #969696;");
        $("#bodyx").attr("class", "bg_while");
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', '切换为深色主题');
        }
        if (themeToggleIcon) {
            themeToggleIcon.textContent = '☀';
        }
    } else {
        $("#footer").attr("style", "");
        $(".flink").attr("style", "");
        $("#bodyx").attr("class", "");
        $(".ba").attr("style", "");
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', '切换为浅色主题');
        }
        if (themeToggleIcon) {
            themeToggleIcon.textContent = '☾';
        }
    }
}

if (getCookie("style") == null) {
    setCookie("style", web_style)
    updateStyle();
} else if (getCookie("style") == "white") {
    setCookie("style", "white")
    updateStyle();
} else if (getCookie("style") == "black") {
    setCookie("style", "black")
    updateStyle();
}

$("#theme-toggle").click(function() {
    setCookie("style", getCookie("style") === "black" ? "white" : "black");
    updateStyle();
});

// 目录生成与交互
function generateToc() {
    var content = document.querySelector('.post-content');
    var tocNav = document.getElementById('post-toc-nav');
    if (!content || !tocNav) return;

    var heroTitle = document.querySelector('.post-hero-title');
    var firstHeading = content.querySelector('h1');
    if (heroTitle && firstHeading && firstHeading.textContent.trim() === heroTitle.textContent.trim()) {
        firstHeading.remove();
    }

    var headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
        document.querySelector('.post-toc').style.display = 'none';
        return;
    }

    var tocHtml = '';
    headings.forEach(function(heading, index) {
        var id = 'toc-' + index;
        heading.id = id;
        var level = heading.tagName.toLowerCase();
        tocHtml += '<a href="#' + id + '" class="toc-' + level + '">' + heading.textContent + '</a>';
    });
    tocNav.innerHTML = tocHtml;

    // 点击目录跳转
    tocNav.addEventListener('click', function(e) {
        var target = e.target;
        if (target.tagName === 'A') {
            e.preventDefault();
            var href = target.getAttribute('href');
            var targetEl = document.querySelector(href);
            if (targetEl) {
                var offset = 60;
                var top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        }
    });

    // 滚动监听高亮
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = entry.target.id;
                tocNav.querySelectorAll('a').forEach(function(a) {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-80px 0px -70% 0px' });

    headings.forEach(function(heading) {
        observer.observe(heading);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    generateToc();
});

// 动态照片模块的输入协议如下。
// 输入仍是普通文章图片，不要求作者手写播放器结构。
// 文件名以 MVIMG_ 开头时视为自动识别候选。
// data-motion-photo 属性可作为显式识别入口。
// 普通图片不得被包装、请求或改变交互语义。
// 已位于链接中的图片保持原跳转行为。
// 候选文件必须保留原始 XMP 元数据。
// 候选文件必须在尾部附加独立视频容器。
// 视频长度必须来自文件内元数据，不能猜测偏移。
// 静态图片始终承担布局尺寸和失败降级。
// 主播放按钮负责画面交互，声音按钮仅在播放后出现。
// 两个按钮必须保持同级，禁止形成无效的按钮嵌套。
// 视频节点不显示原生控制条，统一由自定义按钮控制。
// 状态文本通过实时区域通知辅助技术。
// 文章源文件无需因播放器能力而迁移格式。
// 页面未执行脚本时仍能显示原始图片。
// 模块不得改变文章标题、目录或评论逻辑。
// 动态照片模块的网络协议如下。
// 初始页面加载不得主动请求视频数据。
// 第一次点击只读取足够解析 XMP 的文件头。
// 文件头请求使用单段显式字节范围。
// 显式范围可避免不必要的整文件传输。
// XMP 的 Item:Length 表示尾部视频字节数。
// 旧格式允许用 MicroVideoOffset 作为等价长度。
// 属性顺序不是协议保证，解析不得依赖顺序。
// 命名空间可能采用 Item 或 GContainerItem 前缀。
// 视频类型仅接受 MP4 或 QuickTime 容器。
// 文件头未包含元数据时应直接静态降级。
// 图床忽略首段范围时允许复用完整响应。
// 图床公开 Content-Range 时优先复用总长度。
// 未公开总长度时再发起轻量 HEAD 请求。
// 尾部视频必须使用显式起止范围读取。
// suffix Range 可能触发跨域预检，禁止使用。
// 图床忽略尾段范围时只截取响应末尾数据。
// 读取结果小于声明长度时视为资源损坏。
// 视频容器必须在前部包含 ftyp 标识。
// 视频请求和元数据请求共享取消信号。
// 所有跨域请求都依赖资源服务器开放 CORS。
// 网络错误不得导致文章其他脚本停止执行。
// 动态照片模块的状态协议如下。
// idle 表示静态展示且没有活动请求。
// loading 表示正在取得元数据或视频字节。
// playing 表示视频已经成功开始推进时间。
// error 表示动态层失败但静态层仍被保留。
// 每个实例只能处于四种状态之一。
// 容器类名是样式层唯一的状态来源。
// aria-busy 只在 loading 状态为真。
// 主播放按钮的 aria-pressed 只在 playing 状态为真。
// 声音按钮用独立 aria-pressed 表达是否已经解除静音。
// 按钮名称随播放、暂停、声音和重试状态变化。
// 加载期间再次点击表示用户主动取消。
// 播放期间再次点击表示回到静态画面。
// 视频自然结束后必须复位到静态画面。
// 错误状态允许在原位置重新尝试。
// 过期异步结果不得恢复已取消的播放器。
// 页面后台化时停止活动播放与下载。
// 页面离开时释放所有媒体对象。
// 动态照片模块的并发约束如下。
// 页面内同一时间只允许一个实例播放。
// 新实例启动前必须停止其他活动实例。
// 新实例启动前必须取消其他未完成请求。
// 新实例启动前必须释放其他 Blob 地址。
// 同一实例重播时允许复用已加载视频。
// 不同实例之间不得共享媒体节点。
// loadVersion 用于拒绝已经过期的完成回调。
// AbortController 用于尽早停止网络传输。
// 取消请求不应显示为资源错误。
// 真正的解析或播放异常才进入 error 状态。
// 活动实例引用必须在停止后清空。
// 对象地址必须先从视频移除再撤销。
// 媒体缓冲释放后应调用 load 完成复位。
// currentTime 复位失败不能破坏静态降级。
// 一个实例结束后最多保留一段可重播视频。
// 切换实例后总体视频内存应回到单段规模。
// 动态照片模块的性能约束如下。
// 视频片段大小设置独立硬上限。
// 整体源文件大小设置独立硬上限。
// 元数据中的负数、小数和溢出值均无效。
// 响应流必须在合并为 ArrayBuffer 前逐块执行体积检查。
// 不为未点击的图片创建 Blob 对象。
// 不为未点击的图片设置 video.src。
// 不使用自动播放探测触发隐式下载。
// 不使用轮询持续检查媒体状态。
// 播放状态依赖浏览器原生 Promise 结果。
// 视频固定以内联模式播放，新标签页会话默认静音。
// 用户明确开启声音后，后续播放会按会话偏好尝试恢复。
// 异步下载耗尽用户激活时，浏览器可能要求再次点击声音按钮。
// 每次停止都恢复静音，避免后续播放意外出声。
// 用户的声音选择仅在当前标签页会话内保持。
// 停止媒体只重置实际声音，不得清除会话偏好。
// 有声播放被浏览器拒绝时必须自动回退静音播放。
// 样式只过渡透明度和轻量边界属性。
// 视频节点脱离文档流以避免页面重排。
// 静态图片保留自然比例以避免布局跳动。
// 移动端媒体不得突破正文宽度。
// 后台页面不得继续无意义解码。
// 动态照片模块的安全约束如下。
// 只有明确候选图片能够触发跨域读取。
// 不从 XMP 生成 HTML 或执行脚本。
// XMP 只用于读取数字长度和白名单类型。
// 用户可见描述沿用浏览器安全的文本属性。
// 状态提示只通过 textContent 写入页面。
// Blob 类型必须来自固定视频类型集合。
// 外部错误对象只写入中文前缀的控制台日志。
// 资源状态码只用于诊断，不拼接为 HTML。
// 不访问浏览器凭据、存储或用户文件。
// 仅使用 sessionStorage 保存布尔声音偏好，不记录媒体或用户数据。
// 不向媒体源发送文章内容或用户数据。
// 不接受超出上限的内存分配请求。
// 不把媒体错误升级为全局未捕获异常。
// 不修改原图片地址或替代文本。
// 不向第三方加载额外播放器依赖。
// 所有资源仍受站点现有内容安全策略约束。
// 动态照片模块的可访问性约束如下。
// 鼠标点击和键盘回车使用相同的原生按钮事件。
// 空格键由原生按钮语义自动支持。
// 声音按钮只在播放期间加入焦点顺序。
// 声音按钮隐藏前应把已有焦点交还主播放按钮。
// 按钮始终提供与当前动作一致的名称。
// 加载与错误提示不得仅依赖颜色表达。
// 播放状态同时通过类名和 aria-pressed 表达。
// 视频节点对辅助技术隐藏以避免重复控件。
// 图片替代文本仍由原始 img 节点提供。
// 角标是装饰信息，不进入重复朗读内容。
// 触发器在深浅主题下都必须有清晰焦点。
// 减少动态效果偏好关闭非必要装饰动画。
// 用户主动触发的视频本身仍保留核心功能。
// 错误后按钮保持可用以支持原位重试。
// 状态为空时不占用额外阅读位置。
// 组件不得制造键盘陷阱或强制焦点移动。
// 动态照片模块的降级约束如下。
// 404 时显示中文提示并保留原图片节点。
// CORS 拒绝时显示中文提示并允许重试。
// Range 不支持时允许受限的完整读取。
// HEAD 不支持时允许受限的普通 GET 回退。
// 元数据缺失时不得把普通 JPEG 当作视频。
// 视频签名不符时不得交给解码器尝试执行。
// 浏览器拒绝播放时回到静态图片。
// Blob 创建失败时回到静态图片。
// 图片自身损坏不应隐藏错误占位。
// 一个实例失败不应影响其他实例继续播放。
// 错误信息不得暴露二进制内容或内部对象。
// 取消操作不得留下误导性的错误提示。
// 重试前必须重新取得可信元数据。
// 无 JavaScript 环境自然退化为原 Markdown 图片。
// 不支持 fetch 的旧浏览器仍可阅读静态内容。
// 以上约束共同保证动态能力是渐进增强。

// 动态照片只在用户主动点击后读取视频，避免文章打开时消耗大量流量。
var MOTION_PHOTO_METADATA_BYTES = 128 * 1024;
// 限制单段视频体积，防止异常元数据触发不可控的内存分配。
var MOTION_PHOTO_MAX_VIDEO_BYTES = 64 * 1024 * 1024;
// 整体文件也设置上限，范围请求失效时不允许回退下载异常大的资源。
var MOTION_PHOTO_MAX_SOURCE_BYTES = 128 * 1024 * 1024;
// 声音偏好按标签页会话隔离，关闭标签页后由浏览器自动清除。
var MOTION_PHOTO_SOUND_STORAGE_KEY = 'motionPhotoSoundEnabled';
// 页面内播放器共享活动状态，确保同一时间只播放一张动态照片。
var motionPhotoPlayers = [];
var activeMotionPhotoPlayer = null;
// 存储不可用时仍由页内变量保持当前文档中的用户选择。
var motionPhotoSoundPreferred = readMotionPhotoSoundPreference();

// 只接受本模块写入的 true 字符串，缺失或损坏值统一安全回落静音。
function readMotionPhotoSoundPreference() {
    try {
        return window.sessionStorage.getItem(MOTION_PHOTO_SOUND_STORAGE_KEY) === 'true';
    } catch (error) {
        // 隐私设置可能禁用会话存储，静音默认值不影响动态照片阅读。
        return false;
    }
}

// 只有声音按钮的明确用户操作可以更新偏好，内部安全复位不得调用。
function saveMotionPhotoSoundPreference(enabled) {
    motionPhotoSoundPreferred = Boolean(enabled);

    try {
        window.sessionStorage.setItem(
            MOTION_PHOTO_SOUND_STORAGE_KEY,
            motionPhotoSoundPreferred ? 'true' : 'false'
        );
    } catch (error) {
        // 写入失败时页内变量仍能覆盖当前页面中的其他动态照片。
    }
}

// 文件名是现有文章最稳定的声明方式，同时保留显式属性供后续内容使用。
function isMotionPhotoCandidate(image) {
    var source = image.getAttribute('src') || '';
    var isNamedMotionPhoto = /(?:^|\/)MVIMG_[^?#]+/i.test(source);

    // 链接图片保留原跳转语义，避免在一个交互控件中嵌套另一个控件。
    return !image.closest('a') && (image.hasAttribute('data-motion-photo') || isNamedMotionPhoto);
}

// XMP 是文本元数据，但位于二进制图片中；解码失败的字节可安全替换。
function decodeMotionPhotoMetadata(buffer) {
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8').decode(buffer);
    }

    // 旧浏览器仅需识别 ASCII 范围内的 XMP 字段，无需完整解码图片。
    var bytes = new Uint8Array(buffer);
    var text = '';

    for (var index = 0; index < bytes.length; index++) {
        text += String.fromCharCode(bytes[index]);
    }

    return text;
}

// 从描述视频项目的单个 XML 标签中提取长度与媒体类型。
function parseMotionPhotoVideoTag(tag) {
    var lengthMatch = tag.match(/(?:Item|GContainerItem):Length=["'](\d+)["']/i);
    var mimeMatch = tag.match(/(?:Item|GContainerItem):Mime=["'](video\/(?:mp4|quicktime))["']/i);

    if (!lengthMatch) return null;

    return {
        videoLength: Number(lengthMatch[1]),
        mimeType: mimeMatch ? mimeMatch[1].toLowerCase() : 'video/mp4'
    };
}

// 官方格式使用尾部项目长度定位视频，同时兼容早期 MicroVideoOffset 字段。
function parseMotionPhotoMetadata(buffer) {
    var metadataText = decodeMotionPhotoMetadata(buffer);
    var hasMotionFlag = /(?:GCamera|Camera):(?:MotionPhoto|MicroVideo)=["']1["']/i.test(metadataText);

    if (!hasMotionFlag) {
        throw new Error('文件中没有可用的动态照片标记');
    }

    // 属性顺序并不固定，因此先找到完整标签，再分别解析语义和长度。
    var tags = metadataText.match(/<[^>]+>/g) || [];
    var metadata = null;

    for (var index = 0; index < tags.length; index++) {
        var tag = tags[index];
        var isVideoItem = /(?:Item|GContainerItem):Semantic=["']MotionPhoto["']/i.test(tag)
            || /(?:Item|GContainerItem):Mime=["']video\/(?:mp4|quicktime)["']/i.test(tag);

        if (isVideoItem) {
            metadata = parseMotionPhotoVideoTag(tag);
            if (metadata) break;
        }
    }

    // 旧版安卓动态照片把从文件尾回退的字节数记录为 MicroVideoOffset。
    if (!metadata) {
        var legacyOffset = metadataText.match(/(?:GCamera|Camera):MicroVideoOffset=["'](\d+)["']/i);

        if (legacyOffset) {
            metadata = {
                videoLength: Number(legacyOffset[1]),
                mimeType: 'video/mp4'
            };
        }
    }

    // 长度必须落在可控范围内，后续才能安全地创建内存中的视频对象。
    if (!metadata || !Number.isSafeInteger(metadata.videoLength)
        || metadata.videoLength <= 8
        || metadata.videoLength > MOTION_PHOTO_MAX_VIDEO_BYTES) {
        throw new Error('动态照片中的视频长度无效');
    }

    return metadata;
}

// Range 可能被服务器忽略；统一从响应尾部截取可以覆盖两种返回方式。
function takeVideoTail(buffer, videoLength) {
    if (buffer.byteLength < videoLength) {
        throw new Error('动态照片的视频数据不完整');
    }

    return buffer.slice(buffer.byteLength - videoLength);
}

// MP4 与 MOV 通常都以 ftyp 盒标识容器，提前检查可给出更清晰的降级结果。
function hasMotionPhotoVideoSignature(buffer) {
    var bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 32));

    for (var index = 0; index <= bytes.length - 4; index++) {
        if (bytes[index] === 0x66
            && bytes[index + 1] === 0x74
            && bytes[index + 2] === 0x79
            && bytes[index + 3] === 0x70) {
            return true;
        }
    }

    return false;
}

// 所有二进制响应都通过流式读取器处理，使体积上限不依赖服务器声明。
function readBoundedResponse(response, maxBytes) {
    var declaredLengthHeader = response.headers.get('Content-Length');
    var declaredLength = declaredLengthHeader === null ? null : Number(declaredLengthHeader);

    // 可信的长度声明可以提前拒绝大文件，但实际字节数仍由下方逐块校验。
    if (Number.isSafeInteger(declaredLength)
        && declaredLength >= 0
        && declaredLength > maxBytes) {
        return Promise.reject(new Error('动态照片资源超过允许大小'));
    }

    // 无法逐块读取时宁可保留静态图，不能用一次性读取绕过内存保护。
    if (!response.body || typeof response.body.getReader !== 'function') {
        return Promise.reject(new Error('当前浏览器无法安全读取动态照片资源'));
    }

    var reader = response.body.getReader();
    var chunks = [];
    var totalBytes = 0;

    // 兼容读取完成、主动取消和网络异常，释放流锁时不影响原始结果。
    function releaseReader() {
        try {
            reader.releaseLock();
        } catch (error) {
            // 已取消的流可能自动释放锁，此处无需改变静态降级行为。
        }
    }

    // 合并仅发生在总量通过检查后，最终分配大小始终落在明确上限内。
    function mergeChunks() {
        var merged = new Uint8Array(totalBytes);
        var offset = 0;

        chunks.forEach(function(chunk) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
        });
        chunks.length = 0;

        return merged.buffer;
    }

    function readNextChunk() {
        return reader.read().then(function(result) {
            if (result.done) {
                releaseReader();
                return mergeChunks();
            }

            var chunk = result.value instanceof Uint8Array
                ? result.value
                : new Uint8Array(result.value);

            // 使用减法比较避免累计值越界，并在超限后立即取消剩余网络读取。
            if (chunk.byteLength > maxBytes - totalBytes) {
                chunks.length = 0;
                return reader.cancel().catch(function() {
                    // 取消失败不改变超限结论，后续仍抛出统一的安全错误。
                }).then(function() {
                    throw new Error('动态照片资源超过允许大小');
                });
            }

            chunks.push(chunk);
            totalBytes += chunk.byteLength;
            return readNextChunk();
        });
    }

// 网络错误和主动中止沿用原异常，调用方据此区分取消与播放失败。
    return readNextChunk().catch(function(error) {
        releaseReader();
        throw error;
    });
}

// 第一段请求只读取图片开头，通常几千字节内即可取得 XMP 元数据。
function fetchMotionPhotoMetadata(player, signal) {
    var rangeEnd = MOTION_PHOTO_METADATA_BYTES - 1;

    return fetch(player.source, {
        headers: { Range: 'bytes=0-' + rangeEnd },
        signal: signal
    }).then(function(response) {
        if (!response.ok) {
            throw new Error('动态照片资源请求失败，状态码：' + response.status);
        }

        // 206 只能返回元数据窗口；忽略 Range 的 200 响应仍受整文件上限约束。
        var responseLimit = response.status === 206
            ? MOTION_PHOTO_METADATA_BYTES
            : MOTION_PHOTO_MAX_SOURCE_BYTES;

        return readBoundedResponse(response, responseLimit).then(function(buffer) {
            // 完整文件只解码开头的 XMP 区域，避免为视频负载创建超大文本。
            var metadataBuffer = buffer.byteLength > MOTION_PHOTO_METADATA_BYTES
                ? buffer.slice(0, MOTION_PHOTO_METADATA_BYTES)
                : buffer;
            var metadata = parseMotionPhotoMetadata(metadataBuffer);
            var contentRange = response.headers.get('Content-Range');
            var totalLengthMatch = contentRange ? contentRange.match(/\/(\d+)$/) : null;

            // 部分资源服务器会公开总长度，可直接省略后续 HEAD 请求。
            if (totalLengthMatch) {
                var reportedFileLength = Number(totalLengthMatch[1]);

                if (Number.isSafeInteger(reportedFileLength)
                    && reportedFileLength >= metadata.videoLength
                    && reportedFileLength <= MOTION_PHOTO_MAX_SOURCE_BYTES) {
                    metadata.fileLength = reportedFileLength;
                }
            }

            // 状态码 200 表示服务器返回了完整文件，可以直接复用以避免再次下载。
            if (response.status === 200) {
                metadata.fullFileBuffer = buffer;
            }

            return metadata;
        });
    });
}

// 跨域尾部 Range 会触发额外预检，HEAD 提供显式起止位置所需的总长度。
function fetchMotionPhotoFileLength(player, signal) {
    return fetch(player.source, {
        method: 'HEAD',
        signal: signal
    }).then(function(response) {
        if (!response.ok) {
            throw new Error('动态照片长度请求失败，状态码：' + response.status);
        }

        var fileLength = Number(response.headers.get('Content-Length'));

        // 总长度必须能容纳视频，并保持在浏览器可控的内存范围内。
        if (!Number.isSafeInteger(fileLength)
            || fileLength <= 8
            || fileLength > MOTION_PHOTO_MAX_SOURCE_BYTES) {
            throw new Error('动态照片文件长度无效');
        }

        return fileLength;
    });
}

// 显式起止 Range 属于跨域安全请求头，能避开 suffix Range 的预检限制。
function fetchMotionPhotoVideoRange(player, metadata, fileLength, signal) {
    var requestOptions = { signal: signal };

    if (fileLength) {
        var videoStart = fileLength - metadata.videoLength;

        if (videoStart < 0) {
            throw new Error('动态照片的视频起始位置无效');
        }

        requestOptions.headers = {
            Range: 'bytes=' + videoStart + '-' + (fileLength - 1)
        };
    }

    return fetch(player.source, requestOptions).then(function(response) {
        if (!response.ok) {
            throw new Error('动态画面请求失败，状态码：' + response.status);
        }

        // 正常 Range 只允许返回目标视频长度，回退整文件时采用总体积上限。
        var responseLimit = response.status === 206
            ? metadata.videoLength
            : MOTION_PHOTO_MAX_SOURCE_BYTES;

        return readBoundedResponse(response, responseLimit);
    }).then(function(buffer) {
        return takeVideoTail(buffer, metadata.videoLength);
    });
}

// 第二阶段优先只读视频段；无法取得总长度时才退回完整文件并截取尾部。
function fetchMotionPhotoVideo(player, metadata, signal) {
    if (metadata.fullFileBuffer) {
        return Promise.resolve(takeVideoTail(metadata.fullFileBuffer, metadata.videoLength));
    }

    var fileLengthPromise = metadata.fileLength
        ? Promise.resolve(metadata.fileLength)
        : fetchMotionPhotoFileLength(player, signal).catch(function(error) {
            // 部分图床不支持 HEAD，但普通跨域 GET 仍可能可用。
            console.warn('无法取得动态照片总长度，将回退读取完整文件：', error);
            return null;
        });

    return fileLengthPromise.then(function(fileLength) {
        return fetchMotionPhotoVideoRange(player, metadata, fileLength, signal);
    });
}

// 声音属于播放状态的正交属性，不增加新的播放器状态枚举。
function setMotionPhotoSound(player, enabled) {
    var shouldEnable = Boolean(enabled);

    // 媒体静音属性是实际播放依据，按钮属性同步视觉与无障碍反馈。
    player.video.muted = !shouldEnable;
    var isEnabled = !player.video.muted;
    player.soundToggle.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
    player.soundToggle.textContent = isEnabled ? '声音：开' : '声音：关';

    // 名称描述下一次点击的动作，可见文字则描述当前声音状态。
    if (isEnabled) {
        player.soundToggle.setAttribute('aria-label', '关闭声音：' + player.description);
        player.soundToggle.title = '关闭声音';
    } else {
        player.soundToggle.setAttribute('aria-label', '开启声音：' + player.description);
        player.soundToggle.title = '开启声音';
    }

    return isEnabled;
}

// 所有状态都在一个入口更新，保证视觉提示与无障碍属性保持同步。
function setMotionPhotoState(player, state, message) {
    player.state = state;
    player.container.classList.remove('is-loading', 'is-playing', 'is-error');

    if (state !== 'idle') {
        player.container.classList.add('is-' + state);
    }

    player.trigger.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
    player.trigger.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    player.status.textContent = message || '';

    // 非播放状态恢复当前媒体静音，但会话偏好仍供下一次播放使用。
    if (state !== 'playing') {
        if (document.activeElement === player.soundToggle) {
            player.trigger.focus();
        }

        setMotionPhotoSound(player, false);
    }

    // 隐藏属性和禁用属性同步切换，防止不可见控件进入键盘顺序。
    player.soundToggle.hidden = state !== 'playing';
    player.soundToggle.disabled = state !== 'playing';

    if (state === 'playing') {
        player.trigger.setAttribute('aria-label', '暂停实况照片：' + player.description);
    } else if (state === 'loading') {
        player.trigger.setAttribute('aria-label', '取消加载实况照片：' + player.description);
    } else if (state === 'error') {
        player.trigger.setAttribute('aria-label', '重试播放实况照片：' + player.description);
    } else {
        player.trigger.setAttribute('aria-label', '播放实况照片：' + player.description);
    }
}

// 释放 Blob 地址和媒体缓冲，避免浏览多张照片后持续占用内存。
function releaseMotionPhotoVideo(player) {
    // 释放媒体前防御性恢复静音，错误回收路径也不会遗留有声状态。
    setMotionPhotoSound(player, false);
    player.video.pause();
    player.video.removeAttribute('src');
    player.video.load();

    if (player.objectUrl) {
        URL.revokeObjectURL(player.objectUrl);
        player.objectUrl = null;
    }
}

// 停止函数同时处理加载取消、画面复位与可选的内存回收。
function stopMotionPhoto(player, shouldRelease) {
    player.loadVersion += 1;

    if (player.abortController) {
        player.abortController.abort();
        player.abortController = null;
    }

    player.loadPromise = null;
    player.video.pause();

    try {
        player.video.currentTime = 0;
    } catch (error) {
        // 媒体尚未完成初始化时不能设置时间，静态图仍可正常显示。
    }

    if (shouldRelease) {
        releaseMotionPhotoVideo(player);
    }

    setMotionPhotoState(player, 'idle', '');

    if (activeMotionPhotoPlayer === player) {
        activeMotionPhotoPlayer = null;
    }
}

// 切换到新照片时停止并释放其他实例，控制并发请求和总体内存。
function stopOtherMotionPhotos(currentPlayer) {
    motionPhotoPlayers.forEach(function(player) {
        if (player !== currentPlayer && (player.state !== 'idle' || player.objectUrl)) {
            stopMotionPhoto(player, true);
        }
    });
}

// 视频对象创建一次后可在同一张照片上重复播放，直到切换到其他照片。
function ensureMotionPhotoVideo(player, loadVersion) {
    if (player.objectUrl) {
        return Promise.resolve();
    }

    if (player.loadPromise) {
        return player.loadPromise;
    }

    player.abortController = new AbortController();

    // 两段 Range 请求共用取消信号，用户切换照片时可以立即终止下载。
    player.loadPromise = fetchMotionPhotoMetadata(player, player.abortController.signal)
        .then(function(metadata) {
            return fetchMotionPhotoVideo(player, metadata, player.abortController.signal)
                .then(function(videoBuffer) {
                    return { metadata: metadata, videoBuffer: videoBuffer };
                });
        })
        .then(function(result) {
            // 过期请求不得覆盖用户后来选择的播放器状态。
            if (player.loadVersion !== loadVersion) return;

            if (!hasMotionPhotoVideoSignature(result.videoBuffer)) {
                throw new Error('动态照片尾部不是可识别的视频容器');
            }

            var videoBlob = new Blob([result.videoBuffer], { type: result.metadata.mimeType });
            player.objectUrl = URL.createObjectURL(videoBlob);
            player.video.src = player.objectUrl;
            player.video.load();
        })
        .finally(function() {
            if (player.loadVersion === loadVersion) {
                player.loadPromise = null;
                player.abortController = null;
            }
        });

    return player.loadPromise;
}

// 缺少任一基础能力时保持静态图片，避免点击后产生全局脚本错误。
function supportsMotionPhotoPlayback() {
    return typeof fetch === 'function'
        && typeof Promise !== 'undefined'
        && typeof AbortController !== 'undefined'
        && typeof Blob !== 'undefined'
        && typeof URL !== 'undefined'
        && typeof URL.createObjectURL === 'function';
}

// 活动实例和版本必须同时匹配，才能继续本轮异步播放链。
function isCurrentMotionPhotoPlayback(player, loadVersion) {
    return activeMotionPhotoPlayer === player && player.loadVersion === loadVersion;
}

// 根据会话偏好尝试有声播放，浏览器拒绝时只回退当前媒体而不改偏好。
function startMotionPhotoPlayback(player, loadVersion) {
    if (!isCurrentMotionPhotoPlayback(player, loadVersion)) {
        return Promise.resolve();
    }

    var soundEnabled = setMotionPhotoSound(player, motionPhotoSoundPreferred);

    return player.video.play().then(function() {
        // 停止或快速重播后，旧 Promise 不得更新新一轮播放状态。
        if (!isCurrentMotionPhotoPlayback(player, loadVersion)) return;
        return false;
    }).catch(function(error) {
        // 先检查版本，禁止旧回调把已停止的视频重新静音启动。
        if (!isCurrentMotionPhotoPlayback(player, loadVersion)) return;

        // 异步下载可能耗尽用户激活，只有策略拒绝才允许静音重试。
        if (!soundEnabled || !error || error.name !== 'NotAllowedError') {
            throw error;
        }

        setMotionPhotoSound(player, false);
        return player.video.play().then(function() {
            if (!isCurrentMotionPhotoPlayback(player, loadVersion)) return;
            // true 表示需要提示用户通过声音按钮再次确认。
            return true;
        });
    });
}

// 播放始终由明确点击触发，并按会话偏好恢复声音状态。
function playMotionPhoto(player) {
    if (!supportsMotionPhotoPlayback()) {
        setMotionPhotoState(player, 'error', '当前浏览器不支持动态照片播放，已保留原始图片。');
        return;
    }

    stopOtherMotionPhotos(player);
    // 每次点击播放都分配新版本，复用视频时也能区分前后两轮 Promise。
    var loadVersion = player.loadVersion + 1;
    player.loadVersion = loadVersion;
    activeMotionPhotoPlayer = player;
    setMotionPhotoState(player, 'loading', '正在载入动态画面…');

    ensureMotionPhotoVideo(player, loadVersion).then(function() {
        // 下载期间若用户取消或切换照片，不再继续启动旧播放器。
        if (!isCurrentMotionPhotoPlayback(player, loadVersion) || !player.objectUrl) return;

        player.video.currentTime = 0;
        return startMotionPhotoPlayback(player, loadVersion);
    }).then(function(soundConfirmationRequired) {
        if (isCurrentMotionPhotoPlayback(player, loadVersion) && !player.video.paused) {
            var statusMessage = soundConfirmationRequired
                ? '浏览器要求再次点击“声音：关”才能开启声音。'
                : '';
            setMotionPhotoState(player, 'playing', statusMessage);
        }
    }).catch(function(error) {
        // 过期链路不能释放或覆盖同一实例后来创建的新播放状态。
        if (!isCurrentMotionPhotoPlayback(player, loadVersion)) return;
        if (error && error.name === 'AbortError') return;

        // 错误只影响动态层，原始图片会继续作为可靠的静态降级内容。
        console.warn('动态照片播放失败：', error);
        releaseMotionPhotoVideo(player);
        setMotionPhotoState(player, 'error', '动态画面无法播放，已保留静态图片。');

        if (activeMotionPhotoPlayer === player) {
            activeMotionPhotoPlayer = null;
        }
    });
}

// 点击加载中状态可取消请求；播放状态再次点击则回到静态图。
function toggleMotionPhoto(player) {
    if (player.state === 'loading' || player.state === 'playing') {
        stopMotionPhoto(player, false);
        return;
    }

    playMotionPhoto(player);
}

// 仅活动且正在播放的实例可以切换声音，避免过期按钮改变其他播放器。
function toggleMotionPhotoSound(player) {
    if (activeMotionPhotoPlayer !== player || player.state !== 'playing') return;

    var isEnabled = setMotionPhotoSound(player, player.video.muted);
    saveMotionPhotoSoundPreference(isEnabled);
    // 用户已经通过直接点击确认声音选择，不再保留策略回退提示。
    player.status.textContent = '';
}

// 运行时包装保留 Markdown 原图，无脚本或加载失败时内容仍然可读。
function createMotionPhotoPlayer(image) {
    if (!image.parentNode || image.closest('.post-motion-photo')) return;

    var container = document.createElement('span');
    var trigger = document.createElement('button');
    var video = document.createElement('video');
    var badge = document.createElement('span');
    var soundToggle = document.createElement('button');
    var status = document.createElement('span');
    var description = image.getAttribute('alt') || '未命名照片';

    container.className = 'post-motion-photo';
    trigger.className = 'post-motion-photo-trigger';
    trigger.type = 'button';
    image.classList.add('post-motion-photo-image');
    video.className = 'post-motion-photo-video';
    video.muted = true;
    video.defaultMuted = true;
    video.preload = 'none';
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    badge.className = 'post-motion-photo-badge';
    badge.textContent = '实况';
    badge.setAttribute('aria-hidden', 'true');
    soundToggle.className = 'post-motion-photo-sound';
    soundToggle.type = 'button';
    soundToggle.hidden = true;
    soundToggle.disabled = true;
    status.className = 'post-motion-photo-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    // 先插入容器再移动图片，确保原节点位置和文章阅读顺序不变。
    image.parentNode.insertBefore(container, image);
    trigger.appendChild(image);
    trigger.appendChild(video);
    trigger.appendChild(badge);
    container.appendChild(trigger);
    // 声音按钮与主触发器保持同级，避免在 button 内嵌套交互元素。
    container.appendChild(soundToggle);
    container.appendChild(status);

    var player = {
        container: container,
        trigger: trigger,
        video: video,
        soundToggle: soundToggle,
        status: status,
        description: description,
        source: image.currentSrc || image.src,
        state: 'idle',
        objectUrl: null,
        loadPromise: null,
        abortController: null,
        loadVersion: 0
    };

    setMotionPhotoState(player, 'idle', '');
    trigger.addEventListener('click', function() {
        toggleMotionPhoto(player);
    });
    soundToggle.addEventListener('click', function(event) {
        // 独立按钮不改变画面播放状态，只切换当前媒体的静音属性。
        event.preventDefault();
        event.stopPropagation();
        toggleMotionPhotoSound(player);
    });
    video.addEventListener('ended', function() {
        stopMotionPhoto(player, false);
    });
    motionPhotoPlayers.push(player);
}

// 初始化只改造候选图片，不发起任何动态视频网络请求。
function initializeMotionPhotos() {
    document.querySelectorAll('.post-content img').forEach(function(image) {
        if (isMotionPhotoCandidate(image)) {
            createMotionPhotoPlayer(image);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMotionPhotos();
});

// 页面离开时统一回收对象地址，防止浏览器会话长期持有视频缓冲。
window.addEventListener('pagehide', function() {
    motionPhotoPlayers.forEach(function(player) {
        stopMotionPhoto(player, true);
    });
});

// 标签页进入后台时停止播放，减少无意义的解码、耗电和音视频占用。
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        motionPhotoPlayers.forEach(function(player) {
            if (player.state !== 'idle') {
                stopMotionPhoto(player, false);
            }
        });
    }
});
