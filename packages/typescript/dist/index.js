"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescript = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const typescript_1 = require("typescript");
function typescript(options) {
    return function typescriptWorker(files) {
        var _a, _b, _c, _d;
        if (!files)
            return;
        const { target, module } = (_a = options === null || options === void 0 ? void 0 : options.compilerOptions) !== null && _a !== void 0 ? _a : {};
        const newExtname = (_b = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _b !== void 0 ? _b : '.js';
        const targetExtnames = (_c = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _c !== void 0 ? _c : ['.ts'];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, typescript_1.transpile)((_d = file.content) !== null && _d !== void 0 ? _d : '', {
                module: typescript_1.ModuleKind[module || 'ES2015'],
                target: typescript_1.ScriptTarget[target || 'ES2015'],
            });
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.typescript = typescript;
exports.default = typescript;
