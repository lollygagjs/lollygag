"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebars = exports.handleHandlebars = exports.registerPartials = exports.Handlebars = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const glob_1 = require("glob");
const handlebars_1 = __importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const __1 = require("..");
const fs_1 = require("fs");
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
const registerPartials = (dir) => {
    glob_1.glob.sync(`${dir}/*.hbs`).forEach((file) => {
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
        var _a, _b, _c;
        if (!files)
            return;
        const { compileOptions, runtimeOptions } = options !== null && options !== void 0 ? options : {};
        const newExtname = (_a = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _a !== void 0 ? _a : '.html';
        const targetExtnames = (_b = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _b !== void 0 ? _b : ['.hbs', '.html'];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = (0, exports.handleHandlebars)((_c = file.content) !== null && _c !== void 0 ? _c : '', { compileOptions, runtimeOptions }, data);
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.handlebars = handlebars;
exports.default = handlebars;
