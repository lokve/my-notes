---
title: 278.First Bad Version
tags:
  - leetcode
  - 二分法
categories:
  - leetcode
  - 二分法
---

## 题目

[地址](https://leetcode.com/problems/first-bad-version/description/)

### 我的答案

要注意`isBadVersion(mid)===true`的那个可能就是结果，所以`end = mid`

```js
/**
 * Definition for isBadVersion()
 * 
 * @param {integer} version number
 * @return {boolean} whether the version is bad
 * isBadVersion = function(version) {
 *     ...
 * };
 */

/**
 * @param {function} isBadVersion()
 * @return {function}
 */
var solution = function(isBadVersion) {
    /**
     * @param {integer} n Total versions
     * @return {integer} The first bad version
     */
    return function(n) {
        let begin = 1, end = n;

        while (begin < end) {
            let mid = Math.floor((begin + end)/2);
            if (isBadVersion(mid)) {
                end = mid ;
            } else {
                begin = mid + 1;
            }
        }

        return begin;
    };
};
```
