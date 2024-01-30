---
title: 377.Combination Sum IV
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

[地址](https://leetcode.com/problems/combination-sum-iv/description/)

### 我的答案

完全背包的遍历顺序会影响结果是排列(有顺序)还是组合，当然只算最大/小值就无所谓遍历顺序

[参考](https://programmercarl.com/0518.%E9%9B%B6%E9%92%B1%E5%85%91%E6%8D%A2II.html)

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var combinationSum4 = function(nums, target) {
  const dp = Array.from({ length: target + 1 }).fill(0);
  dp[0] = 1;
  for (let j = 1; j <= target; j++) {
    for (let coin of nums) {
      if (j >= coin) {
        dp[j] += dp[j - coin];
      }
    }
  }

  return dp[target];
};
console.log(combinationSum4([1, 2, 3], 4));

```
