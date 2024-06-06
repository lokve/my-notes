---
title: 209.Minimum Size Subarray Sum
tags: 
  - leetcode
  - 数组
categories:
  - leetcode
  - 数组
---

## 题目

[地址](https://leetcode.com/problems/minimum-size-subarray-sum/description/)

### 我的答案

在时间上勉强通过

```js
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
        let rst = Infinity;
        for (let i = 0; i < nums.length; i++) {
            let sum = 0;
            for (let j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum >= target) {
                    rst = Math.min(rst, j - i + 1);
                    break;
                }
            }
            if (sum < target) {
                break;
            }
        }

        return rst === Infinity ? 0 : rst;
    };

console.log(minSubArrayLen(7, [2,3,1,2,4,3]));
```

### 参考答案

滑动窗口


```js
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    let rst = Infinity;
    let i = 0;
    let j = 0;
    let sum = 0;

    while (j < nums.length) {
        sum += nums[j];

        while (sum >= target) {
            rst = Math.min(rst, j - i + 1);
            sum -= nums[i];
            i++;
        }
        j++;
    }

    return rst === Infinity ? 0 : rst;
};
```