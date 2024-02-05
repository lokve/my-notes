---
title: 188.Best Time to Buy and Sell Stock IV
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

[地址](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/description/)

### 答案

通用解法

```c++
for 0 <= i <= n:             // n is the number of days
	for i <= k <= k:        // k is the maximum number of transactions
		for s in {1,0}:    // s is the rest state
				dp[i][k][s] = max(buy,sell,rest)
```

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (k, prices) {
        const len = prices.length;
        const dp = [];

        for (let i = 0; i < len; i++) {
            dp[i] = [];
            for (let j = 0; j <= k; j++) {
                dp[i][j] = [];

                if (i === 0 || j === 0) {
                    dp[i][j][0] = 0;
                    dp[i][j][1] = -prices[i];
                } else {
                    dp[i][j][1] = Math.max(
                        dp[i - 1][j][1],
                        dp[i - 1][j - 1][0] - prices[i]
                    );
                    dp[i][j][0] = Math.max(dp[i - 1][j][0], dp[i - 1][j][1] + prices[i]);
                }
            }
        }

        return dp[len - 1][k][0];
    };

console.log(maxProfit(4, [1, 2, 4, 2, 5, 7, 2, 4, 9, 0]));

```

缩减代码

```js
var maxProfit = function(prices){
  let d_i20 = 0;
  let d_i21 = -Infinity; // base case for second transaction
  let d_i10 = 0;
  let d_i11 = -Infinity; //base case for second transaction
  
  for(let i=0; i<prices.length; i++){
    d_i10 = Math.max(d_i10, d_i11 + prices[i]);
    d_i11 = Math.max(d_i11,  0 - prices[i]);
    d_i20 = Math.max(d_i20, d_i21 + prices[i]);
    d_i21 = Math.max(d_i21, d_i10 - prices[i]);
   
  }
  return d_i20
}
```