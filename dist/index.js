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
    }, __meta = {
        year: new Date().getFullYear(),
    }, __in = 'files', __out = 'public', __files = [], __workers = []) {
        var _a;
        this.__config = __config;
        this.__meta = __meta;
        this.__in = __in;
        this.__out = __out;
        this.__files = __files;
        this.__workers = __workers;
        this.handleTemplating = (_a = this._config.templatingHandler) !== null && _a !== void 0 ? _a : general_1.handlebarsWorker.handleHandlebars;
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
    meta(meta) {
        this.__meta = Object.assign(Object.assign({}, this._meta), meta);
        return this;
    }
    get _meta() {
        return this.__meta;
    }
    in(dir) {
        this.__in = (0, path_1.join)(dir);
        return this;
    }
    get _in() {
        return this.__in;
    }
    out(dir) {
        this.__out = (0, path_1.join)(dir);
        return this;
    }
    get _out() {
        return this.__out;
    }
    files(files) {
        this.__files = files;
        return this;
    }
    get _files() {
        return this.__files;
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
