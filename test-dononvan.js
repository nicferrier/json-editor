const assert = require("assert");
const parseJson = require("./donovan.js");

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
    assert.deepStrictEqual(data1, result1.js());

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

    const data4 = [
        "one",
        "two",
        { "object": "value" }
    ];
    const text4 = JSON.stringify(data4);
    const result4 = await parseJson(text4)
          .catch(e => { return {error:e} });
    assert.deepStrictEqual(result4.js(), data4);
}

tests()
    .catch(e => {
        console.log("tests failed with exception>", e);
        process.exit(1);
    });

// End

