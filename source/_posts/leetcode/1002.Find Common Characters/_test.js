/**
 * @param {string[]} words
 * @return {string[]}
 */
var commonChars = function(words) {

    let obj = {};
    for (let i = 0; i < words[0].length; i++) {
        const char = words[0][i];
        if (obj[char]) {
            obj[char]++;
        } else {
            obj[char] = 1;
        }
    }

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const obj2 = {}
        let has = false;
        for (let j = 0; j < word.length; j++) {
            const char = word[j];

            if (obj[char]) {
                obj2[char] = (obj2[char] || 0) + 1;
                obj[char]--;
                has = true;
            }
        }

        if (!has) return [];

        obj = obj2;
    }

    const result = [];
    for (const key in obj) {
        const count = obj[key];
        for (let i = 0; i < count; i++) {
            result.push(key);
        }
    }
    return result;
};

console.log(commonChars(["cool","lock","cook"]));