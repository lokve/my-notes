---
title: 435.Non-overlapping Intervals
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/non-overlapping-intervals/description/)

### 我的答案

先排序，然后看是否重合，选择的区间结尾越小，留给后面的区间的空间越大，那么后面能够选择的区间个数也就越大

```js
/**
 * @param {number[][]} intervals
 * @return {number}
 */
var eraseOverlapIntervals = function(intervals) {
    intervals.sort((x,y) => x[1] - y[1]);
    let num = 0;
    let max = intervals[0][1];
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < max) {
            num += 1;
        } else {
            max = intervals[i][1];
        }
    }

    return num;
};

```