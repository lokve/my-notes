---
title: 583.Delete Operation for Two Strings
tags:
  - leetcode
  - 动态规划
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/delete-operation-for-two-strings/description/)

### 参考答案

动态规划找到两个字符串的共同字符串，然后计算得出需要删除的数量

```js
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
    if (word1 === word2) return 0
  const len1 = word1.length;
  const len2 = word2.length;
  const dp = Array.from({ length: len1 + 1 }).map(() =>
    Array.from({ length: len2 + 1 }).fill(0)
  );

  for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (word1[i-1] === word2[j-1]) {
            dp[i][j] = dp[i-1][j-1] + 1;
        } else {
            dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
  }

  return len1 + len2 - 2 * dp[len1][len2]
};

console.log(minDistance('asd', 'ad'));

```