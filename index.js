#!/usr/bin/env node

// 翻译引擎
const baidu = require('./engine/baidu');
const youdao = require('./engine/youdao');
const iciba = require('./engine/iciba');

const engine = { baidu, youdao, iciba };


// 翻译
// module.exports = (query, config) => {
//   engine[config.default](query, config);
// };

module.exports = (query, config) => {
  console.info('dsfa');
  console.info(query);
  if (!query || !Array.isArray(query)) {
    console.error('parameter error');
    return;
  }

  if (query[0].endsWith('.mkv')) { // for mkv, need to extract english srt first
  }
};
