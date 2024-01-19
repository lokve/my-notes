---
title: 343.Integer Break
tags: leetcode
categories:
  - leetcode
---

## 题目

[地址](https://leetcode.com/problems/integer-break/)

### 我的答案

找数学规律，以3为基础是最大的

```js
/**
 * 2,1 × 1 = 1
 * 3,1 × 2 = 2
 * 4,2 × 2 = 4
 * 5,2 × 3 = 6 3的出现让乘积已经大于和了
 * 6,3 × 3 = 9
 * 7,3 × 2 × 2 = 12
 * 8,3 × 3 × 2 = 18
 * 9,3 × 3 × 3 = 27
 * 10,3 × 3 × 2 × 2 = 36
 * 11,3 × 3 × 2 × 3 = 54
 * @param {number} n
 * @return {number}
 */
var integerBreak = function(n) {
    if (n < 4) return n-1;
    let sum = 0;
    let rst = 1;
    while (sum < n - 4) {
        sum += 3;
        rst *= 3;
    }
    rst *= (n - sum);
    return rst;
};

```

### 参考答案

动态规划，把所有的组合都尝试一下，前几项的最大值已经被记录，不需要重复计算

```js
var integerBreak = function(n) {
    const dp = Array.from({length: n + 1}).fill(0)
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j <= i - 1; j++) {
            dp[i] = Math.max(dp[i], Math.max(j * dp[i - j], j * (i - j)));
        }
    }
    return dp[n];
};
```