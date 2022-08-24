"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const fs_1 = require("fs");
const core_1 = require("@lollygag/core");
function templates(options) {
    return function templatesWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        const { newExtname = '.html', targetExtnames = ['.hbs', '.html'], templatesDirectory = 'templates', defaultTemplate = 'index.hbs', templatingHandler = (_a = lollygag._config.templatingHandler) !== null && _a !== void 0 ? _a : core_1.handleHandlebars, templatingHandlerOptions, } = options !== null && options !== void 0 ? options : {};
        let template = '';
        let templatePath = (0, path_1.join)(templatesDirectory, defaultTemplate);
        if ((0, fs_1.existsSync)(templatePath)) {
            template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
        }
        else {
            // get built-in template
            template = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, '../templates/index.hbs'), { encoding: 'utf-8' });
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
            file.content = templatingHandler(template, templatingHandlerOptions, Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file));
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.templates = templates;
exports.default = templates;
