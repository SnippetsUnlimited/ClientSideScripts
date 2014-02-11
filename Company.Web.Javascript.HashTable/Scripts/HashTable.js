;function HashTable() {

    var data = {}
    var keys = [];
    var values = [];
    var count = 0;

    var computeHash = function (value) {
        var hash = 0;
        if (value.length == 0) return hash;
        for (i = 0; i < value.length; i++) {
            char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    var removeFromArray = function (searchArray, item, parallelArray) {

        for (var i = 0; i < searchArray.length; i++) {
            if (item === keys[i]) {
                searchArray.splice(i, 1);
                parallelArray.splice(i, 1);
                break;
            }
        }
    }

    this.add = function (key, value) {

        if (typeof key != "string") {
            throw "keys can only be of type string.";
        }

        var internalKey = computeHash(key);
        var bucket = data[internalKey];
        if (containsKeyInternal(key, bucket)) {
            throw "key already exists.";
        }

        if (typeof bucket === "undefined") {
            data[internalKey] = {};
            data[internalKey][key] = value;
        }
        else {
            data[internalKey][key] = value;
        }
        keys.push(key);
        values.push(value);
        count++;
    }

    this.get = function (key) {
        var internalKey = computeHash(key);
        var bucket = data[internalKey];
        if (!containsKeyInternal(key, bucket)) {
            throw "Invalid key provided.";
        }
        return bucket[key];
    }

    this.getKeys = function () {
        return keys;
    }

    this.getValues = function () {
        return getValues;
    }

    this.clear = function () {
        data = {};
    }

    this.count = function () {
        return count;
    }

    this.isEmpty = function () {
        return (data === {})
    }

    this.remove = function (key) {
        var internalKey = computeHash(key);
        var bucket = data[internalKey];
        if (!containsKeyInternal(key, bucket)) {
            throw "Unknown key provided.";
        }
        delete bucket[key];
        if (Object.keys(bucket).length == 0) {
            delete data[internalKey];
        }
        removeFromArray(keys, key, values);
        count--;
    }

    this.hashCode = function (value) {
        return computeHash(value);
    }

    this.containsKey = function (key) {
        var internalKey = computeHash(key);
        var bucket = data[internalKey];
        return containsKeyInternal(key, bucket);
    }

    var containsKeyInternal = function (key, bucket) {
        return (typeof bucket != "undefined" && typeof bucket[key] != "undefined")
    }
}

