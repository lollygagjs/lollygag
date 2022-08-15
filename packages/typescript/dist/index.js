"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescript = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const typescript_1 = require("typescript");
function typescript(options) {
    return function typescriptWorker(files) {
        if (!files)
            return;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const { targetExtnames, compilerOptions, newExtname } = options || {};
            if (!(targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.ts']).includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, typescript_1.transpile)(file.content || '', compilerOptions);
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname !== null && newExtname !== void 0 ? newExtname : '.js');
            }
        }
    };
}
exports.typescript = typescript;
exports.default = typescript;
