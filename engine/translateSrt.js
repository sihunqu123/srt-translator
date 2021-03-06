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
const srtFile = '/media/sf_output/官能時代絵巻_耳なし芳一 怨凌姫/官能時代絵巻 耳なし芳一 怨凌姫_interview_channel_2.srt';
const srtFileTranslated = '/media/sf_output/output4.srt';

const srtOrigin = fs.readFileSync(srtFile, {
  encoding: 'utf8',
}).toString();
const srtArr = parse(srtOrigin);
const { length } = srtArr;
// const length = 100;
let currentIndex = 0;


const resultArr = [];

// console.info(res);

async function convert(lengthLimit = 300) {
  let translateLengthLimit = lengthLimit;
  let tmpSrt = '';
  const tmpArr = [];
  while (currentIndex < length) {
    const srtObj = srtArr[currentIndex];
    const { text } = srtObj;
    if (!text || text.startsWith('ts:')) { // if it's already translated, just skip
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
    if (tmpSrt.length + strToAdd.length > translateLengthLimit) { // asume 100 is the translate length limit
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
      // .split(/(?:[^a-z\dA-Z]{1}Baphomet。)+/i); // …Baphomet。     or   。Baphomet。
      .split('baphomet'); // …Baphomet。     or   。Baphomet。

    console.info(`responseArr.length: ${responseArr.length}, tmpArrlength: ${tmpArr.length}, retryTimes: ${retryTimes}, Max: ${MAX_RETRY_TIME}`);
    console.info(`the while should pass? : ${responseArr.length === 1 && tmpArr.length > 1}`);
  }

  do {
    if (retryTimes++ < MAX_RETRY_TIME) {
      if(retryTimes > 1) {
        console.info(`retry: ${retryTimes - 1}`);
      }
      try {
        await doTranslateStr();
      } catch(e) {
        console.error(e);
      }
    } else {
      currentIndex = currentIndex - tmpArr.length;
      throw new Error(`retry times exceed for string: ${tmpSrt}`);
    }
  } while (responseArr && responseArr.length === 1 && tmpArr.length > 1) // which means translate failed

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
    let retryTimes = 0;
    let translateLengthLimit = 500;
    console.info(`*(*****currentIndex: ${currentIndex}, length: ${length}, translateLengthLimit: ${translateLengthLimit}`);
    while (true) {
      if(retryTimes > 1) {
        console.info(`=================retry: ${retryTimes - 1}`);
      }
      translateLengthLimit = translateLengthLimit > 100 ? (translateLengthLimit - 100) : 400;
      console.info(`-----------translateLengthLimit: ${translateLengthLimit}`);
      try {
        await convert(translateLengthLimit);
        break;
      } catch(e) {
        console.error(e);
        if(retryTimes++ >= MAX_RETRY_TIME) {
          throw new Error(`retry times exceed`);
        }
      }
    }     
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
