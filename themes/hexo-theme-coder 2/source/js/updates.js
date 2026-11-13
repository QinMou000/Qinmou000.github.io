// 「最近更新」页面交互：
// 点击提交 → 展开该次提交的博客标题列表；点击标题 → 在该标题下方展开单文件差异。
(function () {
    'use strict';

    var page = document.querySelector('.updates-page');

    if (!page) {
        return;
    }

    var root = page.getAttribute('data-root') || '/';

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function lineHtml(className, oldNumber, newNumber, text) {
        return '<span class="diff-line ' + className + '">' +
            '<span class="diff-no">' + (oldNumber === '' ? '' : oldNumber) + '</span>' +
            '<span class="diff-no">' + (newNumber === '' ? '' : newNumber) + '</span>' +
            '<span class="diff-code">' + escapeHtml(text) + '</span>' +
            '</span>';
    }

    // 按 hunk 头同步推进行号，渲染成单列 unified diff。
    function renderPatch(patch) {
        var html = '';
        var oldNumber = 0;
        var newNumber = 0;

        patch.split('\n').forEach(function (line) {
            if (line === '') {
                return;
            }

            if (line.slice(0, 2) === '@@') {
                var match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);

                if (match) {
                    oldNumber = Number(match[1]);
                    newNumber = Number(match[2]);
                }

                html += lineHtml('is-hunk', '', '', line);
            } else if (line.charAt(0) === '+') {
                html += lineHtml('is-add', '', newNumber, line);
                newNumber += 1;
            } else if (line.charAt(0) === '-') {
                html += lineHtml('is-del', oldNumber, '', line);
                oldNumber += 1;
            } else if (line.charAt(0) === '\\') {
                html += lineHtml('is-meta', '', '', line);
            } else {
                html += lineHtml('is-ctx', oldNumber, newNumber, line);
                oldNumber += 1;
                newNumber += 1;
            }
        });

        return html;
    }

    function renderFileDiff(file) {
        var link = file.path
            ? '<a class="diff-file-link" href="' + escapeHtml(root + file.path) + '">阅读全文</a>'
            : '<span class="diff-file-missing">文章已删除</span>';
        var body = file.patch
            ? '<div class="diff-block" tabindex="0" role="region" aria-label="文件差异">' + renderPatch(file.patch) + '</div>'
            : '<p class="diff-empty">' + (file.binary ? '二进制文件，没有可展示的文本差异。' : '本次改动没有可展示的文本差异。') + '</p>';

        return '<div class="diff-file-toolbar">' +
            '<span class="diff-scroll-hint" hidden>上下滚动查看完整差异</span>' +
            link +
        '</div>' + body;
    }

    function loadCommitData(card) {
        if (card._diffPromise) {
            return card._diffPromise;
        }

        if (typeof window.fetch !== 'function') {
            return Promise.resolve(null);
        }

        card._diffPromise = window.fetch(card.getAttribute('data-diff-url'), {
            credentials: 'same-origin'
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            return response.json();
        }).catch(function () {
            card._diffPromise = null;
            return null;
        });

        return card._diffPromise;
    }

    function setCardOpen(card, open) {
        var article = card.querySelector('.update-card');
        var head = card.querySelector('.update-card-head');
        var label = card.querySelector('.update-toggle-label');

        article.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (label) {
            label.textContent = open ? '收起文件' : '查看文件';
        }
    }

    function setFileOpen(row, open) {
        var button = row.querySelector('.update-file-inner');
        var panel = row.querySelector('.file-diff');

        row.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
    }

    Array.prototype.forEach.call(page.querySelectorAll('[data-commit-card]'), function (card) {
        var head = card.querySelector('.update-card-head');
        var commitUrl = card.getAttribute('data-commit-url');
        var fallback = commitUrl
            ? ' <a href="' + escapeHtml(commitUrl) + '" target="_blank" rel="noopener">在 GitHub 查看这次提交</a>'
            : '';

        head.addEventListener('click', function () {
            setCardOpen(card, !card.querySelector('.update-card').classList.contains('is-open'));
        });

        Array.prototype.forEach.call(card.querySelectorAll('.update-file-inner'), function (button) {
            button.addEventListener('click', function () {
                var row = button.closest('.update-file');
                var panel = row.querySelector('.file-diff');
                var index = Number(button.getAttribute('data-file-index'));
                var open = !row.classList.contains('is-open');

                setFileOpen(row, open);

                if (!open || panel.getAttribute('data-loaded') === '1') {
                    return;
                }

                panel.innerHTML = '<p class="diff-loading">正在加载差异…</p>';

                loadCommitData(card).then(function (data) {
                    var file = data && data.files ? data.files[index] : null;

                    if (!file) {
                        panel.innerHTML = '<p class="diff-error">差异加载失败。' + fallback + '</p>';
                        return;
                    }

                    panel.innerHTML = renderFileDiff(file);
                    panel.setAttribute('data-loaded', '1');

                    // 内容超出固定高度时给出提示，避免看起来像被截断。
                    window.requestAnimationFrame(function () {
                        var block = panel.querySelector('.diff-block');
                        var hint = panel.querySelector('.diff-scroll-hint');

                        if (block && block.scrollHeight > block.clientHeight + 2) {
                            panel.classList.add('is-scrollable');

                            if (hint) {
                                hint.hidden = false;
                            }
                        }
                    });
                });
            });
        });
    });
})();
