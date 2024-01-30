---
title: 322.Coin Change
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

[地址](https://leetcode.com/problems/coin-change/description/)

### 我的答案

完全背包

```js
/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function(coins, amount) {
    if (amount === 0) return 0;
    const max = Number.MAX_SAFE_INTEGER;
    const dp = Array.from({length: amount + 1}).fill(max);
    dp[0] = 0;
    for (let coin of coins) {
        for (let j = coin; j <= amount; j++) {
            dp[j] = Math.min(dp[j], dp[j - coin] + 1)
        }
    }

    return dp[amount] >= max ? -1 : dp[amount];
};

console.log(coinChange([1,2,5], 11));
console.log(coinChange([2], 3));
console.log(coinChange([2,5,10,1], 27));
console.log(coinChange([186,419,83,408], 6249));
```
