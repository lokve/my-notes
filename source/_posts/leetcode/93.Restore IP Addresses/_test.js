/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function(s) {
    const rst = [];
    function dfs(str, res) {
        if (res.length === 4 && !str.length) {
            rst.push(res.join('.'));
            return;
        }
        for (let i = 1; i <= Math.min(str.length, 3); i++) {
            const numStr = str.slice(0, i);
            const num = +numStr;
            if (numStr && num >= 0 && num <= 255 && num.toString().length === numStr.length && res.length < 4) {
                dfs(str.slice(i), res.concat(numStr))
            }
        }
    }

    dfs(s, [])

    return rst;
};

console.log(restoreIpAddresses('25525511135'));
console.log(restoreIpAddresses('0000'));
console.log(restoreIpAddresses('101023'));