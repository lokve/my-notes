---
title: 121.Best Time to Buy and Sell Stock
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

[地址](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/)

### 我的答案

找出所有的结果，取最大的，但是时间不够

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let rst = 0;

  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      rst = Math.max(rst, prices[j] - prices[i]);
    }
  }

  return rst;
};

console.log(maxProfit([1, 2]));
```

### 参考答案

[看这里](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/0121.%E4%B9%B0%E5%8D%96%E8%82%A1%E7%A5%A8%E7%9A%84%E6%9C%80%E4%BD%B3%E6%97%B6%E6%9C%BA.md)

先找最小值，再找最大差

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {

  let rst = 0;
  let min = prices[0]

  for (let i = 1; i < prices.length; i++) {
    min = Math.min(min, prices[i])
    rst = Math.max(rst, prices[i]- min)
  }

  return rst;
};
```

动态规划解法

```js
var maxProfit = function(prices){
  let n = prices.length;
  let dp = [];
  
  for(let i=0; i<n; i++){
    dp[i] = [];
    if(i-1 === -1){
      dp[i][0] = 0; 
        // Explanation：
        //   dp[i][0] 
        // = max(dp[-1][0], dp[-1][1] + prices[i])
        // = max(0, -infinity + prices[i]) = 0
      dp[i][1] = -prices[i];
        // Explanation：
        //   dp[i][1] 
        // = max(dp[-1][1], dp[-1][0] - prices[i])
        // = max(-infinity, 0 - prices[i]) 
        // = -prices[i]
      continue;
    }
    dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]);
    dp[i][1] = Math.max(dp[i-1][1],  -prices[i])
  }
  return dp[n-1][0];
}
```

