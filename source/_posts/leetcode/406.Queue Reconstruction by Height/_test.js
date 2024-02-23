/**
 * @param {number[][]} people
 * @return {number[][]}
 */
var reconstructQueue = function(people) {
    let res = []
    people.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : b[0] - a[0])
    console.log(people);
    people.forEach(val => {
        res.splice(val[1], 0, val)
    })
    return res
};

console.log(reconstructQueue([[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]));
// console.log(reconstructQueue([[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]));