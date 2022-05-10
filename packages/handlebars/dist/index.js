"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebars = exports.processHandlebars = exports.Handlebars = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const core_1 = require("@lollygag/core");
function processHandlebars(content, options, data) {
    return handlebars_1.default.compile(content, options === null || options === void 0 ? void 0 : options.compilerOptions)(data, options === null || options === void 0 ? void 0 : options.runtimeOptions);
}
exports.processHandlebars = processHandlebars;
function handlebars(options) {
    return function handlebarsWorker(files, lollygag) {
        if (!files)
            return;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetExtnames = [
                ...['.hbs', '.html'],
                ...((options === null || options === void 0 ? void 0 : options.targetExtnames) || []),
            ];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.html');
            }
            const data = Object.assign(Object.assign({}, lollygag._config), file);
            file.content = processHandlebars(file.content || '', options, data);
        }
    };
}
exports.handlebars = handlebars;
exports.default = handlebars;
