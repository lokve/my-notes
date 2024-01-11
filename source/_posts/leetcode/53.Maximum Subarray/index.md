---
title: 53.Maximum Subarray
tags: leetcode
categories:
  - leetcode
---

## 题目

[地址](https://leetcode.com/problems/maximum-subarray/description/)

### 我的答案

把从开始到结束的最大累加值记录下来，并找到最大的累加值就行

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let max = nums[0]

    for (let i = 1; i < nums.length; i++) {
        const sum = nums[i - 1] + nums[i];
        nums[i] = nums[i] > sum ? nums[i] : sum
        max = Math.max(max, nums[i]);
    }

    return max;
};
```