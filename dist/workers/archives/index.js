"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.slugify = void 0;
const path_1 = require("path");
const minimatch_1 = require("minimatch");
const __1 = require("../..");
const slugify = (s) => s
    .trim()
    // handle accented characters
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
    const nav = (pageNumber) => {
        const num = pageNumber === '1' ? '' : pageNumber;
        const uglyNum = num === '' ? num : `${num}.html`;
        return (0, path_1.join)(relativeDir, pretty ? `${num}` : uglyNum);
    };
    for (let i = 1; i <= pageCount; i++) {
        const items = (0, __1.deepCopy)(
        // eslint-disable-next-line no-mixed-operators
        archive.slice(i * pageLimit - pageLimit, i * pageLimit));
        const nextLink = pageCount > i ? nav(`${i + 1}`) : false;
        const prevLink = i > 1 ? nav(`${i - 1}`) : false;
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
function worker(options) {
    return function archivesWorker(files, lollygag) {
        if (!files)
            return;
        const { dir, pageLimit = 10, renameToTitle = true } = options;
        const relativeDir = dir.replace(/^\/|\/$/g, '');
        const prewriteDir = (0, __1.addParentToPath)(lollygag._in, relativeDir);
        const archive = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if ((0, path_1.extname)(file.path) !== '.html'
                || !(0, minimatch_1.minimatch)(file.path, (0, path_1.join)(prewriteDir, '/**/*'))) {
                continue;
            }
            if (file.title && renameToTitle) {
                file.path = (0, path_1.join)(prewriteDir, (0, exports.slugify)(file.title) + (0, __1.fullExtname)(file.path));
            }
            else {
                file.path = (0, path_1.join)(prewriteDir, (0, path_1.basename)(file.path));
            }
            archive.push(file);
        }
        // sort descending by file creation time
        archive.sort((a, b) => {
            var _a, _b, _c, _d;
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
exports.worker = worker;
exports.default = worker;
