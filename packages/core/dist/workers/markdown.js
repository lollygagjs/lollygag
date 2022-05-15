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
const handleMarkdown = (content, options, data) => (0, markdown_it_1.default)(options || {}).render(content || '', data);
exports.handleMarkdown = handleMarkdown;
function markdown(options) {
    return function markdownWorker(files, lollygag) {
        if (!files)
            return;
        const templatingHandler = (options === null || options === void 0 ? void 0 : options.templatingHandler)
            || lollygag._config.templatingHandler
            || __1.handleHandlebars;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetExtnames = (options === null || options === void 0 ? void 0 : options.targetExtnames) || ['.md', '.html'];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, __1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.html');
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = templatingHandler(file.content || '', options === null || options === void 0 ? void 0 : options.templatingHandlerOptions, data);
            const mdOptions = Object.assign({ html: true }, options === null || options === void 0 ? void 0 : options.markdownOptions);
            file.content = (0, exports.handleMarkdown)(file.content || '', mdOptions, data);
        }
    };
}
exports.markdown = markdown;
exports.default = markdown;
