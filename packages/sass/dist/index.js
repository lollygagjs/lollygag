"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sass = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const node_sass_1 = require("node-sass");
const core_1 = require("@lollygag/core");
function sass(options) {
    return function sassWorker(files) {
        if (!files)
            return;
        const excludes = [];
        const nodeSassOptions = Object.assign({ sourceMap: true, sourceMapContents: true }, options === null || options === void 0 ? void 0 : options.nodeSassOptions);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetExtnames = (options === null || options === void 0 ? void 0 : options.targetExtnames) || [
                '.scss',
                '.sass',
            ];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if ((0, path_1.basename)(file.path).startsWith('_')) {
                excludes.push(i);
                continue;
            }
            let outFile = file.path;
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                outFile = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.css');
            }
            const result = (0, node_sass_1.renderSync)(Object.assign(Object.assign({}, nodeSassOptions), { file: file.path, outFile }));
            file.path = outFile;
            file.content = result.css.toString();
            if (nodeSassOptions.sourceMap) {
                const sourcemapPath = (0, path_1.join)(`${outFile}.map`);
                file.map = sourcemapPath;
                const sourcemapContent = result.map.toString();
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
