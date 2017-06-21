exports.createUniqueID = function createUniqueID(item) {
    //TODO: theoretically, we could create the same random ten digit number which would be bad because it is not techinically unique. However, this is highly unlikely and the goal is to use qr codes anyway and then we can just use the objectID
    item.set("uniqueID", createRandomID());
}

function createRandomID() {
    let length = 10;
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
}