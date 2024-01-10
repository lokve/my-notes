---
title: 198.House Robber
tags: leetcode
categories:
  - leetcode
date: 2024-1-9 14:00
---

## 题目

[地址](https://leetcode.com/problems/house-robber/description/)

### 我的答案

从第三个开始，最大总和S[n] = max(S[n-1], S[n-2] + nums[n]),在下面把每一次的最大总和记录到 nums 里面了

![img.png](img.png)

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    if (nums.length <= 2) return Math.max(...nums);

    nums[1] = Math.max(nums[0], nums[1]);
    for (let i = 2; i < nums.length;i++) {
        nums[i] = Math.max(nums[i - 1], nums[i - 2] + nums[i])
    }

    return nums[nums.length - 1]
};

```
