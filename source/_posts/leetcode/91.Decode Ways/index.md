---
title: 91.Decode Ways
tags:
  - leetcode
  - 动态规划
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/decode-ways/description/)

### 我的答案

尝试了这么多例子才出，已经搞懵了

这个题目本质是[爬楼梯](https://leetcode.com/problems/climbing-stairs/description/)，但是要考虑`0`和`>26`的情况

- 当 `s[i] === 0` 的时候，如果和前一个字母组成的数 `>26` 或者 `=0`，整个结果就是0了；不然他们只能是一个整体，所以`dp[i] = dp[i-2]`
- 当 `s[i-1] === 0` 时，他和前一个字母只能是一个整体，所以 `dp[i] = dp[i-1]`
- 其他的时候就符合爬楼梯，`dp[i] = dp[i-2] + dp[i-1]`
- 另外，`i=1` 的时候需要额外处理或者事先处理

```js
/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function (s) {
  if (!s) return 0;
  const dp = [];
  const len = s.length;

  for (let i = 0; i < len; i++) {
      if (i === 0) {
        if (s[i] === '0') {
          return 0
        }
        dp[i] = 1;
      } else {
        const str = s.slice(i-1,i+1);
        if (s[i] === '0') {
          if (+s[i-1] > 2 || +s[i-1] === 0) {
            return 0
          } else {
            dp[i] = i === 1 ? dp[i-1] : dp[i-2]
          }
        } else {
          if (s[i-1] === '0' || +str > 26) {
            dp[i] = dp[i-1]
          } else {
            dp[i] = i === 1 ? dp[i-1] + 1 : dp[i-2] + dp[i-1]
          }
        }
      }
  }
  return dp[len - 1];
};

console.log(numDecodings("12"));
console.log(numDecodings("226"));
console.log(numDecodings("06"));
console.log(numDecodings("10"));
console.log(numDecodings("2101"));
console.log(numDecodings("18011"));
console.log(numDecodings("27"));
console.log(numDecodings("1123"));
console.log(numDecodings("1201234"));

```

### 参考答案

判断更加的简化了

```js
var numDecodings = function(s) {
    if (!s || s[0] === '0') {
        return 0;
    }

    const n = s.length;
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;

    for (let i = 2; i <= n; ++i) {
        const oneDigit = parseInt(s[i - 1]);
        const twoDigits = parseInt(s.substring(i - 2, i));

        if (oneDigit !== 0) {
            dp[i] += dp[i - 1];
        }

        if (10 <= twoDigits && twoDigits <= 26) {
            dp[i] += dp[i - 2];
        }
    }

    return dp[n];
};
```
