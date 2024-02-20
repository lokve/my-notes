/**
 * @param {number[]} g
 * @param {number[]} s
 * @return {number}
 */
var findContentChildren = function(g, s) {
    g.sort((x,y) => x - y);
    s.sort((x,y) => x - y);

    let i = 0;
    let j = 0;
    let num = 0;

    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) {
            i++;
            num++;
        }
        j++;
    }

    return num;
};

console.log(findContentChildren([1,4,3], [1,2,3]));