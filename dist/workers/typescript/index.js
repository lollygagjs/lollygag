"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescript = void 0;
const path_1 = require("path");
const typescript_1 = require("typescript");
const __1 = require("../..");
function typescript(options) {
    return function typescriptWorker(files) {
        var _a;
        if (!files)
            return;
        const { newExtname = ',js', targetExtnames = ['.ts'], compilerOptions, } = options !== null && options !== void 0 ? options : {};
        const { target, module } = compilerOptions !== null && compilerOptions !== void 0 ? compilerOptions : {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            file.content = (0, typescript_1.transpile)((_a = file.content) !== null && _a !== void 0 ? _a : '', {
                module: typescript_1.ModuleKind[module !== null && module !== void 0 ? module : 'ES2015'],
                target: typescript_1.ScriptTarget[target !== null && target !== void 0 ? target : 'ES2015'],
            });
            if (newExtname !== false) {
                file.path = (0, __1.changeExtname)(file.path, newExtname);
            }
        }
    };
}
exports.typescript = typescript;
exports.default = typescript;
