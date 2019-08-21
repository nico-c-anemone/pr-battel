"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;
if (process.env.NODE_ENV !== "production") {
    webpack = require("webpack");
    webpackDevMiddleware = require("webpack-dev-middleware");
    webpackConfig = require("../../webpack.config");
    webpackHotMiddleware = require("webpack-hot-middleware");
}
const colyseus_1 = require("colyseus");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const monitor_1 = require("@colyseus/monitor");
const ArenaRoom_1 = require("./rooms/ArenaRoom");
exports.port = Number(process.env.PORT || 8080);
exports.endpoint = "localhost";
const app = express_1.default();
const gameServer = new colyseus_1.Server({ server: http_1.default.createServer(app) });
gameServer.register("arena", ArenaRoom_1.ArenaRoom);
if (process.env.NODE_ENV !== "production") {
    const webpackCompiler = webpack(webpackConfig({}));
    app.use(webpackDevMiddleware(webpackCompiler, {}));
    app.use(webpackHotMiddleware(webpackCompiler));
    // on development, use "../../" as static root
    exports.STATIC_DIR = path_1.default.resolve(__dirname, "..", "..");
}
else {
    // on production, use ./public as static root
    exports.STATIC_DIR = path_1.default.resolve(__dirname, "public");
}
app.use("/", express_1.default.static(exports.STATIC_DIR));
// add colyseus monitor
const auth = express_basic_auth_1.default({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor_1.monitor(gameServer));
gameServer.listen(exports.port);
console.log(`Listening on http://${exports.endpoint}:${exports.port}`);
