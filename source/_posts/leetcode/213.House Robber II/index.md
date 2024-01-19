---
title: 213.House Robber II
tags:
  - leetcode
  - 动态规划
  - DP
categories:
  - leetcode
  - 动态规划
---


## 题目

[地址](https://leetcode.com/problems/house-robber-ii/)

### 我的答案

环形rob, 有两种可能，0肯定抢或不强，分别得出最大值

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    if (nums.length <= 2) return Math.max(...nums);
    const rst1 = [nums[0], nums[1]];

    rst1[1] = Math.max(rst1[0], rst1[1]);
    for (let i = 2; i < nums.length - 1;i++) {
        rst1[i] = Math.max(rst1[i - 1], rst1[i - 2] + nums[i])
    }

    const rst2 = [0 , nums[1], nums[2]];
    rst2[2] = Math.max(rst2[1], rst2[2]);
    for (let i = 3; i < nums.length;i++) {
        rst2[i] = Math.max(rst2[i - 1], rst2[i - 2] + nums[i])
    }

    return Math.max(rst2[rst2.length - 1], rst1[rst1.length - 1])
};
```

### 参考答案

其实也没啥，把相似功能提取出去了，改为用变量计算累加

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
   const len = nums.length;
    if (len < 4) return Math.max(...nums);
    
    return Math.max(robberHelper(nums, 0, len-1), robberHelper(nums, 1, len));
};

function robberHelper(nums, start, end) {
    let prev=0, beforePrev=0;
    for (let i=start;i<end;i++) {
        let tmp = prev;
        prev = Math.max(nums[i] + beforePrev, prev);
        beforePrev= tmp;
    }
    return prev;
}
```


