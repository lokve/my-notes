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

solve([
  ["X", "X", "X", "X"],
  ["X", "O", "O", "X"],
  ["X", "X", "O", "X"],
  ["X", "O", "X", "X"],
]);

solve([
  ["O", "O", "O"],
  ["O", "O", "O"],
  ["O", "O", "O"],
]);
solve([
  ["O", "O", "O", "O", "X", "X"],
  ["O", "O", "O", "O", "O", "O"],
  ["O", "X", "O", "X", "O", "O"],
  ["O", "X", "O", "O", "X", "O"],
  ["O", "X", "O", "X", "O", "O"],
  ["O", "X", "O", "O", "O", "O"],
]);
