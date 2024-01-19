/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function (s) {
  if (!s) return 0;
  const dq = [];
  const len = s.length;

  for (let i = 0; i < len; i++) {
      if (i === 0) {
        if (s[i] === '0') {
          return 0
        }
        dq[i] = 1;
      } else {
        const str = s.slice(i-1,i+1);
        if (s[i] === '0') {
          if (+s[i-1] > 2 || +s[i-1] === 0) {
            return 0
          } else {
            dq[i] = i === 1 ? dq[i-1] : dq[i-2]
          }
        } else {
          if (s[i-1] === '0' || +str > 26) {
            dq[i] = dq[i-1]
          } else {
            dq[i] = i === 1 ? dq[i-1] + 1 : dq[i-2] + dq[i-1]
          }
        }
      }
  }
  return dq[len - 1];
};

console.log(numDecodings("12"));
console.log(numDecodings("226"));
console.log(numDecodings("06"));
console.log(numDecodings("10"));
console.log(numDecodings("2101"));
console.log(numDecodings("18011"));
console.log(numDecodings("27"));
console.log(numDecodings("1123"));
console.log(numDecodings("1201234"));
