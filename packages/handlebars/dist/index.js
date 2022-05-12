"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHandlebars = exports.Handlebars = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const core_1 = require("@lollygag/core");
handlebars_1.default.registerHelper('orDefault', (prop, defaultValue) => (prop ? prop : defaultValue));
const handleHandlebars = (content, options, data) => {
    const o = options;
    return handlebars_1.default.compile(content, o === null || o === void 0 ? void 0 : o.compileOptions)(data, o === null || o === void 0 ? void 0 : o.runtimeOptions);
};
exports.handleHandlebars = handleHandlebars;
function handlebars(options) {
    return function handlebarsWorker(files, lollygag) {
        if (!files)
            return;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetExtnames = (options === null || options === void 0 ? void 0 : options.targetExtnames) || ['.hbs', '.html'];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.html');
            }
            const data = Object.assign(Object.assign({}, lollygag._config), file);
            file.content = (0, exports.handleHandlebars)(file.content || '', options, data);
        }
    };
}
exports.default = handlebars;
