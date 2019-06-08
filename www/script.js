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
        }
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

    jsoneditor(jsonDoc, document.querySelector("#json"), {
        cssErrorClass: "error",
        check: function (object) {
            const valid = validate(object);
            console.log("check called:", valid);
            if (!valid) {
                console.log(
                    "schema errors",
                    ajv.errorsText(validate.errors, {allErrors: true })
                );
            }
        }
    });
});

// End

