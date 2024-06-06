---
title: 51.N-Queens
tags:
    - leetcode
    - DFS
categories:
    - leetcode
    - DFS
    - 回溯
---

## 题目

[地址](https://leetcode.com/problems/n-queens/)

### AI的答案

对每一个位置都进行判断是否可下，当行走完的时候，输出结果
这里判断条件可以优化，从上往下只要判断点位上方就够了

```js
/**
 * @param {number} n
 * @return {string[][]}
 */
var solveNQueens = function (n) {
    const board = Array(n)
        .fill(0)
        .map(() => Array(n).fill('.'));
    const res = [];
    backtrack(board, 0, res);
    return res;
};

function backtrack(board, row, res) {
    if (row === board.length) {
        res.push(board.map(row => row.join('')));
        return;
    }
    for (let i = 0; i < board.length; i++) {
        if (isQueenSafe(board, row, i)) {
            board[row][i] = 'Q';
            backtrack(board, row + 1, res);
            board[row][i] = '.';
        }
    }
}

function isQueenSafe(board, row, col) {
    for (let i = 0; i < board.length; i++) {
        if (board[row][i] === 'Q') {
            return false;
        }
        if (board[i][col] === 'Q') {
            return false;
        }
        if (row - i >= 0 && col - i >= 0 && board[row - i][col - i] === 'Q') {
            return false;
        }
        if (row - i >= 0 && col + i < board.length && board[row - i][col + i] === 'Q') {
            return false;
        }
        if (row + i < board.length && col - i >= 0 && board[row + i][col - i] === 'Q') {
            return false;
        }
        if (row + i < board.length && col + i < board.length && board[row + i][col + i] === 'Q') {
            return false;
        }
    }
    return true;
}

console.log(solveNQueens(4));
```

### 参考答案

因Queen是横竖斜线不能共线，所以每一行只有一个Q(board只需要一维数组即可)，每一列的位置不能重复(bc === c)，不在左下斜线(bc === c + r - br)，不在右下斜线(bc === c - r + br)

```js
var solveNQueens = function (n) {
    const res = [];
    backtrack(res, n);
    return res;
};

function backtrack(res, n, board = [], r = 0) {
    if (r === n) {
        res.push(board.map(c => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
        return;
    }
    for (let c = 0; c < n; c++) {
        if (!board.some((bc, br) => bc === c || bc === c + r - br || bc === c - r + br)) {
            board.push(c);
            backtrack(res, n, board, r + 1);
            board.pop();
        }
    }
}
```
