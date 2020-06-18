const fs = require("fs")
const path = require("path")
const parseSFC = require("@vue/compiler-sfc")
const parseDOM = require("@vue/compiler-dom")

function readFileSync(path) {
    return fs.readFileSync(path, "utf-8")
}

function rewriteImport(content) {
    return content
        .replace(/import ['"]([^'"]+\.css)['"]/g,
            (_, s1) => `import "${s1}?import"`
        )
        .replace(/from ['"]((?!\.)[^'"]+)['"]/g,
            (_, s1) => `from "/@modules/${s1}"`
        )
}

function handleHTML(ctx) {
    ctx.type = "text/html"
    ctx.body = readFileSync('./index.html') +
        `<script>window.process = {env: {NODE_ENV: "development"}}</script>`
}

function handleJS(ctx, url) {
    ctx.type = "application/javascript"
    ctx.body = rewriteImport(readFileSync(url.slice(1)))
}

function handleModule(ctx, url) {
    ctx.type = "application/javascript"
    const moduleName = path.resolve("node_modules", url.replace("/@modules/", ""))
    const modulePath = require(path.resolve(moduleName, "package.json")).module
    ctx.body = rewriteImport(readFileSync(path.resolve(moduleName, modulePath)))
}

function handleCSS(ctx, url) {
    const style = readFileSync(url.split("?")[0].slice(1))

    if (url.endsWith("?import")) {
        ctx.type = "application/javascript"
        ctx.body = `const __style = document.createElement("style")
__style.innerHTML = \`${style}\`
document.body.appendChild(__style)`
    } else {
        ctx.type = "text/style"
        ctx.body = style
    }
}

function handleVue(ctx, url) {
    const {request} = ctx
    ctx.type = "application/javascript"

    const {descriptor} = parseSFC.parse(
        readFileSync(url.split("?")[0].slice(1))
    )
    if (!request.query.type) {
        const script = rewriteImport(descriptor.script.content)
            .replace("export default", "const __script = ")
            .trim()

        ctx.body = `${script}
import {render as __render} from "${url}?type=template"
__script.render = __render
export default __script`
    } else if (request.query.type === "template") {
        const {code} = parseDOM.compile(descriptor.template.content, {mode: "module"})
        ctx.body = rewriteImport(code)
    }
}


module.exports = {
    handleVue,
    handleHTML,
    handleCSS,
    handleModule,
    handleJS
}
