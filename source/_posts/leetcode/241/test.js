
/**
 * @param {string} input
 * @return {number[]}
 */
var diffWaysToCompute = function(input) {
    let res = [];
    for (let i = 0; i < input.length; i++) {
        if (isNaN(input[i])) {
            let left = diffWaysToCompute(input.slice(0, i));
            let right = diffWaysToCompute(input.slice(i+1));
            for (let l of left) {
                for (let r of right) {
                    l = Number(l);
                    r = Number(r);

                    if (input[i]=='+') {
                        res.push(l + r);
                    } else if (input[i]=='-') {
                        res.push(l - r);
                    } else {
                        res.push(l * r);
                    }

                }
            }
        }
    }

    if (res.length!=0) return res;
    return [input];
};


diffWaysToCompute('20-10')