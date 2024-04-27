"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sass = void 0;
const path_1 = require("path");
const sass_1 = require("sass");
const __1 = require("../..");
function sass(options) {
    return function sassWorker(files) {
        if (!files)
            return;
        const { newExtname = '.css', targetExtnames = ['.scss', '.sass'], sassOptions, } = options !== null && options !== void 0 ? options : {};
        const mergedSassOptions = Object.assign({ sourceMap: true, sourceMapIncludeSources: true, style: 'expanded' }, sassOptions);
        const excludes = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((0, path_1.basename)(file.path).startsWith('_')) {
                excludes.push(i);
                continue;
            }
            let outFile = file.path;
            if (newExtname !== false) {
                outFile = (0, __1.changeExtname)(file.path, newExtname);
            }
            const result = (0, sass_1.compile)(file.path, mergedSassOptions);
            file.path = outFile;
            file.content = result.css;
            if (mergedSassOptions.sourceMap && file.content) {
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
            if (typeof indexToRemove === 'number') {
                files.splice(indexToRemove, 1);
            }
        }
    };
}
exports.sass = sass;
exports.default = sass;
