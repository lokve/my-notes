---
title: 650.2 Keys Keyboard
tags:
  - leetcode
  - 动态规划
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/2-keys-keyboard/description/)

### 我的答案

数学规律，结果和约数有关

```js
/**
 * 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
 * 0, 2, 3, 4, 5, 5, 7, 6, 6, 7
 * @param {number} n
 * @return {number}
 */
var minSteps = function(n) {
    const dp = Array.from({length: n + 1}).fill(Number.MAX_SAFE_INTEGER);
    dp[1] = dp[0] = 0;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j <= i; j++) {
            if (i % j === 0) {
                dp[i] = Math.min(dp[i], dp[j] + i/j)
            } else {
                dp[i] = Math.min(dp[i], i)
            }
        }
    }

    return dp[n];
};

console.log(minSteps(1));
console.log(minSteps(2));
console.log(minSteps(3));
console.log(minSteps(5));
```
