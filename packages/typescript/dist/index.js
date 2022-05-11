"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            const targetExtnames = [
                ...['.ts'],
                ...((options === null || options === void 0 ? void 0 : options.targetExtnames) || []),
            ];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, typescript_1.transpile)(file.content || '', options === null || options === void 0 ? void 0 : options.compilerOptions);
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.js');
            }
        }
    };
}
exports.default = typescript;
