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
// renders a registered partial
handlebars_1.default.registerHelper('partial', (path, context) => {
    let partial = handlebars_1.default.partials[path];
    if (typeof partial !== 'function')
        partial = handlebars_1.default.compile(partial);
    return new handlebars_1.default.SafeString(partial(context));
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
    return function themesWorker(files, lollygag) {
        var _a;
        if (!files)
            return;
        const { newExtname = '.html', targetExtnames = ['.hbs', '.html'], themesDirectory = 'themes', partialsDirectory = (0, path_1.join)(themesDirectory, 'partials'), defaultTheme = 'index.hbs', templatingHandler = (_a = lollygag._config.templatingHandler) !== null && _a !== void 0 ? _a : __1.handlebars.handler, templatingHandlerOptions, } = options !== null && options !== void 0 ? options : {};
        let theme = '';
        let themePath = (0, path_1.join)(themesDirectory, defaultTheme);
        if ((0, fs_1.existsSync)(themePath)) {
            theme = (0, fs_1.readFileSync)(themePath, { encoding: 'utf-8' });
        }
        else {
            // get built-in theme
            theme = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, '../themes/index.hbs'), {
                encoding: 'utf-8',
            });
            console.warn(`NOTICE: File '${themePath}' not found. Using built-in theme as default.`);
        }
        (0, exports.registerPartials)(partialsDirectory);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if (file.theme && file.theme !== defaultTheme) {
                themePath = (0, path_1.join)(themesDirectory, file.theme);
                if ((0, fs_1.existsSync)(themePath)) {
                    theme = (0, fs_1.readFileSync)(themePath, { encoding: 'utf-8' });
                }
                else {
                    console.warn(`NOTICE: File '${themePath}' missing. Using default theme.`);
                }
            }
            file.content = templatingHandler(theme, templatingHandlerOptions, Object.assign(Object.assign(Object.assign({}, lollygag._sitemeta), lollygag._config), file));
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.worker = worker;
exports.default = worker;
