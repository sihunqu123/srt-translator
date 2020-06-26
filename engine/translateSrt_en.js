const fs = require('fs');
const Subtitle = require('subtitle');
const {
  parse, stringify, stringifyVtt, resync, toMS, toSrtTime, toVttTime,
} = require('subtitle');
const ts = require('./youdaoAPI');

// const CRLF_escaped = '??'; // no need to change line
const SPLIT_mark = ' Baphomet. ';
const MAX_RETRY_TIME = 5;

// const srtFile = '/media/sf_forshare/srake.srt';
const srtFile = '/media/sf_forshare/aa.srt';
// const srtFile = '/media/sf_output/The.Witchmaker.1969.HANDJOB.mkv.srt';
const srtFileTranslated = '/media/sf_forshare/output4.srt';

const srtOrigin = fs.readFileSync(srtFile, {
  encoding: 'utf8',
}).toString();
const srtArr = parse(srtOrigin);
const { length } = srtArr;
// const length = 100;
let currentIndex = 0;


const resultArr = [];

// console.info(res);

async function convert() {
  let tmpSrt = '';
  const tmpArr = [];
  while (currentIndex < length) {
    const srtObj = srtArr[currentIndex];
    const { text } = srtObj;
    if (text.startsWith('ts:')) { // if it's already translated, just skip
      currentIndex++;
      continue;
    }
    let strToAdd = text
      .replace(/\?+/g, '?')
      .replace(/!+/g, '!')
      .replace(/@+/g, '@')
    //              .replace(/\n/g, CRLF_escaped)
//      .replace(/\n/g, ' \\n ');
      .replace(/\n/g, ' ');
    if(!strToAdd.trim().endsWith('.')) {
      strToAdd += '.';
    }
    strToAdd += SPLIT_mark;
    // refined the original text, single they change line even when it's very sort.
//    srtObj.text = text.replace(/\n/g, ' . \\n ');
    srtObj.text = text.replace(/\n/g, ' '); // seems like we don't need the '.' between 2 lines
    if (tmpSrt.length + strToAdd.length > 400) { // asume 100 is the translate length limit
      break;
    }
    if (!srtObj.text) {
      console.error(`text is undefined: ${JSON.stringify(srtObj)}`);
      throw new Error('text is empty');
    }

    tmpArr.push(srtObj);
    tmpSrt += strToAdd;
    currentIndex++;
  }

  let resultStr = null;
  let responseArr = null;
  let retryTimes = 0;

  async function doTranslateStr() {
    //    console.info(`originStr: ${tmpSrt}`);
    resultStr = await ts(tmpSrt);
    //    console.info(`reponseStr: ${resultStr}`);

    responseArr = resultStr
    //    .replace(/\? \?/g, '\n')
      .replace(/\\ n/g, ' \\n ')
      .split(/(?:[^a-z\dA-Z]{1}Baphomet。)+/); // …Baphomet。     or   。Baphomet。

    console.info(`responseArr.length: ${responseArr.length}, tmpArrlength: ${tmpArr.length}, retryTimes: ${retryTimes}, Max: ${MAX_RETRY_TIME}`);
    console.info(`the while should pass? : ${responseArr.length === 1 && tmpArr.length > 1}`);
  }

  await doTranslateStr();
  while (responseArr.length === 1 && tmpArr.length > 1) { // which means translate failed
    if (retryTimes++ < MAX_RETRY_TIME) {
      console.info(`retry: ${retryTimes}`);
      await doTranslateStr();
    } else {
      throw new Error(`retry times exceed for string: ${tmpSrt}`);
    }
  }

  let j = 0;
  for (let i = 0; i < tmpArr.length; i++) {
    const obj = tmpArr[i];
    let translatedStr = responseArr[j++];
    if (!translatedStr || translatedStr.match(/^\s*$/)) {
      translatedStr = responseArr[j++];
    }
    if (translatedStr) {
      translatedStr = translatedStr.trim();
    }
    obj.text = `${obj.text}\n` + `ts:${translatedStr}`;
  }


  console.info(tmpArr);
  console.info(JSON.stringify(responseArr, null, 2));
  return tmpArr;
}


async function convertASrt() {
  // const promiseArr = [];
  while (currentIndex < length) {
    //  promiseArr.push(convert());
    await convert();
  }


  const final_str = stringify(srtArr);
  //  console.info('final result is:');
  //  console.info(final_str);

  fs.writeFileSync(srtFileTranslated, final_str, {
    encoding: 'utf8',
  });
}


convertASrt();

// fs.writeFileSync(srtFileTranslated, 'sdfads\nsdafdasf', {
//   encoding: 'utf8',
// });


// !!!! -> sentense split
// ???? -? \n
