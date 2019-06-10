import jsoneditor from "./jsoneditor.js";

window.addEventListener("load", loadEvt => {
    const schema = {
        "$id": "https://ferrier.me.uk/jsoneditor-test.schema.json",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "JSON Editor Test",
        "type": "object",
        "properties": {
            "title": {
                "type": "string"
            },
            "description": {
                "type": "string"
            },
            "list": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "additionalProperties": false
    };

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(schema);

    const jsonDoc = {
        title: "blah dee blah",
        description: "ho hum",
        llst: [
            "one",
            "two"
        ]
    };

    class SchemaValidationError extends Error {
        constructor(message) {
            super(message);
        }
    }

    jsoneditor(jsonDoc, document.querySelector("#json"), {
        cssErrorClass: "error",
        check: function (object) {
            const typedObject = JSON.parse(JSON.stringify(object));
            const valid = validate(typedObject);
            if (!valid) {
                console.log("script> ajv errors:", validate.errors, object);
                const errorList = validate.errors.map(({
                    keyword, message, dataPath, params
                }) => {
                    if (keyword === "type") {
                        const objPath = dataPath.split(".").slice(1);
                        const lookupResult = objPath.reduce((a,c) => {
                            return a[c];
                        }, object);
                        return {
                            line: lookupResult.sourceLineNumber,
                            col: lookupResult.sourceColNumber,
                            message
                        };
                    }
                    else if (keyword === "additionalProperties") {
                        const additionalPath = params.additionalProperty;
                        const objPath = additionalPath.split(".").slice(1);
                        const lookupResult = objPath.reduce((a,c) => {
                            return a[c];
                        }, object);
                        return {
                            line: lookupResult.sourceLineNumber,
                            col: lookupResult.sourceColNumber,
                            message
                        };
                    }
                });
                const err = new SchemaValidationError("validation error");
                err.validationErrors = errorList;
                throw err;
            }
        }
    });
});

// End

