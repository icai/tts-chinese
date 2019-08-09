const fs = require('fs');
const download = require('download');
const arrayUniq = array => [...new Set(array)];
const tones = ['', 1, 2, 3, 4]; // 轻声为 me => me | me5 
const dicts = require('./pinyin-dict');

// Promise.all
const queue = function (arr, iter, end) {
  !function fire() {
    if (arr.length > 0) {
      var item = arr.shift();
      iter.apply({}, [item, fire].concat(Array.prototype.slice.call(arguments, 0)))
    } else {
      end();
    }
  }()
}

const createDownQueue = () => {
  const ignores = [];
  const queues = [];
  for (let j = 0; j < dicts.length; j++) {
    for (let i = 0; i < tones.length; i++) {
      queues.push(dicts[j] + tones[i]);
    }
  }
  queue(queues, (item, next) => {
    try {
      download(`http://appcdn.fanyi.baidu.com/zhdict/mp3/${item}.mp3`)
        .then(data => {
          fs.writeFileSync(`dist/${item}.mp3`, data);
          next();
        }).catch((e) => {
          if (e.statusMessage == 'Not Found') {
            ignores.push(item);
          }
          console.log(item + ' : ' + e.statusMessage);
          next();
        });
    } catch (e) {
      console.log(e);
      next();
    }
  }, ()=> {
    fs.writeFileSync('ignore-dict.json', JSON.stringify(ignores));
  })
}



createDownQueue();











