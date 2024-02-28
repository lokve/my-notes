var numIslands = function(grid) {
    let ans = 0, n = grid.length, m = grid[0].length;
    const trav = (i, j) => {
        if (i < 0 || j < 0 || i >= n || j >= m || grid[i][j] === '0') return 0
        grid[i][j] = '0'
        return 1 + trav(i-1, j) + trav(i, j-1) + trav(i+1, j) + trav(i, j+1)
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grid[i][j] === '1') {
                trav(i, j)
                ans += 1;
            }
        }
    }

    return ans;
};

console.log(numIslands([
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"]
]));
