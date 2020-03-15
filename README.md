# README for translating English subtitle into Chinese subitlt

## Overview

The tool is based on the  [ShanaMaid/terminal-translate](https://github.com/ShanaMaid/terminal-translate) to translate string via Youdao API. For more information, pls refer to `README_origin`.


## How to use

You can translate your srt file in 3 steps.

Note> please make sure you have a good Internet connection before run, otherwise it may fail.

### Step 1

Install dependencies via:

```bash
npm ci
```

### Step 2

change the input srt and output srt

```javascript
const srtFile = '/media/sf_forshare/input.srt';
const srtFileTranslated = '/media/sf_forshare/output.srt';

```

in file `engine/translateSrt.js`.


### Step 3

Run

```bash
npm run srt

```

to translate your English srt into a Chinese-English srt.


