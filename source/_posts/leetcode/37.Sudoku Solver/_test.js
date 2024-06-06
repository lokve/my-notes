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
