const {
    handleCSS, handleHTML, handleModule, handleJS, handleVue
} = require("./handler");

const Koa = require("koa")
const app = new Koa();

const handler = async ctx => {
    const {request: {url}} = ctx
    if (url === '/') {
        handleHTML(ctx)
    } else if (url.endsWith(".js")) {
        handleJS(ctx, url)
    } else if (url.startsWith("/@modules/")) {
        handleModule(ctx, url)
    } else if (url.indexOf(".css") > -1) {
        handleCSS(ctx, url)
    } else if (url.indexOf(".vue") > -1) {
        handleVue(ctx, url)
    }
}

app.use(handler)

app.listen(3000, () => {})


