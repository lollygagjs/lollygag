"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdown = exports.handleMarkdown = void 0;
const path_1 = require("path");
const markdown_it_1 = __importDefault(require("markdown-it"));
const __1 = require("../..");
const handleMarkdown = (content, options, data) => (0, markdown_it_1.default)(options !== null && options !== void 0 ? options : {}).render(content !== null && content !== void 0 ? content : '', data);
exports.handleMarkdown = handleMarkdown;
function markdown(options) {
    return function markdownWorker(files, lollygag) {
        var _a, _b, _c;
        if (!files)
            return;
        const { newExtname = '.html', targetExtnames = ['.md', '.html'], templatingHandler = (_a = lollygag._config.templatingHandler) !== null && _a !== void 0 ? _a : __1.handlebarsWorker.handleHandlebars, markdownOptions, templatingHandlerOptions, } = options !== null && options !== void 0 ? options : {};
        const mergedMarkdownOptions = Object.assign({ html: true }, markdownOptions);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = templatingHandler((_b = file.content) !== null && _b !== void 0 ? _b : '', templatingHandlerOptions, data);
            file.content = (0, exports.handleMarkdown)((_c = file.content) !== null && _c !== void 0 ? _c : '', mergedMarkdownOptions, data);
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.markdown = markdown;
exports.default = markdown;
