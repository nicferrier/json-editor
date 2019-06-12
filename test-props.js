/*

  This is just to prove that our method for overriding Object.keys is
  working ok.

  The problem is that Object.keys does not use the objects that are
  actual keys on a source object so if you had properties on them
  (like a source line and column number from a parser) they disappear.

  So this shows how to override Object.keys providing the key values
  from the origin object.

  This technique is then used in donovan.js - our JSON parser based on
  the Clarinet SAX-like JSON parser to allow us to deliver a parser
  that provides the source line number and column as a property on the
  keys.

*/

const assert = require("assert");

// console.log won't work in anything you're overriding Object.keys so
// we collect debug in this list
debug = [];

// A store of objects by their key - keys must be JSON.stringify-able
const myObjects = (function () {
    const keyVals = [];
    return {
        set: function (key, value) {
            keyVals.push([JSON.stringify(key), value]);
        },

        get: function (key) {
            const findKey = JSON.stringify(key);
            const found = keyVals.filter(
                ([storedKey, value]) => storedKey === findKey
            );
            // debug.push([key, JSON.stringify(found)]);
            if (found !== undefined && found.length > 0) {
                const result = found[0];
                debug.push(["result", findKey, result]);
                return result;
            }
            return undefined;
        }
    };
})();

// The Object.keys override based on the above myObjects
const superKeys = Object.keys;
Object.keys = function (object) {
    const got = myObjects.get(object);
    if (myObjects.get(object) !== undefined) {
        const [objKey, relatedObject] = myObjects.get(object);
        return relatedObject.keySet.map(keyObj => {
            const {key,line} = keyObj;
            const keyStr = new String(key);
            keyStr.line = line;
            return keyStr;
        });
    }
    return superKeys(object);
};

// A thing that provides objects where the keys have to have
// properties that persist in Object.keys
const makeit = function () {
    const keys = [];
    const vals = [];

    const This = function () {
        this.keySet = keys;
        this.valSet = vals;
    };

    const myThis = new This();

    return {
        addKey: function(key, line) {
            keys.push({
                key, line
            });
        },

        addValue: function(value, line) {
            vals.push({
                value, line
            });
        },

        js: function () {
            const o = {};
            for (let i = 0; i < keys.length; i++) {
                const key = new String(keys[i].key);
                key.line = keys[i].line;
                const val = new String(vals[i].value);
                val.line = vals[i].line;
                o[key] = val;
            }
            myObjects.set(o, myThis);
            return o;
        }
    }
}

// Make one of those objects to play with
const o = makeit();
o.addKey("a", 10);
o.addValue("meh", 11);
const obj = o.js();

// Now some asserts
assert.ok(obj["a"] !== undefined);
assert.ok(obj["a"] == "meh");

const keyVals = Object.keys(obj);
assert.ok(keyVals.length > 0);
assert.ok(keyVals[0] == "a");

// End
