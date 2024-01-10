---
title: 62.Unique Paths
math: true
tags: leetcode
categories:
  - leetcode
---

## 题目

[地址](https://leetcode.com/problems/unique-paths/description/)

### 我的答案

次数 `arr[i][j]` = `arr[i][j - 1]` + `arr[i - 1][j]`

```js
/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var uniquePaths = function(m, n) {
    const arr = [];

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (!arr[i]) {
                arr[i] = []
            }
            if (i === 0) {
                arr[i][j] = 1;
            }
            if (j === 0) {
                arr[i][j] = 1;
            }
            if (i > 0 && j > 0) {
                arr[i][j] = arr[i][j - 1] + arr[i - 1][j]
            }
        }
    }

    return arr[m-1][n-1]
};

```

### 参考答案

是数学！！！

$$\begin {array}{c}
C(n,k)=\frac {n!}{(n-k)!*k!}
\end {array}$$

机器人总共移动的次数 S=m+n-2，向下移动的次数 D=m-1，那么问题可以看成从 S 从取出 D 个位置的组合数量，这个问题的解为 C(S, D)。

```js
/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var uniquePaths = function(m, n) {
    let S = m + n - 2;  // 总共的移动次数
    let D = m - 1;      // 向下的移动次数
    let ret = 1;
    /**
     *  C(8,3) = (6*7*8)/(1*2*3)
     *  C(6,4) = (3*4*5*6)/(1*2*3*4)
     */
    for (let i = 1; i <= D; i++) {
        ret = ret * (S - D + i) / i;
        // 或
        // rst = rst * (S - i + 1) / i
    }
    return ret;
};
```