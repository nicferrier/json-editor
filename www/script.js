import jsoneditor from "./jsoneditor.mjs";

window.addEventListener("load", loadEvt => {
    const schema = {
        "$id": "https://ferrier.me.uk/jsoneditor-test.schema.json",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "JSON Editor Test",
        "type": "object",
        "required": [
            "title",
            "description",
            "list"
        ],
        "additionalProperties": false,
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
    };

    const jsonDoc = {
        description: "ho hum",
        list: [
            "one",
            "two"
        ],
        title: "ha!"
    };

    const ajv = new Ajv()

    class SchemaValidationError extends SyntaxError {
        constructor(message) {
            super(message);
        }
    }

    jsoneditor(jsonDoc, document.querySelector("#json"), {
        cssErrorClass: "error",

        check: function (jsonDoc) {
            const obj = jsonDoc.valueOf();

            const validate = ajv.compile(schema);
            const valid = validate(obj);
            console.log("check says>", obj, valid);
            if (!valid) {
                console.log("check's first error", validate.errors);
                const firstError = validate.errors[0];

                const err = new SchemaValidationError("validation error");
                if (firstError.keyword === "additionalProperties") {
                    const keyPath = firstError.params.additionalProperty;
                    const keys = keyPath.split(".");
                    const lastKey = keys[0]; /// totally fake for now
                    const keyPointer = jsonDoc.getKey(lastKey);
                    err.line = keyPointer.line;
                    err.column = keyPointer.column;
                    err.validationMessage = firstError.message;
                }
                else if (firstError.keyword === "type") {
                    const pathArr = firstError.dataPath.split(".");
                    let doc = jsonDoc;
                    for (let key of pathArr) {
                        if (key === "") continue;
                        doc = doc.get(key);
                    }
                    err.line = doc.line;
                    err.column = doc.column;
                    err.validationMessage = firstError.schemaPath + " " + firstError.message;
                }
                else if (firstError.keyword === "required") {
                    err.validationMessage = firstError.message;
                }
                validate.errors = [];

                console.log("throwing schema validation error", err, err.line, err.column);
                throw err;
            }

        }
    });
});

// End

