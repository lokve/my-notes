/**
 * @param {number[][]} grid
 * @return {number}
 */
var maxAreaOfIsland = function(grid) {
    const marked = {};
    const rst = [0];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (!marked[`${i}-${j}`] && grid[i][j] === 1) {
                marked[`${i}-${j}`] = true;
                rst.push(dfs(i-1, j) + dfs(i, j-1) + dfs(i+1, j) + dfs(i, j+1) + 1);
            }
        }
    }
    function dfs(i,j) {
        if (!marked[`${i}-${j}`] && grid[i] && grid[i][j] === 1) {
            marked[`${i}-${j}`] = true;
            return dfs(i-1, j) + dfs(i, j-1) + dfs(i+1, j) + dfs(i, j+1) + 1
        }

        return 0;
    }

    return Math.max(...rst);
};

console.log(maxAreaOfIsland([[0,0,0,0,0,0,0,0]]));
// console.log(maxAreaOfIsland([[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]));