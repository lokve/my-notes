---
title: 494.Target Sum
tags: 
  - leetcode 
  - 动态规划 
  - DP
  - 01背包
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/target-sum/description/)

### 我的答案

```md
可以将这组数看成两部分，P 和 N，其中 P 使用正号，N 使用负号，有以下推导:

sum(P) - sum(N) = target
sum(P) + sum(N) + sum(P) - sum(N) = target + sum(P) + sum(N)
2 * sum(P) = target + sum(nums)
```

受上面公式启发，以及[题46](https://leetcode.com/problems/partition-equal-subset-sum/description/)，使用`01背包`解决问题

这里dp[i]表示nums里面相加能产生的和的数量

```js
/**
 * @param {number[]} nums
 * @param {number} S
 * @return {number}
 */
var findTargetSumWays = function(nums, S) {
    const sum = nums.reduce((x,y) => x + y);
    const W = (sum + S) / 2;
    if (Math.floor(W) !== W || W < 0) return 0;
    const dp = Array(W+1).fill(0);
    dp[0] = 1;
    for (let num of nums) {
        for (let i = W; i >= num; i--) {
            dp[i] = dp[i] + dp[i - num]
        }
    }

    return dp[W]
};

console.log(findTargetSumWays([100], -200));

```
