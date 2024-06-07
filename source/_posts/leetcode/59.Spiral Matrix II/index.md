---
title: 51.N-Queens
tags:
    - leetcode
    - 数组
categories:
    - leetcode
    - 数组
---

## 题目

[地址](https://leetcode.com/problems/spiral-matrix-ii/)

### 我的答案

```js
/**
 * @param {number} n
 * @return {number[][]}
 */
var generateMatrix = function (n) {
    const matrix = new Array(n).fill(0).map(() => new Array(n).fill(0));
    let num = 1;
    let i = 0;
    let j = 0;
    const direction = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];
    let dirtIndex = 0;
    while (num <= n * n) {
        matrix[i][j] = num;
        num++;
        let [di, dj] = direction[dirtIndex];
        if (!matrix[i + di] || matrix[i + di][j + dj] === undefined || matrix[i + di][j + dj] !== 0) {
            dirtIndex = (dirtIndex + 1) % 4;
            [di, dj] = direction[dirtIndex];
        }

        i += di;
        j += dj;
    }

    return matrix;
};

console.log(generateMatrix(4));

```

### 参考答案

速度比上面的快

```js

var generateMatrix = function(n) {
    let startX = startY = 0;   // 起始位置
    let loop = Math.floor(n/2);   // 旋转圈数
    let mid = Math.floor(n/2);    // 中间位置
    let offset = 1;    // 控制每一层填充元素个数
    let count = 1;     // 更新填充数字
    let res = new Array(n).fill(0).map(() => new Array(n).fill(0));

    while (loop--) {
        let row = startX, col = startY;
        // 上行从左到右（左闭右开）
        for (; col < n - offset; col++) {
            res[row][col] = count++;
        }
        // 右列从上到下（左闭右开）
        for (; row < n - offset; row++) {
            res[row][col] = count++;
        }
        // 下行从右到左（左闭右开）
        for (; col > startY; col--) {
            res[row][col] = count++;
        }
        // 左列做下到上（左闭右开）
        for (; row > startX; row--) {
            res[row][col] = count++;
        }

        // 更新起始位置
        startX++;
        startY++;

        // 更新offset
        offset += 1;
    }
    // 如果n为奇数的话，需要单独给矩阵最中间的位置赋值
    if (n % 2 === 1) {
        res[mid][mid] = count;
    }
    return res;
};

  

```
