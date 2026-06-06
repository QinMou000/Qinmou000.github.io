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
