/*
    This provides an ES6 JSON editor.

    jsonDoc is a native javascript JSONable object, such as a data
    object or an array.

    editorHTMLElement is an HTML element that will contain the
    editable JSON; this function will do the work of filling it in.
 
    options is a bunch of other things to change the behaviour:

      cssErrorClass - a string defining the error class to use for errors

          `jsoneditor({a:1}, article, { cssErrorClass: "syntax-error" });`

        would set the css-error-class to `.syntax-error`.

        By default the error class is `json-editor-syntax-error` so to
        see errors you have to provide that style.
 */

import jsonparser from "./jsonparser.mjs";

const debug = false;

const checkErrors = function (jsonDoc, editorHTMLElement, errorPanel, options = {}) {
    const {
        cssErrorClass = "json-editor-syntax-error",
        check = function (object) {
            return true;
        }
    } = options;

    try {
        Array.from(document.querySelectorAll("#json ." + cssErrorClass))
            .forEach(e => e.classList.remove(cssErrorClass));
        errorPanel.textContent = "";

        const txt = Array.from(editorHTMLElement.children)
              .map(e => e.textContent)
              .join("\n");
        if (debug) console.log("jsoneditor: the txt is >", txt);
        
        const jsonDoc = jsonparser(txt);
        if (debug) console.log("jsoneditor: the doc is >", JSON.stringify(jsonDoc, null, 2));

        const updated = jsonDoc.valueOf();
        if (debug) console.log("jsoneditor: the updated is >", JSON.stringify(updated, null, 2));

        if (check(jsonDoc)) {
            const event = new CustomEvent("json-valid", {json: updated});
            editorHTMLElement.dispatchEvent(event);
        }
    }
    catch (e) {
        try {
            if (e instanceof SyntaxError) {
                const {message, line, column, validationMessage } = e;
                const lineElements = Array.from(editorHTMLElement.children);
                if (line !== undefined) {
                    lineElements[line].classList.add(cssErrorClass);
                }

                if (validationMessage !== undefined) {
                    if (line !== undefined) {
                        lineElements[line].setAttribute("title", e.validationMessage);
                    }
                    errorPanel.textContent = "schema validation: " + e.validationMessage;
                }
            }
        }
        catch (err) {
            console.log("error in error handling", err);
        }
    }
};

function jsoneditor(jsonDoc, editorHTMLElement, options = {}) {
    const {
        cssErrorClass = "json-editor-syntax-error",
        check = function (object) {
            return true;
        }
    } = options;

    const editorDiv = editorHTMLElement.appendChild(document.createElement("div"));
    editorDiv.classList.add("jsoneditor__textPanel");
    const editorErrorPanel = editorHTMLElement.appendChild(document.createElement("div"));
    editorErrorPanel.classList.add("jsoneditor__errorPanel");

    editorHTMLElement.setAttribute(
        "style", ";"
    );
    document.body.appendChild(document.createElement("style")).textContent = `
#json .jsoneditor__textPanel {
  font-family: monospace; 
  white-space: pre;
}
#json .jsoneditor__errorPanel {
  font-family: monospace; 
  background-color: black;
  padding: 5px;
  height: 30px;
  font-size:18px;
  color: #f35689;
}
#json .error {
    background-color: #f35689;
}
`;
    setTimeout(_ => editorDiv.focus(), 0); // 0 is fine, has to be in the next event loop

    const regex = new RegExp("(.*)at line ([0-9]+) column ([0-9]+) of the JSON data$");
    const text = JSON.stringify(jsonDoc, null, 2);
    const textArray = text.split("\n");

    textArray.forEach(line => {
        editorDiv.appendChild(document.createElement("div")).textContent = line;
    });

    editorDiv.setAttribute("contenteditable", "true");
    editorDiv.addEventListener("input", async inputEvt => {
        checkErrors(jsonDoc, editorDiv, editorErrorPanel, options);
    });

    checkErrors(jsonDoc, editorDiv, editorErrorPanel, options);

    return editorHTMLElement;
}

export default jsoneditor;

// End
