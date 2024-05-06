---
title: 130.Surrounded Regions
tags:
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/surrounded-regions/description/)

### 我的答案

先判断区块是否符合，再进行替换，但是性能差

```js
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
var solve = function (board) {
  const m = board.length;
  const n = board[0].length;
  const marked = {};

  function judge(i, j) {
    if (!marked[`${i}-${j}`] && i >= 0 && i <= m - 1 && j >= 0 && j <= n - 1) {
      marked[`${i}-${j}`] = true;
      if (board[i][j] === "O") {
        const b1 = judge(i - 1, j);
        const b2 = judge(i + 1, j);
        const b3 = judge(i, j - 1);
        const b4 = judge(i, j + 1);
        const b5 = i === 0 || i === m - 1 || j === 0 || j === n - 1;
        return b1 && b2 && b3 && b4 && !b5;
      }
    }
    return true;
  }

  function replace(i, j) {
    if (i >= 0 && i <= m - 1 && j >= 0 && j <= n - 1 && board[i][j] === "O") {
      board[i][j] = "X";
      replace(i - 1, j);
      replace(i + 1, j);
      replace(i, j - 1);
      replace(i, j + 1);
    }
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (!marked[`${i}-${j}`] && board[i][j] === "O") {
        const yes = judge(i, j);
        if (yes) {
          replace(i, j);
        }
      }
    }
  }

  console.log(board);
};
```

### 参考答案

把不需要替换的'O'标出来，剩下的就都是'X'了

```js
var solve = function(board) {
    if(board.length ==0) return null 
    
    for(var i=0;i<board.length;i++){
        for(var j=0;j<board[0].length;j++){
            if(board[i][j] == 'O' && (i==0 || i==board.length-1 || j==0 || j==board[0].length-1)){
                  dfs(board,i,j)
               }
        }
    }
    
    for(var i=0;i<board.length;i++){
        for(var j=0;j<board[0].length;j++){
            if(board[i][j]=='W'){
                  board[i][j]='O'
               }
            else {
                    board[i][j]='X'
                    }
        }
    }
    
    return board
};

  function dfs(board,i,j){
      if(i<0 || j<0 || i>=board.length || j >=board[0].length || board[i][j]=='X' || board[i][j]=='W'){
            return 
         }
      board[i][j]='W';
      dfs(board,i+1,j)
      dfs(board,i-1,j)
      dfs(board,i,j+1)
      dfs(board,i,j-1)
      return 
  }
```