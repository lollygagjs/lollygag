"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.archives = exports.slugify = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const minimatch_1 = __importDefault(require("minimatch"));
const core_1 = require("@lollygag/core");
const fs_1 = require("fs");
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
        // TODO: Temp
        const x = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))
                || !(0, minimatch_1.default)(file.path, (0, path_1.join)(dir, '/**/*'))) {
                continue;
            }
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname);
            }
            if (file.title && renameToTitle) {
                file.path = (0, path_1.join)(dir, (0, exports.slugify)(file.title) + (0, core_1.fullExtname)(file.path));
            }
            x.push(file);
        }
        // TODO: Create archive pages
        (0, fs_1.writeFileSync)('temp.json', JSON.stringify(x.sort((a, b) => {
            var _a, _b, _c, _d;
            // Sort descending based on file creation time
            return ((_b = ((_a = b.stats) !== null && _a !== void 0 ? _a : {}).birthtimeMs) !== null && _b !== void 0 ? _b : 0)
                - ((_d = ((_c = a.stats) !== null && _c !== void 0 ? _c : {}).birthtimeMs) !== null && _d !== void 0 ? _d : 0);
        }), null, 2));
    };
}
exports.archives = archives;
exports.default = archives;
