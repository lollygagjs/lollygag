"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const __1 = require("..");
function generatePrettyUrls(files) {
    return files.map((file) => {
        if ((0, path_1.extname)(file.path) === '.html'
            && (0, path_1.basename)(file.path) !== 'index.html') {
            return Object.assign(Object.assign({}, file), { path: (0, path_1.join)((0, path_1.dirname)(file.path), (0, __1.changeExtname)((0, path_1.basename)(file.path), ''), 'index.html') });
        }
        return file;
    });
}
exports.default = generatePrettyUrls;
