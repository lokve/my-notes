---
title: 139.Word Break
tags: 
  - leetcode 
  - 动态规划 
  - DP
  - 完全背包
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/word-break/description/)

### 我的答案

用字符串匹配`wordDict`，并收集匹配到的index，然后判断index能否从头连到尾

```js
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const arr = [];
  for (let w of wordDict) {
    const startArr = [];
    const endArr = [];
    const len = w.length;
    for (let i = 0; i < s.length; i++) {
      if (w[0] === s[i]) {
          startArr.push(i);
          endArr.push(i);
      }
      if (endArr.length) {
        let j = endArr.length;
        while(j--){
          const start = startArr[j];
          let end = endArr[j];
          if (w[end - start] === s[i]) {
            end += 1;
            endArr[j] = end;
            if (end - start === len) {
              arr.push([start, end]);
              startArr.splice(j, 1);
              endArr.splice(j, 1);
            }
          } else {
            startArr.splice(j, 1);
            endArr.splice(j, 1);
          }
        }
      }
    }
  }

  if (!arr.length) return false;


  arr.sort((x, y) => x[0] - y[0]);

  if (arr[0][0] !== 0) return false;

  const dp = Array(s.length + 1).fill(false);

  dp[0] = true;

  for (let item of arr) {
    if (dp[item[0]]) {
      dp[item[1]] = true;
    }
  }

  return dp[s.length];
};

console.log(wordBreak("cbca", ["bc","ca"]));
console.log(wordBreak("aaaaaaa", ["aaaa", "aaa"]));
console.log(wordBreak("codedd", ["edd","code"]));
console.log(wordBreak("cars", ["car","ca","rs"]));

```

### 参考答案

完全背包

```js
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const dp = Array(s.length + 1).fill(false)
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let w of wordDict) {
      const len = w.length;
      if (i >= len && s.slice(i-len, i) === w) {
        dp[i] = dp[i] || dp[i-len];
      }
    }
  }

  return dp[s.length]
};

```