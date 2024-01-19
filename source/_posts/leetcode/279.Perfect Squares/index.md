---
title: 279.Perfect Squares
tags: 
  - leetcode 
  - 动态规划 
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/perfect-squares/description/)

### 我的答案

挨个算出最小的组合，然后后面的组合可以由前面的组合拼起来，及`dq[i] = Math.min(dq[i], dq[j] + dq[i - j]);`

```js
/**
 * 1, 1, 1, dq[1]
 * 2, 1 + 1, 2, dq[1] + dq[1]
 * 3, 1 + 1 + 1, 3 dq[1] + dq[2]
 * 4, 4, 1
 * 5, 4 + 1, 2,
 * 6, 4 + 1 + 1, 3
 * 7, 4 + 1 + 1 + 1, 4
 * 8, 4 + 4, 2
 * 9, 9, 1
 * @param {number} n
 * @return {number}
 */
function numSquares(n) {
  const dq = Array.from({ length: n + 1 }).fill(Number.MAX_SAFE_INTEGER);
  for (let i = 1; i <= n; i++) {
    const sqrt = Math.sqrt(i);
    if (Math.floor(sqrt) === sqrt) {
      dq[i] = 1;
    } else {
      for (let j = 1; j <= i / 2; j++) {
        dq[i] = Math.min(dq[i], dq[j] + dq[i - j]);
      }
    }
  }

  return dq[n]
}
```

### 参考答案

只考虑平方数（1）和 `dp[ i - square ]` 的组合就够了

```js
var numSquares = function(n) {
    
    // Initialize with INT_MAX, except for dp[0] = 0 as base case
    let dp = new Array( n+1 ).fill( Number.MAX_SAFE_INTEGER );
        
    // Base case
    dp[0] = 0;
    

    let root = 1;
    let square = root * root;

    // for each square 1, 4, 9, 16, 25...
    while( square <= n ){

        //  update dp value for number from square to n
        for( let i = square ; i <= n ; i++ ){

            dp[ i ] = Math.min( dp[ i ], dp[ i - square ] + 1 );
        }

        // go to next square number
        root ++;
        square = root * root;
    }

    return dp[n];        
};
```

数学方法

```js
var numSquares = (n) => {
  //returns if the number x is a valid square root ( can be represented as the square of an integer)
  let isSquare = (x) => Math.floor(Math.sqrt(x)) ** 2 === x;

  if (isSquare(n)) return 1; // that would be the fact that its equal to itself

  // Legendre's three square theorem: A natural number n can be represented as
  // the sum of AT MOST three squares of integers if and only if : n!= 4^x ( 8*m+7)
  while (n % 4 === 0) n /= 4;
  //Try contradicting Legendre
  if (n % 8 === 7) return 4;

  // Manually checking for result 2, because Legendre states  AT MOST 3,
  // so 2 is possible aswell
  for (let i = 0; i <= n; i++)
    // if x=n-i*i   and x is a valid square then OBVIOUSLY
    // n=i^2 +sqrt(x)^2  ,so n is a square of two numbers
    if (isSquare(n - i * i)) return 2;

  // Legendre applies
  return 3;
};

```