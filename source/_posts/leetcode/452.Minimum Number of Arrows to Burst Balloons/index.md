---
title: 452.Minimum Number of Arrows to Burst Balloons
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/description/)

### 我的答案

和[435](https://leetcode.com/problems/non-overlapping-intervals/description/)同理，计算重叠点个数

```js
/**
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function(points) {
        if (!points.length) return 0;
        points.sort((x,y) => x[1] - y[1]);
        let num = 1;
        let min = points[0][1];
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] <= min) {
                continue;
            }
            num += 1;
            min = points[i][1];
        }

        return num;
    };

console.log(findMinArrowShots([[1,2],[2,3],[3,4],[4,5]]));
```