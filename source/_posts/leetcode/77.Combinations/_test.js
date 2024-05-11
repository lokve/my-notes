/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {

    const arr = Array.from({length: n}).map((_, i) => i + 1);
    const res = [];
    const dfs = (arr, path, start) => {
        if (path.length === k) {
            res.push([...path]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            dfs(arr, path, i + 1);
            path.pop();
        }
    }
    dfs(arr, [], 0);
    return res;
};

console.log(combine(5, 3));