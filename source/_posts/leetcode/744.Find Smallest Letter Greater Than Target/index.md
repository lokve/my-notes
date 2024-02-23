---
title: 744.Find Smallest Letter Greater Than Target
tags:
  - leetcode
  - 二分法
categories:
  - leetcode
  - 二分法
---

## 题目

[地址](https://leetcode.com/problems/find-smallest-letter-greater-than-target/description/)

### 我的答案

二分法

```js
/**
 * @param {character[]} letters
 * @param {character} target
 * @return {character}
 */
var nextGreatestLetter = function(letters, target) {
    if (target < letters[0] || target >= letters[letters.length - 1]) {
        return letters[0];
    }

    let beg = 0;
    let end = letters.length-1;

    while (beg <= end) {
        let mid = Math.floor((beg + end) / 2);
        if (letters[mid] <= target) {
            beg = mid + 1;
        } else {
            end = mid - 1
        }
    }

    return  letters[beg];
};

console.log(nextGreatestLetter(['c', 'f', 'j'], 'e' ));
```
