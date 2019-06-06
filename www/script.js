window.addEventListener("load", loadEvt => {
    const jsonDoc = {
        title: "blah dee blah",
        description: "ho hum",
        llst: [
            "one",
            "two"
        ]
    };

    const editor = document.querySelector("#json");
    const text = JSON.stringify(jsonDoc, null, 2);
    const textArray = text.split("\n");
    textArray.forEach(line => {
        editor.appendChild(document.createElement("div")).textContent = line;
    });
    editor.setAttribute("contenteditable", "true");
    editor.addEventListener("input", inputEvt => {
        try {
            Array.from(document.querySelectorAll("#json .error"))
                .forEach(e => e.classList.remove("error"));
            const txt = editor.textContent;
            const updated = JSON.parse(txt);
        }
        catch (e) {
            const [_, preamble, line, column] = new RegExp("(.*) at line ([0-9]+) column ([0-9]+) of the JSON data$").exec(e.message);
            const lineElements = Array.from(editor.children);
            const txt = lineElements.reduce((a,c) => a + "\n" + c.textContent, "").slice(1);
            const lines = txt.split("\n");
            let count = 0;
            let i = 0;
            for (i = 0; i<lines.length; i++) {
                count = count + lines[i].length;
                if (count > column) {
                    break;
                }
            }
            lineElements[i].classList.add("error");

        }
    });
});
