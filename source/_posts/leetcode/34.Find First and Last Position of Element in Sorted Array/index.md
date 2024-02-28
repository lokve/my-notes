---
title: 34.Find First and Last Position of Element in Sorted Array
tags:
  - leetcode
  - 二分法
categories:
  - leetcode
  - 二分法
---

## 题目

[地址](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/)

### 我的答案

先找到位置，然后找边界，但是有O(n)

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
    let begin = 0, end = nums.length - 1;

    while (begin < end) {
        const mid = Math.floor((begin + end) / 2);

        if (nums[mid] < target) {
            begin = mid + 1;
        } else {
            end = mid
        }
    }

    if (nums[begin] !== target) {
        return [-1, -1];
    }

    end = begin + 1;
    begin = begin - 1;

    while (nums[end] === target || nums[begin] === target) {
        if (nums[end] === target) {
            end++
        }

        if (nums[begin] === target) {
            begin--
        }
    }

    return [begin + 1, end - 1]
};

console.log(searchRange([5,7,7,8,8,8,8,10], 8));
```

分别找两个边界

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
    let begin = 0, end = nums.length - 1;

    while (begin < end) {
        const mid = Math.floor((begin + end) / 2);

        if (nums[mid] < target) {
            begin = mid + 1;
        } else {
            end = mid
        }
    }

    if (nums[begin] !== target) {
        return [-1, -1];
    }

    const first = begin;

    begin = 0, end = nums.length - 1;

    while (begin < end) {
        const mid = Math.floor((begin + end) / 2);

        if (target >= nums[mid]) {
            begin = mid + 1;
        } else {
            end = mid - 1;
        }
    }

    if (nums[begin] !== target) {
        begin -= 1;
    }


    return [first, begin]
};
```


### 参考答案

通过 isSearchingLeft 判断找哪个方向的边界

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
    const binarySearch = (nums, target, isSearchingLeft) => {
        let left = 0;
        let right = nums.length - 1;
        let idx = -1;
      
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (nums[mid] > target) {
                right = mid - 1;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                idx = mid;
                if (isSearchingLeft) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }
        }
      
        return idx;
    };
    
    const left = binarySearch(nums, target, true);
    const right = binarySearch(nums, target, false);
    
    return [left, right];    
};
```
