---
title: 69.Sqrt(x)
tags:
  - leetcode
  - 二分法
categories:
  - leetcode
  - 二分法
---

## 题目

[地址](https://leetcode.com/problems/sqrtx/description/)

### 我的答案

用数学[笔算开方](https://liam.page/2016/03/19/manually-solving-the-square-root/)，刚学的，记录一下，说明没有学错

```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  let rst = "";
  const strx = x + "";
  let pre = "";

  let start = 0;
  let end = strx.length % 2 === 0 ? 2 : 1;

  while (end <= strx.length) {
    const s = strx.slice(start, end);
    let n = 1;
    const num = +(pre + s);

    let rest;
    if (start === 0) {
      while (n * n <= num) {
        n++;
      }
      n--;
      rest = n * n;
    } else {
      while ((20 * rst + n) * n <= num) {
        n++;
      }
        n--;
      rest = (20 * rst + n) * n;
    }

    rst += n;
    pre = num - rest;

    start = end;
    end = end + 2;
  }

  return +rst;
};

console.log(mySqrt(15144));
```

穷举法

```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
    let n = 1;
    while (n * n <= x) {
        n++
    }
    return n - 1;
};

```

```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
    let n =  Math.ceil(x/2);
    let half = Math.ceil(n/2);
    while (!(n * n <= x && (n+1)*(n+1) > x)) {
        if (n * n < x) {
            n += half;
        } else {
            n -= half;
        }
        half = Math.ceil(half/2);
    }
    return n;
};

console.log(mySqrt(15129));

```

### 参考答案

二分法

```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
    var beg = 0, end = x, ans = 0;
    
    while(beg <= end) {
        var mid = Math.floor((beg + end)/2);
        
        if(mid*mid > x) {
            end = mid - 1;
        } else { // mid*mid <= x
            ans = mid;
            beg = mid + 1;
        }
    }
    return ans;
};
```