"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.registerPartials = void 0;
const glob_1 = require("glob");
const path_1 = require("path");
const fs_1 = require("fs");
const handlebars_1 = __importDefault(require("handlebars"));
const __1 = require("../..");
handlebars_1.default.registerHelper('json', (context) => JSON.stringify(context, null, 2));
handlebars_1.default.registerHelper('log', (value) => {
    console.log(value);
});
handlebars_1.default.registerHelper('partial', function x(path, context, options) {
    let partial = handlebars_1.default.partials[path];
    if (typeof partial !== 'function') {
        partial = handlebars_1.default.compile(partial);
    }
    let ctx = {};
    if (typeof context !== 'object') {
        ctx = { value: context };
    }
    else if (context.hash && Object.keys(context.hash).length > 0) {
        ctx = context.hash;
    }
    else if (context.data && context.data.root) {
        ctx = context.data.root;
    }
    else {
        ctx = context;
    }
    if (context.fn) {
        ctx = Object.assign(Object.assign({}, ctx), { body: context.fn(this) });
    }
    else if (options && options.fn) {
        ctx = Object.assign(Object.assign({}, ctx), { body: options.fn(this) });
    }
    return new handlebars_1.default.SafeString(partial(ctx));
});
const registerPartials = (dir) => {
    glob_1.glob.sync(`${dir}/*.hbs`).forEach((file) => {
        var _a;
        const name = ((_a = file.split('/').pop()) !== null && _a !== void 0 ? _a : file).split('.')[0];
        const partial = (0, fs_1.readFileSync)(file, 'utf8');
        handlebars_1.default.registerPartial(name, partial);
    });
};
exports.registerPartials = registerPartials;
function worker(options) {
    return function templatesWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        const { newExtname = '.html', targetExtnames = ['.hbs', '.html'], templatesDirectory = 'templates', partialsDirectory = (0, path_1.join)(templatesDirectory, 'partials'), defaultTemplate = 'index.hbs', templatingHandler = (_a = lollygag._config.templatingHandler) !== null && _a !== void 0 ? _a : __1.handlebars.handler, templatingHandlerOptions, } = options !== null && options !== void 0 ? options : {};
        let template = '';
        let templatePath = (0, path_1.join)(templatesDirectory, defaultTemplate);
        if ((0, fs_1.existsSync)(templatePath)) {
            template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
        }
        else {
            // get built-in template
            template = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, '../templates/index.hbs'), { encoding: 'utf-8' });
            console.warn(`NOTICE: File '${templatePath}' not found. Using built-in template as default.`);
        }
        (0, exports.registerPartials)(partialsDirectory);
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
                    console.warn(`NOTICE: File '${templatePath}' missing. Using default template.`);
                }
            }
            file.content = templatingHandler(template, templatingHandlerOptions, Object.assign(Object.assign(Object.assign({}, lollygag._sitemeta), lollygag._config), file));
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.worker = worker;
exports.default = worker;
