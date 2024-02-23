/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isSubsequence = function(s, t) {
    if (s === t) return true;
    let n = 0;
    for (let i = 0; i < t.length; i ++) {
        if (t[i] === s[n]) {
            n++
        }

        if (n === s.length) {
            return true;
        }
    }
    return false;
};


