"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sass = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const sass_1 = require("sass");
const core_1 = require("@lollygag/core");
function sass(options) {
    return function sassWorker(files) {
        if (!files)
            return;
        const { newExtname, targetExtnames, sassOptions } = options !== null && options !== void 0 ? options : {};
        const _newExtname = newExtname !== null && newExtname !== void 0 ? newExtname : '.css';
        const _targetExtnames = targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.scss', '.sass'];
        const _sassOptions = Object.assign({ sourceMap: true, sourceMapIncludeSources: true, style: 'expanded' }, sassOptions);
        const excludes = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!_targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((0, path_1.basename)(file.path).startsWith('_')) {
                excludes.push(i);
                continue;
            }
            let outFile = file.path;
            if (_newExtname !== false) {
                outFile = (0, core_1.changeExtname)(file.path, _newExtname);
            }
            const result = (0, sass_1.compile)(file.path, _sassOptions);
            file.path = outFile;
            file.content = result.css;
            if (_sassOptions.sourceMap && file.content) {
                const sourcemapPath = (0, path_1.join)(`${outFile}.map`);
                file.map = sourcemapPath;
                file.content += `\n\n/*# sourceMappingURL=${(0, path_1.basename)(sourcemapPath)} */\n`;
                const sourcemapContent = JSON.stringify(result.sourceMap);
                files.push({
                    path: sourcemapPath,
                    content: sourcemapContent,
                    mimetype: 'application/json',
                });
            }
        }
        while (excludes.length) {
            const indexToRemove = excludes.pop();
            files.splice(indexToRemove, 1);
        }
    };
}
exports.sass = sass;
exports.default = sass;
