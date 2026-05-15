// 保护数学公式不被 markdown 渲染器破坏，并在服务端完成 KaTeX 渲染
// 先替换为占位符 → markdown 渲染 → 恢复 → 服务端 KaTeX 渲染

var katex = require('katex');

// 渲染公式为 HTML，失败时返回原文
function renderFormula(formula, displayMode) {
  try {
    return katex.renderToString(formula.trim(), {
      displayMode: displayMode,
      throwOnError: false,
      strict: false
    });
  } catch (e) {
    return formula; // 渲染失败时保留原文
  }
}

function escapeMath(content) {
  var mathBlocks = [];

  // 1. \[...\] 块级公式（先于其他，避免内部被误匹配）
  content = content.replace(/\\\[([\s\S]*?)\\\]/g, function (match) {
    mathBlocks.push({ formula: match, display: true });
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 2. $$...$$ 块级公式
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, function (match) {
    mathBlocks.push({ formula: match, display: true });
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 3. \(...\) 行内公式
  content = content.replace(/\\\(([^\n]+?)\\\)/g, function (match) {
    mathBlocks.push({ formula: match, display: false });
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 4. $...$ 行内公式（不跨行）
  content = content.replace(/\$([^\$\n]+?)\$/g, function (match) {
    mathBlocks.push({ formula: match, display: false });
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  return { content: content, blocks: mathBlocks };
}

function unescapeAndRender(content, blocks) {
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var formula = block.formula;
    var displayMode = block.display;

    // 提取纯公式内容（去除分隔符）
    var innerFormula;
    if (formula.slice(0, 2) === '\\[') {
      innerFormula = formula.slice(2, -2);
    } else if (formula.slice(0, 2) === '$$') {
      innerFormula = formula.slice(2, -2);
    } else if (formula.slice(0, 2) === '\\(') {
      innerFormula = formula.slice(2, -2);
    } else if (formula[0] === '$') {
      innerFormula = formula.slice(1, -1);
    } else {
      innerFormula = formula;
    }

    var rendered = renderFormula(innerFormula, displayMode);
    content = content.split('%%MATHBLOCK' + i + '%%').join(rendered);
  }
  return content;
}

hexo.extend.filter.register('before_post_render', function (data) {
  var result = escapeMath(data.content);
  data.content = result.content;
  data._mathBlocks = result.blocks;
  return data;
});

hexo.extend.filter.register('after_post_render', function (data) {
  if (data._mathBlocks && data._mathBlocks.length > 0) {
    data.content = unescapeAndRender(data.content, data._mathBlocks);
    data._mathBlocks = null;
  }
  return data;
});
