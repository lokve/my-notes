---
title: 376.Wiggle Subsequence
tags:
  - leetcode
  - 动态规划
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/wiggle-subsequence/description/)

### 我的答案

先找出差，0不要，最后比较差的正负情况

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var wiggleMaxLength = function(nums) {
    if (nums.length === 1) return 1;
    const diffs = []
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] - nums[i-1] !== 0) {
            diffs.push(nums[i] - nums[i-1])
        }
    }
    if (!diffs.length) return 1;
    let num = 2;
    let last = diffs[0]
    for (let i = 1; i < diffs.length; i++) {
        if (last < 0 && diffs[i] > 0 || last > 0 && diffs[i] < 0) {
            num += 1;
            last = diffs[i];
        }
    }

    return num;
};

console.log(wiggleMaxLength([1,17,5,10,13,15,10,5,16,8]));
console.log(wiggleMaxLength([1,2,3,4,5,6,7,8,9]));
```

### 参考答案

```js
function wiggleMaxLength(nums) {
    if (nums == null || nums.length == 0) {
        return 0;
    }
    let up = 1, down = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i - 1]) {
            up = down + 1;
        } else if (nums[i] < nums[i - 1]) {
            down = up + 1;
        }
    }
    return Math.max(up, down);
}
```

DP

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var wiggleMaxLength = function(nums) {
    const len = nums.length;
    // [[DEC, INC]]
    const dp = Array.from({length: len}, () => {
        return new Array(2).fill(1);
    });
    
    let max = 1;
    
    for(let i = 0; i < len; i++) {
        for(let j = i; j >= 0; j--) {
            if(nums[i] == nums[j]) continue;
            
            if(nums[i] > nums[j]) {
                dp[i][1] = Math.max(dp[j][0] + 1, dp[i][1]);
            }
            else {
                dp[i][0] = Math.max(dp[j][1] + 1, dp[i][0]);
            }
            
            max = Math.max(max, ...dp[i]);
        }
    }
    
    // console.log(dp);
    return max;
};
```