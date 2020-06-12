#!/usr/bin/env node

const program = require('commander');
const { exec } = require('child_process');
const fs = require("fs");
const translate = require("../index.js");
const path = require('path');

const configPath = path.resolve(__dirname, '../config.json');

const config = JSON.parse(fs.readFileSync(configPath));
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')));

program
  .usage(`\r\n  ${package.description}\r\n  GithubID: ${package.author}\r\n  Repository: ${package.repository.url}`)
  .option('-v, --version', 'show version')
  .option('-f, --baidu-from <from>', 'baidu engine: from language, default: auto')
  .option('-t, --baidu-to <to>', 'baidu engine: to language, default: zh')
  .option('-l, --baidu-language', 'baidu engine language')
  .option('-e, --engine <engine>', 'change translate engine')
  .option('-c, --config', 'show config.json')
  .parse(process.argv);


// translate
if (program.args.length > 0) {
  const args = (program.args + '').split(/\s+/);
  console.info(`args: ${args}`);
  const source = args[0];
  let inputFile = '';
  let outputFile = '';
  if(source.endsWith('.mkv')) { // need to extract srt from mkv file first
    inputFile = source.replace(/\.mkv$/, '.srt');
    
    const dir = exec('ls -la', (err, stdout, stderr) => {
      if (err) {
        // should have err.code here?
      }
      console.log(stdout);
    });

    dir.on('exit', (code) => {
      // exit code is code
      console.log(`exit code is ${code}`);
    });
    
  }
//if() {
//
//}
//translate(program.args, config);
}

// default
else {
  console.log('\r\n Welcome to use terminal-translate tools!You can use tr -h to get more help!')
}


// ./bin/ts.js   /media/sf_forshare/Return.to.House.on.Haunted.Hill.2007.重返猛鬼屋.mkv  sdfasd
