---
title: 605.Can Place Flowers
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/can-place-flowers/description/)

### 我的答案

判断前后是否是1

```js
/**
 * @param {number[]} flowerbed
 * @param {number} n
 * @return {boolean}
 */
var canPlaceFlowers = function(flowerbed, n) {
    if (n === 0) return true;
    for (let i = 0; i < flowerbed.length; i++) {
      if (flowerbed[i] === 0 && !flowerbed[i+1] && !flowerbed[i-1]) {
          flowerbed[i] = 1;
          n--;
      }
      
      if (n === 0) return true;
    }
    
    return false;
};

console.log(canPlaceFlowers([1,0,0,0,1], 2));
```