---
title: 455.Assign Cookies
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/assign-cookies/description/)

### 我的答案

先排序，在比较

```js
/**
 * @param {number[]} g
 * @param {number[]} s
 * @return {number}
 */
var findContentChildren = function(g, s) {
    g.sort((x,y) => x - y);
    s.sort((x,y) => x - y);

    let i = 0;
    let j = 0;
    let num = 0;

    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) {
            i++;
            num++;
        }
        j++;
    }

    return num;
};

console.log(findContentChildren([1,4,3], [1,2,3]));
```