---
title: 406.Queue Reconstruction by Height
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/queue-reconstruction-by-height/description/)

### 我的答案

先排列people，然后比较数值和大小插入

```js
/**
 * @param {number[][]} people
 * @return {number[][]}
 */
var reconstructQueue = function (people) {
  // people 先按people[n][1]从小到大排序，再按people[n][0]从大到小排序
  people.sort((x, y) => (x[1] === y[1] ? y[0] - x[0] : x[1] - y[1]));

  const queue = [people[0]];

  for (let i = 1; i < people.length; i++) {
    const p = people[i];
    let num = 0;
    for (let j = 0; j < queue.length; j++) {
      const q = queue[j];
      // 数量吻合，插入数据
      if (p[1] === num && p[0] <= q[0]) {
        queue.splice(j, 0, p);
        break;
      } else if (p[0] <= q[0]) {
          // 只有<=才增加num
        num++;
      }
      if (j === queue.length - 1) {
        queue.push(p);
        break;
      }
    }
  }

  return queue;
};
```

### 参考答案

`people[n][1]` 在一定程度上已经代表了他在重组数组中的位置，所以不需要一项项比较

```js
/**
 * @param {number[][]} people
 * @return {number[][]}
 */
var reconstructQueue = function(people) {
    let res = []
    people.sort((a, b) => a[0] == b[0] ? a[1] - b[1] : b[0] - a[0])
    people.forEach(val => {
        res.splice(val[1], 0, val)
    })
    return res
};
```
