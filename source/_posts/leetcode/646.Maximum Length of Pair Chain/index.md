---
title: 646.Maximum Length of Pair Chain
tags: 
  - leetcode 
  - 动态规划 
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/maximum-length-of-pair-chain/description/)

### 我的答案

借用[300题](https://leetcode.com/problems/longest-increasing-subsequence/description/)的思路，先排序，再算数量，不过时间和空间都很差

```js
/**
 * @param {number[][]} pairs
 * @return {number}
 */
var findLongestChain = function(pairs) {
    if (!pairs.length) return 0;
    if (pairs.length === 1) return 1;
    pairs.sort((x,y) => x[0] - y[0]);

    const dp = [1];
    let max = 1;
    for (let i = 1; i <= pairs.length - 1; i++) {
        dp[i] = 1;
        for (let j = i - 1; j >= 0; j--) {
            if (pairs[i][0] > pairs[j][1]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
        max = Math.max(dp[i], max)
    }

    return max;

};

console.log(findLongestChain([[1,2],[2,3],[3,4]]));
```

### 参考答案


```js
/**
 * @param {number[][]} pairs
 * @return {number}
 */
var findLongestChain = function(pairs) {
        pairs.sort((a, b) => a[1] - b[1]);

        let prev = pairs[0];
        let res = 1;

        for (let i = 1; i < pairs.length; i++) {
            const cur = pairs[i];
            if (cur[0] > prev[1]) {
                res++;
                prev = cur;
            }
        }

        return res;    
};
```