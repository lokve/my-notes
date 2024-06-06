---
title: 704.Binary Search
tags: 
  - leetcode
  - 数组
  - 二分查找
categories:
  - leetcode
  - 数组
---

## 题目

[地址](https://leetcode.com/problems/binary-search/description/)

### AI的答案

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        let mid = Math.floor((l + r) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
};

console.log(search([-1,0,3,5,9,12], 3));
```
