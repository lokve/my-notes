---
title: 153.Find Minimum in Rotated Sorted Array
tags:
  - leetcode
  - 二分法
categories:
  - leetcode
  - 二分法
---

## 题目

[地址](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/)

### 我的答案

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findMin = function(nums) {
    const len = nums.length;
    if (nums[0] < nums[len - 1]) {
        return nums[0];
    }

    let begin = 0, end = len - 1;

    while (begin < end) {
        let mid = Math.floor((begin + end) / 2);
        if (nums[mid] >= nums[0]) {
            begin = mid + 1;
        } else {
            end = mid;
        }
    }

    return nums[begin]
};

console.log(findMin([4,5,6,7,0,1,2]));
```
