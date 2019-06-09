/*

  A JSON parser that retains the symbol location information.

  If you put a schema on top or something this will be able to tell
  you the line number of a schema error.

*/
function donovan (clarinet) {
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

            js() {
                const o = {};
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i].key;
                    const value = values[i];
                    o[key] = value.value.js();
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

            js() {
                const res = values.map(v => v.value.js());
                return res;
            }
        };
    }

    function v(value, line, col, pos) {
        return {
            value, line, col, pos,
            js() {
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
                console.log(
                    "whoops!", e, text,
                    line, column, position,
                    stack.map(v => v.js())
                );
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
                const last = stack[stack.length - 1];
                if (last !== undefined) {
                    last.addValue(obj, line, column, position);
                }
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

    return parseJson;
}

module.exports = donovan;

// End
