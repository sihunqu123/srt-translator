#!/usr/bin/env node

const program = require('commander');
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
  translate(program.args, config);
}

// default
else {
  console.log('\r\n Welcome to use terminal-translate tools!You can use tr -h to get more help!')
}


