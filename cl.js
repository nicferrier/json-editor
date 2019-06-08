const clarinet = require("clarinet");
const assert = require("assert");

function o() {
    const values = [];
    const keys = [];
    return {
        addValue(value, line, col, pos) {
            values.push({
                value, line, col, pos
            });
        },

        addKey(key, line, col, pos) {
            keys.push({
                key, line, col, pos
            });
        },

        dump() {
            return [keys, values];
        },

        literal() {
            const o = {};
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i].key;
                const value = values[i];
                o[key] = value.value.literal();
            }
            return o;
        }
    };
}

function a(line, col, pos) {
    // const [l,c,p] = [line,col,pos];
    const values = [];
    return {
        type: "array",
        addValue(value, l, c, p) {
            values.push({
                value, line:l, col:c, pos:p
            });
        },

        literal() {
            const res = values.map(v => v.value.literal());
            return res;
        }
    };
}

function v(value, line, col, pos) {
    return {
        value, line, col, pos,
        literal() {
            return value;
        }
    };
}

async function parseJson(text) {
    const result = await new Promise((resolve, reject) => {
        const parser = clarinet.parser();
        const stack = [];
        const deepStack = [];

        parser.onerror = function (e) {
            const {line, column, position} = parser;
            const err = new SyntaxError(
                `at line ${line} column ${column} of the JSON data`
            );
            parser.error = err;
            parser.close();  // rejects from the close handler
        };

        parser.onvalue = function (value) {
            const {line, column, position} = parser;
            const last = stack[stack.length - 1];
            if (last === undefined) {
                const err = new SyntaxError(
                    `at line ${line} column ${column} of the JSON data`
                );
                parser.error = err;
                parser.close(); // rejects from the close handler
            }
            const val = v(value, line, column, position);
            last.addValue(val, line, column, position);
            // console.log("value", value);
        };

        parser.onopenobject = function (key) {
            const {line, column, position} = parser;
            const obj = o();
            stack.push(obj);
            obj.addKey(key, line, column, position);
            // console.log("open {");
        };

        parser.onkey = function (key) {
            const {line, column, position} = parser;
            const last = stack[stack.length - 1];
            last.addKey(key, line, column, position);
            // console.log("key", key);
        };

        parser.oncloseobject = function () {
            deepStack.push(stack.pop());
            // console.log("close }");
        };

        parser.onopenarray = function () {
            const {line, column, position} = parser;
            const arr = a(line, column, position);
            const last = stack[stack.length - 1];
            if (last !== undefined) {
                last.addValue(arr, line, column, position);
            }
            stack.push(arr);
            // console.log("open [");
        };

        parser.onclosearray = function () {
            deepStack.push(stack.pop());
            // console.log("close ]");
        };

        parser.onend = function () {
            if (parser.error) {
                reject(parser.error);
            }
            const result = deepStack[deepStack.length - 1];
            resolve(result);
        };

        parser.write(text).close();
    }).catch(e => { return {error:e}; });
    return result;
}

// Some tests
async function tests() {
    const data1 = {
        "title": ["blah dee blah"],
        "description": "ho hum",
        "llst": [
            "one",
            "two"
        ],
        "anotherkey": "10"
    };
    const text1 = JSON.stringify(data1);
    const result1 = await parseJson(text1);
    assert.deepStrictEqual(data1, result1.literal());

    const text2 = `{
        "title" ["blah dee blah"],
        "description": "ho hum",
        "llst": [
            "one",
            "two"
        ],
        "anotherkey": "10"
    }`;
    const result2 = await parseJson(text2)
          .catch(e => { return {error:e} });

    // console.log(result2.error.message);
    
    assert(result2.error.message.startsWith("at line 2"));

    const text3 = `{
        "title": ["blah dee blah"],
        "description": "ho hum"
        "llst": [
            "one",
            "two"
        ],
        "anotherkey": "10"
    }`;
    const result3 = await parseJson(text3)
          .catch(e => { return {error:e} });
    assert(result3.error.message.startsWith("at line 4")); // the trailing comma

    /*
    const text4 = `[
            "one",
            "two",
            { "object": "value" }
        ]`;
    const result4 = await parseJson(text4)
          .catch(e => { return {error:e} });
    console.log(result4.literal());
*/
}

tests()
    .catch(e => {
        console.log("tests failed with exception>", e);
        process.exit(1);
    });

// End
