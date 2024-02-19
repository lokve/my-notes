---
title: 72.Edit Distance
tags:
  - leetcode
  - 动态规划
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/edit-distance/description/)


### 我的答案

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
    
    const dp = Array.from({ length: len1 + 1 }).map((_,i) =>
        Array.from({ length: len2 + 1 }).map((_,j) => {
            if (i === 0) {
                // 改变为空字符串需要的步数
                return j
            }
            // 从空字符串变为目标的步数，其实只要第一个就够了
            return i;
        })
    );


    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (word1[i-1] === word2[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = Math.min(
                    dp[i-1][j] + 1, // 删除
                    dp[i][j-1] + 1,  // 新增
                    dp[i-1][j-1]+1 // 替换
                );
            }
        }
    }


    return dp[len1][len2]

};
```
