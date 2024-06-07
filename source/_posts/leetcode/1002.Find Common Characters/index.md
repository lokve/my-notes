---
title: 1002.Find Common Characters
tags: 
  - leetcode
  - 数组
categories:
  - leetcode
  - 数组
---

## 题目

[地址](https://leetcode.com/problems/find-common-characters/)


### 我的答案

先找第一个字母分布，然后再遍历其他单词，如果当前字母在第一个单词中，则计数+1

```js
/**
 * @param {string[]} words
 * @return {string[]}
 */
var commonChars = function(words) {

    let obj = {};
    for (let i = 0; i < words[0].length; i++) {
        const char = words[0][i];
        if (obj[char]) {
            obj[char]++;
        } else {
            obj[char] = 1;
        }
    }

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const obj2 = {}
        let has = false;
        for (let j = 0; j < word.length; j++) {
            const char = word[j];

            if (obj[char]) {
                obj2[char] = (obj2[char] || 0) + 1;
                obj[char]--;
                has = true;
            }
        }

        if (!has) return [];

        obj = obj2;
    }

    const result = [];
    for (const key in obj) {
        const count = obj[key];
        for (let i = 0; i < count; i++) {
            result.push(key);
        }
    }
    return result;
};

console.log(commonChars(["cool","lock","cook"]));
```

### 参考答案

思路一样，在实现上有区别

```js
var count = function(word) {
    const frequency = Array(26).fill(0);
    for (let char of word) {
        frequency[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
    }
    return frequency;
}

var intersection = function(freq1, freq2) {
    return freq1.map((f1, idx) => Math.min(f1, freq2[idx]));
}

var commonChars = function(words) {
    let last = count(words[0]);
    for (let i = 1; i < words.length; i++) {
        last = intersection(last, count(words[i]));
    }
    
    const result = [];
    for (let i = 0; i < 26; i++) {
        while (last[i] > 0) {
            result.push(String.fromCharCode(i + 'a'.charCodeAt(0)));
            last[i]--;
        }
    }
    
    return result;
}
```