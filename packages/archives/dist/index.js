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
function paginateArchive(args) {
    const { archive, files, relativeDir, prewriteDir, pretty, pageLimit } = args;
    const pageCount = Math.ceil(archive.length / pageLimit);
    function page(pageNumber) {
        const num = pageNumber === '1' ? '' : pageNumber;
        const uglyNum = num === '' ? num : `${num}.html`;
        return (0, path_1.join)(relativeDir, pretty ? `${num}` : uglyNum);
    }
    // eslint-disable-next-line no-mixed-operators
    for (let i = 1; i <= pageCount; i++) {
        const items = (0, core_1.deepCopy)(
        // eslint-disable-next-line no-mixed-operators
        archive.slice(i * pageLimit - pageLimit, i * pageLimit));
        const nextLink = pageCount > i ? page(`${i + 1}`) : false;
        const prevLink = i > 1 ? page(`${i - 1}`) : false;
        files.push({
            path: (0, path_1.join)(prewriteDir, i === 1 ? 'index.html' : `${i}.html`),
            title: `Archives: Page ${i}`,
            template: 'archives.hbs',
            nextLink,
            prevLink,
            items,
            mimetype: 'text/plain',
        });
    }
}
function archives(options) {
    return function archivesWorker(files, lollygag) {
        if (!files)
            return;
        const { pageLimit = 10, renameToTitle = true, newExtname = '.html', targetExtnames = ['.hbs', '.html'], dir, } = options;
        const relativeDir = dir.replace(/^\/|\/$/g, '');
        const prewriteDir = (0, core_1.addParentToPath)(lollygag._in, relativeDir);
        const archive = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))
                || !(0, minimatch_1.default)(file.path, (0, path_1.join)(prewriteDir, '/**/*'))) {
                continue;
            }
            if (newExtname !== false) {
                file.path = (0, core_1.changeExtname)(file.path, newExtname);
            }
            if (file.title && renameToTitle) {
                file.path = (0, path_1.join)(prewriteDir, (0, exports.slugify)(file.title) + (0, core_1.fullExtname)(file.path));
            }
            archive.push(file);
        }
        archive.sort((a, b) => {
            var _a, _b, _c, _d;
            // Sort descending based on file creation time
            return ((_b = ((_a = b.stats) !== null && _a !== void 0 ? _a : {}).birthtimeMs) !== null && _b !== void 0 ? _b : 0)
                - ((_d = ((_c = a.stats) !== null && _c !== void 0 ? _c : {}).birthtimeMs) !== null && _d !== void 0 ? _d : 0);
        });
        paginateArchive({
            archive,
            files,
            pretty: lollygag._config.prettyUrls,
            pageLimit,
            relativeDir,
            prewriteDir,
        });
    };
}
exports.archives = archives;
exports.default = archives;
