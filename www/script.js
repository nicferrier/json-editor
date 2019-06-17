import jsoneditor from "./jsoneditor.mjs";

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

    const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    const validate = ajv.compile(schema);

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
            console.log("check called with", object);
            /*
            const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
            const validate = ajv.compile(schema);
            const valid = validate(typedObject);
            validate.errors = [];
            const err = new SchemaValidationError("validation error");
            err.validationErrors = errorList;
            throw err;
            */
        }
    });
});

// End

