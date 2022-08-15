"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const fs_1 = require("fs");
const __1 = require("..");
function templates(options) {
    return function templatesWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        const { newExtname, targetExtnames, templatesDirectory, defaultTemplate, templatingHandler, templatingHandlerOptions, } = options !== null && options !== void 0 ? options : {};
        const _newExtname = newExtname !== null && newExtname !== void 0 ? newExtname : '.html';
        const _targetExtnames = targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.hbs', '.html'];
        const _templatesDirectory = templatesDirectory !== null && templatesDirectory !== void 0 ? templatesDirectory : 'templates';
        const _defaultTemplate = defaultTemplate !== null && defaultTemplate !== void 0 ? defaultTemplate : 'index.hbs';
        const _templatingHandler = (_a = templatingHandler !== null && templatingHandler !== void 0 ? templatingHandler : lollygag._config.templatingHandler) !== null && _a !== void 0 ? _a : __1.handleHandlebars;
        let template = '';
        let templatePath = (0, path_1.join)(_templatesDirectory, _defaultTemplate);
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
            if (!_targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            console.log(`Processing '${file.path}'...`);
            if (file.template && file.template !== _defaultTemplate) {
                templatePath = (0, path_1.join)(_templatesDirectory, file.template);
                if ((0, fs_1.existsSync)(templatePath)) {
                    template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
                }
                else {
                    console.log(`NOTICE: File '${templatePath}' missing. Using default template.`);
                }
            }
            const data = Object.assign(Object.assign(Object.assign({}, lollygag._meta), lollygag._config), file);
            file.content = _templatingHandler(template, templatingHandlerOptions, data);
            console.log(`Processing '${file.path}'... done!`);
            if (_newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, _newExtname);
            }
        }
    };
}
exports.templates = templates;
exports.default = templates;
