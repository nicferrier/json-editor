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

// these imports rely on special middleware in cl.js to make them work
import * as donovanModule from "/www/donovan.ejs";
import * as clarinetModule from "/www/clarinet.ejs";

const parseJson = donovanModule.default.exports(clarinetModule.default);

/*
  This does NOT produce a simple object, more it is the meta object.

  Call .js() on it to get the actual object.
 */
const JSONparse = async function (data) {
    const result = await parseJson(data);
    if (result.error !== undefined) {
        throw result.error;
    }
    return result.js();
};

function jsoneditor(jsonDoc, editorHTMLElement, options = {}) {
    const {
        cssErrorClass = "json-editor-syntax-error",
        check = function (object) {
            return true;
        }
    } = options;

    editorHTMLElement.setAttribute(
        "style", "font-family: monospace; white-space: pre;"
    );
    setTimeout(_ => editorHTMLElement.focus(), 0); // 0 is fine, has to be in the next event loop

    const regex = new RegExp("(.*)at line ([0-9]+) column ([0-9]+) of the JSON data$");
    const text = JSON.stringify(jsonDoc, null, 2);
    const textArray = text.split("\n");

    textArray.forEach(line => {
        editorHTMLElement.appendChild(document.createElement("div")).textContent = line;
    });

    editorHTMLElement.setAttribute("contenteditable", "true");
    editorHTMLElement.addEventListener("input", async inputEvt => {
        try {
            Array.from(document.querySelectorAll("#json ." + cssErrorClass))
                .forEach(e => e.classList.remove(cssErrorClass));
            const txt = editorHTMLElement.textContent;
            const updated = await JSONparse(txt);
            if (check(updated)) {
                const event = new CustomEvent("json-valid", {json: updated});
                editorHTMLElement.dispatchEvent(event);
            }
        }
        catch (e) {
            try {
                if (e instanceof SyntaxError) {
                    const [_, preamble, line, column] = regex.exec(e.message);
                    const lineElements = Array.from(editorHTMLElement.children);
                    const txt = lineElements.reduce((a,c) => a + "\n" + c.textContent, "").slice(1);
                    const lines = txt.split("\n");
                    let count = 0;
                    let i = 0;
                    for (i = 0; i<lines.length; i++) {
                        count = count + lines[i].length;
                        // console.log({i, lines, count, line, column});
                        if (count > column) {
                            break;
                        }
                    }
                    lineElements[i].classList.add(cssErrorClass);
                }
                else {
                    if (e.validationErrors !== undefined) {
                        const lineElements = Array.from(editorHTMLElement.children);
                        const txt = lineElements.reduce((a,c) => a + "\n" + c.textContent, "").slice(1);
                        const lines = txt.split("\n");
                        e.validationErrors.forEach(({line, col, message}) => {
                            let count = 0;
                            let i = 0;
                            for (i = 0; i<lines.length; i++) {
                                count = count + lines[i].length;
                                // console.log({i, lines, count, line, column});
                                if (count > col) {
                                    break;
                                }
                            }
                            const errorLine = lineElements[i];
                            if (errorLine !== undefined) {
                                errorLine.classList.add(cssErrorClass);
                            }
                        });
                    }
                }
            }
            catch (errErr) {
                console.log("error in error handling", errErr);
            }
        }
    });

    return editorHTMLElement;
}

export default jsoneditor;

// End
