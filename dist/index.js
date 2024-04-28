"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const path_1 = require("path");
const chalk_1 = require("chalk");
const general_1 = require("./utils/general");
const build_1 = __importDefault(require("./utils/build"));
__exportStar(require("./utils/general"), exports);
class Lollygag {
    constructor(__config = {
        generator: 'Lollygag',
        prettyUrls: true,
        generateTimestamp: true,
    }, __sitemeta = {
        year: new Date().getFullYear(),
    }, __contentDir = 'content', __staticDir = 'static', __outputDir = 'public', __workers = []) {
        var _a;
        this.__config = __config;
        this.__sitemeta = __sitemeta;
        this.__contentDir = __contentDir;
        this.__staticDir = __staticDir;
        this.__outputDir = __outputDir;
        this.__workers = __workers;
        this.handleTemplating = (_a = this._config.templatingHandler) !== null && _a !== void 0 ? _a : general_1.handlebars.handler;
        this.build = (options) => build_1.default.call(this, options);
        (0, console_1.log)('Hello from Lollygag!');
    }
    config(config) {
        const c = config;
        // add leading and remove trailing slash
        if (c.subdir)
            c.subdir = (0, path_1.join)('/', c.subdir).replace(/\/$/, '');
        this.__config = Object.assign(Object.assign({}, this._config), { subdir: c.subdir });
        return this;
    }
    get _config() {
        return this.__config;
    }
    sitemeta(sitemeta) {
        this.__sitemeta = Object.assign(Object.assign({}, this._sitemeta), sitemeta);
        return this;
    }
    get _sitemeta() {
        return this.__sitemeta;
    }
    contentDir(dir) {
        this.__contentDir = (0, path_1.join)(dir);
        return this;
    }
    get _contentDir() {
        return this.__contentDir;
    }
    staticDir(dir) {
        this.__staticDir = (0, path_1.join)(dir);
        return this;
    }
    get _staticDir() {
        return this.__staticDir;
    }
    outputDir(dir) {
        this.__outputDir = (0, path_1.join)(dir);
        return this;
    }
    get _outputDir() {
        return this.__outputDir;
    }
    do(worker) {
        this.__workers.push(worker);
        return this;
    }
    get _workers() {
        return this.__workers;
    }
}
exports.default = Lollygag;
process.on('unhandledRejection', (err) => {
    (0, console_1.log)((0, chalk_1.red)('Build failed...'));
    (0, console_1.error)(err);
    process.exit(43);
});
