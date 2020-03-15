const fs = require('fs');
const Subtitle = require('subtitle');
const {
  parse, stringify, stringifyVtt, resync, toMS, toSrtTime, toVttTime,
} = require('subtitle');
const ts = require('./youdaoAPI');

// const CRLF_escaped = '??'; // no need to change line
const SPLIT_mark = ' @@ ';

const srtFile = '/media/sf_forshare/Re2.srt';
const srtFileTranslated = '/media/sf_forshare/Re5.srt';

const srtOrigin = fs.readFileSync(srtFile, {
  encoding: 'utf8',
}).toString();
const srtArr = parse(srtOrigin);
// const { length } = srtArr;
const length = 72;
let currentIndex = 0;


const resultArr = [];

// console.info(res);

async function convert() {
  let tmpSrt = '';
  const tmpArr = [];
  while (currentIndex < length ) {
    const srtObj = srtArr[currentIndex];
    const text = srtObj.text;
    if(text.startsWith('ts:')) { // if it's already translated, just skip
      currentIndex++;
      continue;
    }
    const strToAdd = text
              .replace(/\?+/g, '?')
              .replace(/\!+/g, '!')
              .replace(/@+/g, '@')
//              .replace(/\n/g, CRLF_escaped)
              .replace(/\n/g, ' \\n ')
              + SPLIT_mark;
    // refined the original text, single they change line even when it's very sort.
    srtObj.text = text.replace(/\n/g, ' \\n ');
    if(tmpSrt.length + strToAdd.length > 400) {  // asume 100 is the translate length limit
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

  console.info(`originStr: ${tmpSrt}`);
  const resultStr = await ts(tmpSrt);
  console.info(`reponseStr: ${resultStr}`);

  const responseArr = resultStr
//    .replace(/\? \?/g, '\n')
    .replace(/\\ n/g, ' \\n ')
    .split(/@@/);
  let j = 0;
  for (let i = 0; i < tmpArr.length; i++) {
    const obj = tmpArr[i];
    let translatedStr = responseArr[j++];
    if(!translatedStr || translatedStr.match(/^\s*$/)) {
      translatedStr = responseArr[j++];
    }
    obj.text = obj.text + '\n' + 'ts:' +  translatedStr;
  }


  console.info(tmpArr);
  console.info(JSON.stringify(responseArr, null, 2));
  return tmpArr;
}


async function convertASrt() {

  //const promiseArr = [];
  while(currentIndex < length) {
    //  promiseArr.push(convert());
    await convert();
  }


  const final_str = stringify(srtArr);
  console.info('final result is:');
  console.info(final_str);

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
