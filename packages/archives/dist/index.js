"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archives = exports.slugify = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const slugify = (s) => s
    .trim()
    // Handle accented characters
    .replace(/\p{L}/gu, (ch) => ch.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    .replace(/&/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
exports.slugify = slugify;
function archives(options) {
    return function archivesWorker(files, lollygag) {
        var _a, _b, _c;
        if (!files)
            return;
        const dir = (0, core_1.addParentToPath)(lollygag._in, options.dir);
        const newExtname = (_a = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _a !== void 0 ? _a : '.html';
        const targetExtnames = (_b = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _b !== void 0 ? _b : ['.hbs', '.html'];
        const renameToTitle = (_c = options === null || options === void 0 ? void 0 : options.renameToTitle) !== null && _c !== void 0 ? _c : true;
        console.log('dir', dir);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname);
            }
            if (file.title && renameToTitle) {
                console.log('dirname(file.path)', (0, path_1.dirname)(file.path));
                console.log('slugify(file.title)', (0, exports.slugify)(file.title));
                console.log('fullExtname(file.path)', (0, core_1.fullExtname)(file.path));
                file.path = (0, path_1.join)((0, path_1.dirname)(file.path), (0, exports.slugify)(file.title) + (0, core_1.fullExtname)(file.path));
            }
        }
    };
}
exports.archives = archives;
exports.default = archives;
