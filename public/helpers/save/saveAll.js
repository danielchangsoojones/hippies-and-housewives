var Parse = require("parse/node");

exports.save = function save(objects) {
    let flattenedArray = flatten(objects);
    return Parse.Object.saveAll(flattenedArray);
}

function flatten(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }
    return result;
}