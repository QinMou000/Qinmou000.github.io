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
    if (getCookie("style") == "white") {
        $("#footer").attr("style", "color: #969696;");
        $(".flink").attr("style", "color: #969696;");
        $(".ba").attr("style", "color: #969696;");
        $("#bodyx").attr("class", "bg_while");
        $("#update_style").attr('checked', false);
    } else {
        $("#footer").attr("style", "");
        $(".flink").attr("style", "");
        $("#bodyx").attr("class", "");
        $(".ba").attr("style", "");
        $("#update_style").attr('checked', true);
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

$("#update_style").change(function() {
    var style = $("#update_style").is(':checked');
    if (style) {
        setCookie("style", "black")
        updateStyle();
    } else {
        setCookie("style", "white")
        updateStyle();
    }
});

// 目录生成与交互
function generateToc() {
    var content = document.querySelector('.post-content');
    var tocNav = document.getElementById('post-toc-nav');
    if (!content || !tocNav) return;

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