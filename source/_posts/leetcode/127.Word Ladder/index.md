---
title: 127.Word Ladder
tags:
  - leetcode
  - BFS
categories:
  - leetcode
  - BFS
---

## 题目

[地址](https://leetcode.com/problems/word-ladder/description/)

### 我的答案

时间不够

```js
/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
var ladderLength = function (beginWord, endWord, wordList) {
  const queue = [
    {
      time: 1,
      beginWord,
      wordList,
      links: [beginWord]
    },
  ];
  while (queue.length) {
    // console.log(queue);
    const obj = queue.shift();

    if (obj.beginWord === endWord) {
      // console.log(obj.links);
      // rst.push(obj.time)
      // continue;

      return obj.time
    }

    for (let i = 0; i < obj.wordList.length; i++) {
      if (isAdjacent(obj.beginWord, obj.wordList[i])) {
        // console.log([...obj.wordList.slice(0, i), ...obj.wordList.slice(i + 1)]);
        queue.push({
          time: obj.time + 1,
          beginWord: obj.wordList[i],
          wordList: [...obj.wordList.slice(0, i), ...obj.wordList.slice(i + 1)],
          links: [...obj.links, obj.wordList[i]]
        });
      }
    }
  }
  return 0;
};

function isAdjacent(word1, word2) {
  let num = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      num++;
    }

    if (num > 1) {
      return false;
    }
  }

  return num === 1;
}

```

先收集关系，再遍历，但内存溢出了

```js

/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
var ladderLength = function (beginWord, endWord, wordList) {
    if (!wordList.find(item => item === endWord)) return 0;

    wordList.unshift(beginWord)
  const near = [];

  for (let i = 0; i < wordList.length; i++) {
      near[i] = []
      for (let j = 1; j < wordList.length; j++) {
          if (wordList[i] !== wordList[j] && isAdjacent(wordList[i], wordList[j])) {
              near[i].push(j)
          }
      }
  }

  // console.log(near);

  const queue = [
    {
      time: 1,
      ids: near[0],
        used: {0: true}
    },
  ];
  while (queue.length) {
    const obj = queue.shift();

    const ids = obj.ids;

    for (const index of ids) {
        if (wordList[index] === endWord) {
            return obj.time + 1;
        }
        if (!obj.used[index]) {
            queue.push({
                time: obj.time + 1,
                ids: near[index],
                used: {
                    ...obj.used,
                    [index]: true,
                }
            });
        }

    }
  }
  return 0;
};


function isAdjacent(word1, word2) {
  let num = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      num++;
    }

    if (num > 1) {
      return false;
    }
  }

  return num === 1;
}
```

### 参考答案

基于我的答案的改进版

```js
/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
var ladderLength = function (beginWord, endWord, wordList) {
    if (!wordList.find((item) => item === endWord)) return 0;

    wordList.unshift(beginWord);
    const near = [];

    for (let i = 0; i < wordList.length; i++) {
        near[i] = [];
        for (let j = 1; j < wordList.length; j++) {
            if (wordList[i] !== wordList[j] && isAdjacent(wordList[i], wordList[j])) {
                near[i].push(j);
            }
        }
    }

    // console.log(near);
    let time = 1;
    const used = {};
    const queue = [0];
    while (queue.length) {
        let len = queue.length;
        time += 1;

        while (len > 0) {
            len -= 1;
            const i = queue.shift();
            for (const index of near[i]) {
                if (wordList[index] === endWord) {
                    return time;
                }
                if (!used[index]) {
                    used[index] = true;
                    queue.push(index);
                }
            }
        }
    }
    return 0;
};

function isAdjacent(word1, word2) {
    let num = 0;
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) {
            num++;
        }

        if (num > 1) {
            return false;
        }
    }

    return num === 1;
}

```

找26个字母的组合反而更快

```js
var ladderLength = function(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList)
    let queue = [beginWord];
    let steps = 1;
    
    while(queue.length) {
        const next = [];
        
        // loop over each word in the queue
        for(let word of queue) {
            if(word === endWord) return steps;
            
            // loop over each char of the word 
            for(let i = 0; i < word.length; i++) {
                
                // and replace the char with letters from [a - z]
                for(let j = 0; j < 26; j++) {
                    const newWord = word.slice(0, i) + String.fromCharCode(j + 97) + word.slice(i+1);
                    
                    // if the new word exist in the word list add it to the queue
                    if(wordSet.has(newWord)) {
                        next.push(newWord);
                        wordSet.delete(newWord);
                    }
                }
            }
        }
        queue = next
        steps++;
    }
    return 0;    
};
```

