"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebars = exports.handleHandlebars = exports.Handlebars = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const __1 = require("..");
// Return content as is
handlebars_1.default.registerHelper('raw', (any) => any.fn());
handlebars_1.default.registerHelper('asIs', (any) => any.fn());
// Capitalize first word of a string
handlebars_1.default.registerHelper('cap', (word) => word.charAt(0).toUpperCase() + word.substring(1));
// Capitalize all words in a string
handlebars_1.default.registerHelper('capWords', (words) => words.map((word) => word.charAt(0).toUpperCase() + word.substring(1)));
// Return prop if it `exists`, `defaultValue` otherwise
handlebars_1.default.registerHelper('orDefault', (prop, defaultValue) => (prop ? prop : defaultValue));
const handleHandlebars = (content, options, data) => {
    var _a;
    const { compileOptions, runtimeOptions } = (_a = options) !== null && _a !== void 0 ? _a : {};
    return handlebars_1.default.compile(content, compileOptions)(data, runtimeOptions);
};
exports.handleHandlebars = handleHandlebars;
function handlebars(options) {
    return function handlebarsWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const { targetExtnames, newExtname, compileOptions, runtimeOptions } = options !== null && options !== void 0 ? options : {};
            if (!(targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.hbs', '.html']).includes((0, path_1.extname)(file.path))) {
                continue;
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = (0, exports.handleHandlebars)((_a = file.content) !== null && _a !== void 0 ? _a : '', { compileOptions, runtimeOptions }, data);
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname !== null && newExtname !== void 0 ? newExtname : '.html');
            }
        }
    };
}
exports.handlebars = handlebars;
exports.default = handlebars;
