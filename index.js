const path = require("node:path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "js", "db.json"));
const middlewares = jsonServer.defaults({ static: __dirname });

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(router);

const port = Number(process.env.PORT) || 3000;
server.listen(port, "0.0.0.0", () => {
    console.log(`Farming Mtaani is available on port ${port}`);
});