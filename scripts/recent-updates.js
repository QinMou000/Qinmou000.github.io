// 从 git 提交历史生成「最近更新」页面，以及每次提交的单文件差异数据。
// 页面本身只带提交元信息和增删行数；差异按提交拆成独立 JSON，点击卡片时再按需加载。

var execFileSync = require('child_process').execFileSync;
var moment = require('moment');

var COMMIT_MARK = '\x01';
var POST_DIR = 'source/_posts/';

function runGit(baseDir, args) {
  return execFileSync('git', args, {
    cwd: baseDir,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore']
  });
}

function basename(filePath) {
  return filePath.replace(/\\/g, '/').split('/').pop();
}

// 把 -p 输出按文件切开，只保留 @@ 开始的 hunk 内容。
function parsePatches(text) {
  if (!text) {
    return [];
  }

  return text.split(/^diff --git /m).filter(Boolean).map(function (chunk) {
    var plus = /^\+\+\+ (?:b\/)?(.+)$/m.exec(chunk);
    var minus = /^--- (?:a\/)?(.+)$/m.exec(chunk);
    var filePath = '';

    if (plus && plus[1] !== '/dev/null') {
      filePath = plus[1];
    } else if (minus && minus[1] !== '/dev/null') {
      filePath = minus[1];
    }

    var hunkIndex = chunk.indexOf('\n@@');

    return {
      path: filePath.trim(),
      patch: hunkIndex === -1 ? '' : chunk.slice(hunkIndex + 1).replace(/\n+$/, '')
    };
  });
}

// 把 git log 的正文拆成提交：先解析 --raw 的状态与 --numstat 的行数，再挂上 -p 的差异。
function parseLog(output) {
  return output.split(COMMIT_MARK).filter(function (block) {
    return block.trim();
  }).map(function (block) {
    var patchIndex = block.search(/\ndiff --git /);
    var meta = patchIndex === -1 ? block : block.slice(0, patchIndex);
    var patchText = patchIndex === -1 ? '' : block.slice(patchIndex + 1);
    var lines = meta.split('\n');
    var header = lines[0].split('\t');
    var commit = {
      hash: header[0] || '',
      iso: header[1] || '',
      author: header[2] || '',
      subject: header[3] || '（无提交说明）',
      files: []
    };

    var statusByPath = {};
    var statsByPath = {};

    lines.slice(1).forEach(function (line) {
      var raw = /^:\d+ \d+ \S+ \S+ ([A-Z])\d*\t(.+)$/.exec(line);
      if (raw) {
        statusByPath[raw[2]] = raw[1];
        return;
      }

      var stat = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
      if (stat) {
        statsByPath[stat[3]] = {
          added: stat[1] === '-' ? null : Number(stat[1]),
          deleted: stat[2] === '-' ? null : Number(stat[2])
        };
      }
    });

    var patches = parsePatches(patchText);
    var patchByPath = {};

    patches.forEach(function (patch) {
      patchByPath[patch.path] = patch.patch;
    });

    commit.files = Object.keys(statusByPath).map(function (filePath, index) {
      var stats = statsByPath[filePath] || { added: 0, deleted: 0 };
      var patch = patchByPath[filePath];

      if (typeof patch === 'undefined') {
        patch = patches[index] ? patches[index].patch : '';
      }

      return {
        path: filePath,
        status: statusByPath[filePath],
        added: stats.added,
        deleted: stats.deleted,
        patch: patch
      };
    });

    return commit;
  }).filter(function (commit) {
    return commit.files.length > 0;
  });
}

// 从 origin 推断 GitHub 仓库地址，用于差异加载失败时的兜底链接。
function detectRepoUrl(baseDir) {
  try {
    var remote = runGit(baseDir, ['remote', 'get-url', 'origin']).trim();
    var match = /github\.com[:/]([^/\s]+)\/([^/\s]+)$/.exec(remote);

    if (match) {
      return 'https://github.com/' + match[1] + '/' + match[2].replace(/\.git$/, '');
    }
  } catch (err) {
    // 没有 remote 时不影响页面生成。
  }

  return '';
}

hexo.extend.generator.register('recent-updates', function (locals) {
  var options = hexo.config.recent_updates || {};

  if (options.enable === false) {
    return;
  }

  var limit = Number(options.limit) > 0 ? Number(options.limit) : 30;
  var baseDir = hexo.base_dir;

  // 文章索引：git 里记录的是 source/_posts/xxx.md，用文件名与 Hexo 文章对应。
  var postBySource = {};
  var postByBaseName = {};

  locals.posts.each(function (post) {
    var source = (post.source || '').replace(/\\/g, '/');
    var fullSource = source.indexOf('source/') === 0 ? source : 'source/' + source;
    var name = basename(source);

    postBySource[fullSource] = post;
    if (name && !postByBaseName[name]) {
      postByBaseName[name] = post;
    }
  });

  var commits = [];
  var shallow = false;
  var totalCommits = 0;
  var repoUrl = '';

  try {
    shallow = runGit(baseDir, ['rev-parse', '--is-shallow-repository']).trim() === 'true';
    repoUrl = detectRepoUrl(baseDir);

    totalCommits = Number(runGit(baseDir, [
      'rev-list', '--count', '--no-merges', 'HEAD', '--', POST_DIR
    ]).trim()) || 0;

    var output = runGit(baseDir, [
      '-c', 'core.quotepath=false',
      'log',
      '--no-merges',
      '--no-renames',
      '--date=iso-strict',
      '-n', String(limit),
      '--pretty=format:%x01%H%x09%aI%x09%an%x09%s',
      '--raw',
      '--numstat',
      '-p',
      '--unified=3',
      '--',
      POST_DIR
    ]);

    commits = parseLog(output).map(function (commit) {
      var changedAt = moment(commit.iso);
      var files = commit.files.map(function (file) {
        var post = postBySource[file.path] || postByBaseName[basename(file.path)];
        var added = file.added;
        var deleted = file.deleted;
        var total = (added || 0) + (deleted || 0);

        return {
          path: post ? post.path : '',
          title: post ? post.title : basename(file.path).replace(/\.md$/i, ''),
          status: file.status,
          added: added,
          deleted: deleted,
          binary: added === null || deleted === null,
          addPercent: total ? Math.round((added || 0) / total * 100) : 0,
          delPercent: total ? 100 - Math.round((added || 0) / total * 100) : 0,
          missing: !post,
          patch: file.patch
        };
      });

      var addedTotal = 0;
      var deletedTotal = 0;

      files.forEach(function (file) {
        addedTotal += file.added || 0;
        deletedTotal += file.deleted || 0;
      });

      return {
        hash: commit.hash,
        short: commit.hash.slice(0, 7),
        author: commit.author,
        subject: commit.subject,
        time: changedAt.format('HH:mm'),
        dateTime: changedAt.format('YYYY-MM-DDTHH:mm:ssZ'),
        dayKey: changedAt.format('YYYY-MM-DD'),
        dayLabel: changedAt.format('MM-DD'),
        year: changedAt.format('YYYY'),
        weekday: '周' + '日一二三四五六'.charAt(changedAt.day()),
        files: files,
        fileCount: files.length,
        added: addedTotal,
        deleted: deletedTotal,
        commitUrl: repoUrl ? repoUrl + '/commit/' + commit.hash : ''
      };
    });
  } catch (err) {
    hexo.log.warn('[recent-updates] 读取 git 提交历史失败：' + (err && err.message ? err.message : err));

    return {
      path: 'updates/index.html',
      layout: 'updates',
      data: {
        title: '最近更新',
        comments: false,
        available: false,
        groups: [],
        shownCommits: 0,
        totalCommits: 0,
        added: 0,
        deleted: 0,
        limit: limit
      }
    };
  }

  var groups = [];
  var addedTotal = 0;
  var deletedTotal = 0;

  commits.forEach(function (commit) {
    var last = groups[groups.length - 1];

    addedTotal += commit.added;
    deletedTotal += commit.deleted;

    if (!last || last.key !== commit.dayKey) {
      last = {
        key: commit.dayKey,
        label: commit.dayLabel,
        year: commit.year,
        weekday: commit.weekday,
        commits: []
      };
      groups.push(last);
    }

    last.commits.push(commit);
  });

  var pageRoute = {
    path: 'updates/index.html',
    layout: 'updates',
    data: {
      title: '最近更新',
      comments: false,
      available: true,
      shallow: shallow,
      groups: groups,
      shownCommits: commits.length,
      totalCommits: totalCommits,
      added: addedTotal,
      deleted: deletedTotal,
      limit: limit,
      repoUrl: repoUrl,
      generatedAt: moment().format('YYYY-MM-DD HH:mm')
    }
  };

  // 每次提交单独一份 JSON，页面首屏不必下载全部差异。
  var diffRoutes = commits.map(function (commit) {
    return {
      path: 'updates/diffs/' + commit.hash + '.json',
      data: JSON.stringify({
        hash: commit.hash,
        subject: commit.subject,
        time: commit.dateTime,
        commitUrl: commit.commitUrl,
        files: commit.files.map(function (file) {
          return {
            path: file.path,
            title: file.title,
            status: file.status,
            added: file.added,
            deleted: file.deleted,
            binary: file.binary,
            patch: file.patch || ''
          };
        })
      })
    };
  });

  return [pageRoute].concat(diffRoutes);
});
