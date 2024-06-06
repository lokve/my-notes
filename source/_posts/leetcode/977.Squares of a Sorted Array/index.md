---
title: 704.Binary Search
tags: 
  - leetcode
  - 数组
categories:
  - leetcode
  - 数组
---

## 题目

[地址](https://leetcode.com/problems/squares-of-a-sorted-array/description/)

### 参考答案

原数组本来就是排好序的，但是有负数，所以平方后，最大值会分布在两端

```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortedSquares = function(nums) {
    let n = nums.length;
    let res = new Array(n).fill(0);
    let i = 0, j = n - 1, k = n - 1;
    while (i <= j) {
        let left = nums[i] * nums[i],
            right = nums[j] * nums[j];
        if (left < right) {
            res[k--] = right;
            j--;
        } else {
            res[k--] = left;
            i++;
        }
    }
    return res;
};
```
