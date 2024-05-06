/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function (board, word) {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (dfs(i, j, 0, {})) {
                return true;
            }
        }
    }

    function dfs(i, j, index, record) {
        if (index === word.length) {
            return true;
        }
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] !== word[index] || record[`${i}${j}`]) {
            return false;
        }
        record[`${i}${j}`] = true;

        if (dfs(i - 1, j, index + 1, record) ||
            dfs(i + 1, j, index + 1, record) ||
            dfs(i, j - 1, index + 1, record) ||
            dfs(i, j + 1, index + 1, record)) {
            return true
        }

        // record[`${i}${j}`] = false;

        return false;
    }

    return false;
};

console.log(
    exist(
        [["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"]],
        "AAAAAAAAAAAAAAB"
    )
);

console.log(
    exist(
        [
            ['a', 'b'],
            ['c', 'd'],
        ],
        'cdba'
    )
);
