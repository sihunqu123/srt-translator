#!/usr/bin/env node

const exec = require('child_process').exec;

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
  if(!query || !Array.isArray(query)) {
    console.error('parameter error');
    return;
  }
  
  if(query[0].endsWith('.mkv')) { // for mkv, need to extract english srt first
  
    const dir = exec("ls -la", function(err, stdout, stderr) {
      if (err) {
        // should have err.code here?  
      }
      console.log(stdout);
    });

    dir.on('exit', function (code) {
      // exit code is code
      console.log(`exit code is ${code}`);
    });
  }
}
