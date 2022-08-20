"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdown = exports.handleMarkdown = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const markdown_it_1 = __importDefault(require("markdown-it"));
const __1 = require("..");
const handleMarkdown = (content, options, data) => { var _a; return (0, markdown_it_1.default)((_a = options) !== null && _a !== void 0 ? _a : {}).render(content !== null && content !== void 0 ? content : '', data); };
exports.handleMarkdown = handleMarkdown;
function markdown(options) {
    return function markdownWorker(files, lollygag) {
        var _a, _b, _c, _d, _e, _f;
        if (!files)
            return;
        const { templatingHandlerOptions } = options !== null && options !== void 0 ? options : {};
        const newExtname = (_a = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _a !== void 0 ? _a : '.html';
        const targetExtnames = (_b = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _b !== void 0 ? _b : ['.md', '.html'];
        const markdownOptions = Object.assign({ html: true }, options === null || options === void 0 ? void 0 : options.markdownOptions);
        const templatingHandler = (_d = (_c = options === null || options === void 0 ? void 0 : options.templatingHandler) !== null && _c !== void 0 ? _c : lollygag._config.templatingHandler) !== null && _d !== void 0 ? _d : __1.handleHandlebars;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = templatingHandler((_e = file.content) !== null && _e !== void 0 ? _e : '', templatingHandlerOptions, data);
            file.content = (0, exports.handleMarkdown)((_f = file.content) !== null && _f !== void 0 ? _f : '', markdownOptions, data);
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.markdown = markdown;
exports.default = markdown;
