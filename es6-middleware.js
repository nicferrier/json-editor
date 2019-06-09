/*
  Express Middleware to allow regular js files to be mapped into ES6
  modules on the fly.
 */

const fs = require("fs");
const acorn = require("acorn");
const escodegen = require("escodegen");
const path = require("path");

// Thanks to this: http://sevinf.github.io/blog/2012/09/29/esprima-tutorial/
async function traverse(node, func) {
    await func(node);//1
    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //4
                
                if (Array.isArray(child)) {
                    for (let node of child) {
                        await traverse(node, func);
                    }
                } else {
                    await traverse(child, func); //6
                }
            }
        }
    }
}

class NotFoundError extends Error {
    constructor(message = "", pathname = "", ...args) {
        super(message, ...args);
        this.pathname = pathname;
        if (message === undefined) {
            this.message = `${pathname} is not found`;
        }
    }
}

async function readEjsTemplate(filename, options = {}) {
    const {
        contextDir = process.cwd()
    } = options;
    const fullFilename = path.join(contextDir, filename);
    // console.log("full", fullFilename);
    const {dir} = path.parse(fullFilename);
    const text = await fs.promises.readFile(fullFilename);
    const tree = acorn.parse(text, {
        sourceType: "module"
    });

    const getPath = async function (target) {
        try {
            const targetPath = require.resolve(target);
            return targetPath;
        }
        catch (e) {
            const targetPath = path.resolve(dir, target);
            await fs.promises.access(targetPath);
            return targetPath;
        }
    }

    await traverse(tree, async node => {
        if (node.type === "ExpressionStatement"
            && node.expression.type === "CallExpression"
            && node.expression.callee.name === "require") {
            const target = node.expression.arguments[0].value;

            try {
                const targetPath = await getPath(target);
                const importText = await fs.promises.readFile(targetPath);
                const importTree = acorn.parse(importText);

                node.type = "BlockStatement";
                node.body = importTree.body;
            }
            catch (e) {
                throw new NotFoundError(undefined, target);
            }
        }
    });

    return escodegen.generate(tree);
}

module.exports = async function (req, res) {
    const reqPath = req.baseUrl;
    // console.log(reqPath);
    const text = await readEjsTemplate(reqPath);
    res.set("content-type", "application/javascript");
    res.send(text);
};


if (require.main === module) {
    readEjsTemplate(process.argv[2])
        .then(srcCode => {
            process.stdout.write(srcCode);
        })
        .catch(error => console.log(error));
}

// End

