const http = require('http');
const chalk = require('chalk');
const config_default = require('../config');

const MAX_RETRY_LIMIT = 5;

const youdaoURL = 'http://fanyi.youdao.com/openapi.do?';

const errorCode = {
  0: '正常',
  20: '要翻译的文本过长',
  30: '无法进行有效的翻译',
  40: '不支持的语言类型',
  50: '无效的key',
  60: '无词典结果,仅在获取词典结果生效',
};


const queryYouDao = async function (query, config = config_default) {
  let retryTimes = 0;
  async function queryOnce() {
    const pos = Math.floor(Math.random() * config.youdao.length);
    const { key } = config.youdao[pos];
    const { keyfrom } = config.youdao[pos];
    const q = query;
    const data = {
      key,
      keyfrom,
      type: 'data',
      doctype: 'json',
      version: '1.1',
      q,
    };

    let url = youdaoURL;

    for (const item in data) {
      url += `${item}=${data[item]}&`;
    }

    url = encodeURI(url);
    return new Promise(async (resolve, reject) => http.get(url, (res) => {
      let resData = '';
      res.on('data', (data) => {
        resData += data;
      });
      res.on('end', () => {
        resData = JSON.parse(resData);
        const str = '';
        if (resData.errorCode === 0 && resData.translation) {
          console.info('resData is: ');
          console.log(resData);
          resolve(resData.translation[0]);
        } else {
          if (resData.errorCode === 30 && retryTimes++ < MAX_RETRY_LIMIT) { // need to retry
            console.info(`query failed with errorCode 30, will retry: ${retryTimes} for query: ${query}`);
            return queryOnce().then(resolve).catch(reject);
          }
          const errorMsg = `Got error when request: ${errorCode[resData.errorCode]}`;
          console.log(errorMsg);
          return reject(new Error(errorMsg));
        }
      });
    })
      .on('error', (e) => {
        const errorMsg = `Got error: ${e.message}`;
        console.error(errorMsg);
        reject(e);
      }));
  }
  return queryOnce();
};


// const query = "The house wanted us to succeed? !!!! I don't know. !!!! ARIEL:????Let's go home. !!!! [GIGGLING] !!!! WOMAN: What is it?????MAN: I don't know. !!!! I think it might be worth something.";
// queryYouDao(query, config).then((resTxt) => {
//   console.info(resTxt);
// });


// !!!! -> sentense split
// ???? -? \n

module.exports = queryYouDao;
