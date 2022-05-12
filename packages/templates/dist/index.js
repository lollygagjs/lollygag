"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const handlebars_1 = require("@lollygag/handlebars");
const fs_1 = require("fs");
function templates(options) {
    return function templatesWorker(files, lollygag) {
        if (!files)
            return;
        const handler = (options === null || options === void 0 ? void 0 : options.handler) || handlebars_1.handleHandlebars;
        const templatesDirectory = (options === null || options === void 0 ? void 0 : options.templatesDirectory) || 'templates';
        const defaultTemplate = (options === null || options === void 0 ? void 0 : options.defaultTemplate) || 'index.hbs';
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
            const targetExtnames = [
                ...['.hbs', '.html'],
                ...((options === null || options === void 0 ? void 0 : options.targetExtnames) || []),
            ];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            console.log(`Processing '${file.path}'...`);
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.html');
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
            const data = Object.assign(Object.assign({}, lollygag._config), file);
            file.content = handler(template, options === null || options === void 0 ? void 0 : options.handlerOptions, data);
            console.log(`Processing '${file.path}'... Done!`);
        }
    };
}
exports.templates = templates;
exports.default = templates;
