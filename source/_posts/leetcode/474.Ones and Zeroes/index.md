---
title: 474.Ones and Zeroes
tags: 
  - leetcode 
  - 动态规划 
  - DP
  - 01背包
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/ones-and-zeroes/description/)

### 我的答案

01背包

```js
/**
 * @param {string[]} strs
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var findMaxForm = function (strs, m, n) {
  const dp = Array.from({ length: m + 1 }).map(() =>
    Array.from({ length: n + 1 }).fill(0)
  );

  for (let str of strs) {
      let _m = 0;
      let _n = 0;
      for (let s of str) {
          if (s === "0") {
              _m += 1;
          } else {
              _n += 1;
          }
      }

      for (let i = m; i >= _m; i--) {
          for (let j = n; j >= _n; j--) {
              dp[i][j] = Math.max(dp[i-_m][j-_n] + 1, dp[i][j]);
          }
      }
  }

  return dp[m][n];
};

console.log(findMaxForm(["10", "0001", "111001", "1", "0"], 5, 3));

```

### 参考答案

速度很快！！

```js
var findMaxForm = function(S, M, N) {
    let dp = Array.from({length:M+1},() => new Uint8Array(N+1))
    for (let i = 0; i < S.length; i++) {
        let str = S[i], zeros = 0, ones = 0
        for (let j = 0; j < str.length; j++)
            str.charAt(j) === "0" ? zeros++ : ones++
        for (let j = M; j >= zeros; j--)
            for (let k = N; k >= ones; k--)
                dp[j][k] = Math.max(dp[j][k], dp[j-zeros][k-ones] + 1)
    }
    return dp[M][N]
};
```