// 保护数学公式不被 markdown 渲染器破坏
// 先替换为占位符 → markdown 渲染 → 再恢复
// 需要保护四种分隔符：\[...\] \(...\) $$...$$ $...$

function escapeMath(content) {
  var mathBlocks = [];

  // 1. \[...\] 块级公式（先于其他，避免内部被误匹配）
  content = content.replace(/\\\[([\s\S]*?)\\\]/g, function (match) {
    mathBlocks.push(match);
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 2. $$...$$ 块级公式
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, function (match) {
    mathBlocks.push(match);
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 3. \(...\) 行内公式
  content = content.replace(/\\\(([^\n]+?)\\\)/g, function (match) {
    mathBlocks.push(match);
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  // 4. $...$ 行内公式（不跨行）
  content = content.replace(/\$([^\$\n]+?)\$/g, function (match) {
    mathBlocks.push(match);
    return '%%MATHBLOCK' + (mathBlocks.length - 1) + '%%';
  });

  return { content: content, blocks: mathBlocks };
}

function unescapeMath(content, blocks) {
  for (var i = 0; i < blocks.length; i++) {
    content = content.split('%%MATHBLOCK' + i + '%%').join(blocks[i]);
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
    data.content = unescapeMath(data.content, data._mathBlocks);
    data._mathBlocks = null;
  }
  return data;
});
