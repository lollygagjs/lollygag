"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const fs_1 = require("fs");
const __1 = require("..");
function templates(options) {
    return function templatesWorker(files, lollygag) {
        var _a, _b, _c, _d, _e, _f;
        if (!files)
            return;
        const { templatingHandlerOptions } = options !== null && options !== void 0 ? options : {};
        const newExtname = (_a = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _a !== void 0 ? _a : '.html';
        const targetExtnames = (_b = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _b !== void 0 ? _b : ['.hbs', '.html'];
        const templatesDirectory = (_c = options === null || options === void 0 ? void 0 : options.templatesDirectory) !== null && _c !== void 0 ? _c : 'templates';
        const defaultTemplate = (_d = options === null || options === void 0 ? void 0 : options.defaultTemplate) !== null && _d !== void 0 ? _d : 'index.hbs';
        const templatingHandler = (_f = (_e = options === null || options === void 0 ? void 0 : options.templatingHandler) !== null && _e !== void 0 ? _e : lollygag._config.templatingHandler) !== null && _f !== void 0 ? _f : __1.handleHandlebars;
        let template = '';
        let templatePath = (0, path_1.join)(templatesDirectory, defaultTemplate);
        if ((0, fs_1.existsSync)(templatePath)) {
            template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
        }
        else {
            // get built-in template
            template = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, 'templates/index.hbs'), {
                encoding: 'utf-8',
            });
            console.log(`NOTICE: File '${templatePath}' not found. Using built-in template as default.`);
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if (file.template && file.template !== defaultTemplate) {
                templatePath = (0, path_1.join)(templatesDirectory, file.template);
                if ((0, fs_1.existsSync)(templatePath)) {
                    template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
                }
                else {
                    console.log(`NOTICE: File '${templatePath}' missing. Using default template.`);
                }
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = templatingHandler(template, templatingHandlerOptions, data);
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.templates = templates;
exports.default = templates;
