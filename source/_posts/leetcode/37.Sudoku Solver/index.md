---
title: 37.Sudoku Solver
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
  - 回溯
---

## 题目

[地址](https://leetcode.com/problems/sudoku-solver/description/)

### 我的答案

记录每一行、每一列、每一个块中数字是否出现过，然后遍历空格，尝试填入1-9，如果填入的数字合法，则递归调用dfs，如果dfs返回true，则说明填入的数字合法，继续填下一个空格，如果dfs返回false，则说明填入的数字不合法，则尝试下一个数字，如果尝试完9个数字都失败，则说明整个数独不合法，返回false。

```js
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
var solveSudoku = function (board) {
    const row = new Array(9).fill(0).map(() => new Array(9).fill(false));
    const col = new Array(9).fill(0).map(() => new Array(9).fill(false));
    const block = new Array(3)
        .fill(0)
        .map(() => new Array(3).fill(0).map(() => new Array(9).fill(false)));

    const empty = [];

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== '.') {
                const num = board[i][j] - '0';
                row[i][num - 1] = true;
                col[j][num - 1] = true;
                block[Math.floor(i / 3)][Math.floor(j / 3)][num - 1] = true;
            } else {
                empty.push([i, j]);
            }
        }
    }

    function dfs(index) {
        if (index === empty.length) {
            return true;
        }
        const [i, j] = empty[index];

        const rest = [];
        for (let k = 0; k < 9; k++) {
            if (!row[i][k] && !col[j][k] && !block[Math.floor(i / 3)][Math.floor(j / 3)][k]) {
                rest.push(k);
            }
        }
        if (rest.length === 0) {
            return false;
        }

        for (let num of rest) {
            board[i][j] = num + 1 + '';
            row[i][num] = true;
            col[j][num] = true;
            block[Math.floor(i / 3)][Math.floor(j / 3)][num] = true;
            if (dfs(index + 1)) {
                return true;
            }
            board[i][j] = '.';
            row[i][num] = false;
            col[j][num] = false;
            block[Math.floor(i / 3)][Math.floor(j / 3)][num] = false;
        }
    }

    dfs(0);

    return board;
};

console.log(
    solveSudoku([
        ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
        ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
        ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
        ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
        ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
        ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
        ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
        ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
        ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
    ])
);

```

### 参考答案

更省空间

```js
function solveSudoku(board) {
  const n = board.length;
  dfs(board, n);
}

function dfs(board, n) {
  // for every cell in the sudoku
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      // if its empty
      if (board[row][col] !== '.') continue;
      // try every number 1-9
      for (let i = 1; i <= 9; i++) {
        const c = i.toString();
        // if that number is valid
        if (isValid(board, row, col, n, c)) {
          board[row][col] = c;
          // continue search for that board, ret true if solution is reached
          if (dfs(board, n)) return true;
        }
      }
      // solution wasnt found for any num 1-9 here, must be a dead end...
      // set the current cell back to empty
      board[row][col] = '.';
      // ret false to signal dead end 
      return false;
    }
  }
  // all cells filled, must be a solution
  return true;
}

function isValid(board, row, col, n, c) {
  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < n; i++) {
    if (board[row][i] === c || board[i][col] === c) return false;
    const curRow = blockRow +  Math.floor(i / 3);
    const curCol = blockCol +  Math.floor(i % 3);
    if (board[curRow][curCol] === c) return false;
  }
  return true;
}
```
