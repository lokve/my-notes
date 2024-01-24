---
title: 416.Partition Equal Subset Sum
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

[地址](https://leetcode.com/problems/partition-equal-subset-sum/description/)

### 我的答案

找两组和相同的数，就是找是否有和是`sum/2`的组合

通用方法，但是时间不够

```js
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canPartition = function(nums) {
    if (nums.length === 1) return false;
    const sum = nums.reduce((x,y) => x + y, 0);
    if (sum % 2 !== 0) return false;
    return calc(nums, sum / 2)
};

function calc(nums, rest) {
    if (rest === 0) return true;
    if (rest < 0) return false;

    for (let i = 0; i < nums.length; i++) {
        if (calc(nums.slice(i+1), rest - nums[i])) {
            return true;
        }
    }

    return false;
}

```

### 参考答案

可以勉强在时间内通过，通过dp记录，可以减少一些判断

```js
var canPartition = function (nums) {
    const totalSum = nums.reduce((acc, item) => acc + item, 0);
    if (totalSum % 2) return false;
    const target = totalSum / 2;
    const dp = new Array(nums.length).fill(-1).map(() => new Array(target + 1).fill(-1));

    function dfs(idx, target) {
        if (target === 0) return true;
        if (target < 0) return false;
        if (dp[idx][target] !== -1) return dp[idx][target];

        for (let i = idx + 1; i < nums.length; i++) {
            if (dfs(i, target - nums[idx]) || dfs(i, target)) return true;
        }
        return dp[idx][target] = false;
    }
    return dfs(0, target);
};
```

下面应该是最佳方案了

[01背包参考文章](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/%E8%83%8C%E5%8C%85%E7%90%86%E8%AE%BA%E5%9F%BA%E7%A1%8001%E8%83%8C%E5%8C%85-2.md)

[答案来源](https://pdai.tech/md/algorithm/alg-core-dynamic.html#%E5%88%92%E5%88%86%E6%95%B0%E7%BB%84%E4%B8%BA%E5%92%8C%E7%9B%B8%E7%AD%89%E7%9A%84%E4%B8%A4%E9%83%A8%E5%88%86)

从dp的结果来看，dp是在不断的把nums各个数累加的和设为true，其实到dp[W]=true就可以停止了

```js
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canPartition = function(nums) {
    if (nums.length === 1) return false;
    const sum = nums.reduce((x,y) => x + y, 0);
    if (sum % 2 !== 0) return false;
    const W = sum / 2;
    const dp = Array(W + 1).fill(false);
    dp[0] = true;
    for (let num of nums) {                 // 0-1 背包一个物品只能用一次
        for (let i = W; i >= num; i--) {   // 从后往前，先计算 dp[i] 再计算 dp[i-num]
            dp[i] = dp[i] || dp[i - num];
        }
    }
    return dp[W];
};

console.log(canPartition([9,1,2,4,10]));

/**
 * canPartition([1,2,5,10])
 * [true,  true,  true, true,  false, true, true,  true,  true, false]
 * 
 * canPartition([1,2,5,8])
 * [true,  true,  true, true,  false, true, true,  true]
 */



```



