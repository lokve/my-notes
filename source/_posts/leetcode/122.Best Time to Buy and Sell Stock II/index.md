---
title: 122.Best Time to Buy and Sell Stock II
tags:
  - leetcode
  - 动态规划
  - 买股票
categories:
  - leetcode
  - 动态规划
  - 买股票
---

## 题目

[地址](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)

### 我的答案

动态规划

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  const dp = Array.from({length: prices.length + 1}).fill(0);
  for (let i = 2; i <= prices.length; i++) {
    dp[i] = Math.max(dp[i-1], dp[i-1] + prices[i-1] - prices[i-2])
  }

  return dp[prices.length]
};
```

### 参考答案

[看这里](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/0122.%E4%B9%B0%E5%8D%96%E8%82%A1%E7%A5%A8%E7%9A%84%E6%9C%80%E4%BD%B3%E6%97%B6%E6%9C%BAII.md)


```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
        let rst = 0;
        for (let i = 1; i < prices.length; i++) {
            rst += Math.max(prices[i] - prices[i - 1], 0);
        }
        return rst;
    };

console.log(maxProfit);
```

动态规划解法

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {

  const len = prices.length;
  const dp = [];

  for (let i = 0; i < len; i++) {
    dp[i] = []
    if (i === 0) {
      dp[i][0] = 0;
      dp[i][1] = -prices[i];
    } else {
      dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]);
      dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] - prices[i])
    }
  }

  return dp[len-1][0]
};
```
