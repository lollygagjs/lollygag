"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescript = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const typescript_1 = require("typescript");
function typescript(options) {
    return function typescriptWorker(files) {
        var _a;
        if (!files)
            return;
        const { newExtname, targetExtnames, compilerOptions } = options !== null && options !== void 0 ? options : {};
        const _newExtname = newExtname !== null && newExtname !== void 0 ? newExtname : '.js';
        const _targetExtnames = targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.ts'];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!_targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, typescript_1.transpile)((_a = file.content) !== null && _a !== void 0 ? _a : '', compilerOptions);
            if (_newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, _newExtname);
            }
        }
    };
}
exports.typescript = typescript;
exports.default = typescript;
