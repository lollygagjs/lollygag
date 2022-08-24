"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebars = exports.handleHandlebars = exports.registerPartials = exports.Handlebars = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const fs_1 = require("fs");
const glob_1 = __importDefault(require("glob"));
const handlebars_1 = __importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const __1 = require("..");
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
// Renders a registered partial
handlebars_1.default.registerHelper('partial', (path, context) => {
    let partial = handlebars_1.default.partials[path];
    if (typeof partial !== 'function')
        partial = handlebars_1.default.compile(partial);
    return new handlebars_1.default.SafeString(partial(context));
});
const registerPartials = (dir) => {
    glob_1.default.sync(`${dir}/*.hbs`).forEach((file) => {
        var _a;
        const name = ((_a = file.split('/').pop()) !== null && _a !== void 0 ? _a : file).split('.')[0];
        const partial = (0, fs_1.readFileSync)(file, 'utf8');
        handlebars_1.default.registerPartial(name, partial);
    });
};
exports.registerPartials = registerPartials;
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
        const { newExtname = '.html', targetExtnames = ['.hbs', '.html'], compileOptions, runtimeOptions, } = options !== null && options !== void 0 ? options : {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, exports.handleHandlebars)((_a = file.content) !== null && _a !== void 0 ? _a : '', { compileOptions, runtimeOptions }, Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file));
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.handlebars = handlebars;
exports.default = handlebars;
