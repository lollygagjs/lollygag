"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.handler = void 0;
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
const __1 = require("../..");
// Return content as is
handlebars_1.default.registerHelper('raw', (any) => any.fn());
handlebars_1.default.registerHelper('asIs', (any) => any.fn());
// Uppercase string
handlebars_1.default.registerHelper('uc', (str) => str.toUpperCase());
// Lowercase string
handlebars_1.default.registerHelper('lc', (str) => str.toLowerCase());
// Capitalize first word of a string
handlebars_1.default.registerHelper('cap', (word) => word.charAt(0).toUpperCase() + word.substring(1));
// Capitalize all words in a string
handlebars_1.default.registerHelper('capWords', (words) => words.map((word) => word.charAt(0).toUpperCase() + word.substring(1)));
// Return prop if it `exists`, `defaultValue` otherwise
handlebars_1.default.registerHelper('orDefault', (prop, defaultValue) => (prop ? prop : defaultValue));
const handler = (content, options, data) => {
    var _a;
    const { compileOptions, runtimeOptions } = (_a = options) !== null && _a !== void 0 ? _a : {};
    return handlebars_1.default.compile(content, compileOptions)(data, runtimeOptions);
};
exports.handler = handler;
function worker(options) {
    return function handlebarsWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        const { newExtname = '.html', targetExtnames = ['.hbs', '.html'], compileOptions, runtimeOptions, } = options !== null && options !== void 0 ? options : {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, exports.handler)((_a = file.content) !== null && _a !== void 0 ? _a : '', { compileOptions, runtimeOptions }, Object.assign(Object.assign(Object.assign({}, lollygag._sitemeta), lollygag._config), file));
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.worker = worker;
exports.default = worker;
