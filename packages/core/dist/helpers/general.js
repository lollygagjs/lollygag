"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileMimetype = exports.deepEqual = exports.deepCopy = exports.deleteFiles = exports.deleteEmptyDirs = exports.removeUpToParentFromPath = exports.removeParentFromPath = exports.addParentToPath = exports.changeFullExtname = exports.changeExtname = exports.fullExtname = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const mmmagic_1 = __importDefault(require("mmmagic"));
__exportStar(require("../workers/handlebars"), exports);
function fullExtname(filePath) {
    const extensions = (0, path_1.basename)(filePath).split('.');
    extensions.shift();
    return `.${extensions.join('.')}`;
}
exports.fullExtname = fullExtname;
function changeExtname(filePath, newExtension) {
    return (0, path_1.join)((0, path_1.dirname)(filePath), `${(0, path_1.basename)(filePath, (0, path_1.extname)(filePath))}${newExtension}`);
}
exports.changeExtname = changeExtname;
function changeFullExtname(filePath, newExtension) {
    return (0, path_1.join)((0, path_1.dirname)(filePath), `${(0, path_1.basename)(filePath, fullExtname(filePath))}${newExtension}`);
}
exports.changeFullExtname = changeFullExtname;
function addParentToPath(parent, path) {
    // remove leading and trailing slashes
    let cleanParent = (0, path_1.join)(parent).replace(/^\/|\/$/g, '');
    if (path.startsWith('/'))
        cleanParent = (0, path_1.join)('/', cleanParent);
    return (0, path_1.join)(cleanParent, path);
}
exports.addParentToPath = addParentToPath;
function removeParentFromPath(parent, path) {
    // remove leading and trailing slashes
    const cleanParent = (0, path_1.join)(parent).replace(/^\/|\/$/g, '');
    return (0, path_1.join)(path.replace(`${cleanParent}/`, ''));
}
exports.removeParentFromPath = removeParentFromPath;
function removeUpToParentFromPath(parent, path) {
    // remove leading and trailing slashes
    const cleanParent = (0, path_1.join)(parent).replace(/^\/|\/$/g, '');
    return (0, path_1.join)(path.slice(path.indexOf(`${cleanParent}/`) + cleanParent.length));
}
exports.removeUpToParentFromPath = removeUpToParentFromPath;
function deleteEmptyDirs(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, fs_1.statSync)(dir).isDirectory())
            return;
        let files = yield fs_1.promises.readdir(dir);
        if (files.length > 0) {
            yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                yield deleteEmptyDirs((0, path_1.join)(dir, file));
            })));
            files = yield fs_1.promises.readdir(dir);
        }
        if (files.length === 0)
            yield fs_1.promises.rmdir(dir);
    });
}
exports.deleteEmptyDirs = deleteEmptyDirs;
function deleteFiles(files) {
    return Promise.all(files.map((f) => fs_1.promises.unlink(f)));
}
exports.deleteFiles = deleteFiles;
function deepCopy(original) {
    return JSON.parse(JSON.stringify(original));
}
exports.deepCopy = deepCopy;
function deepEqual(a, b) {
    if (a === b)
        return true;
    if (typeof a !== 'object' || typeof b !== 'object')
        return false;
    if (Object.keys(a).length !== Object.keys(b).length)
        return false;
    for (const key in a) {
        // eslint-disable-next-line no-continue
        if (!Object.prototype.hasOwnProperty.call(a, key))
            continue;
        if (!Object.prototype.hasOwnProperty.call(b, key))
            return false;
        if (!deepEqual(a[key], b[key]))
            return false;
    }
    return true;
}
exports.deepEqual = deepEqual;
const magic = new mmmagic_1.default.Magic(mmmagic_1.default.MAGIC_MIME_TYPE);
function getFileMimetype(filePath) {
    return new Promise((res, rej) => {
        magic.detectFile(filePath, (err, result) => {
            if (err)
                rej(err);
            else
                res(typeof result === 'string' ? result : result[0]);
        });
    });
}
exports.getFileMimetype = getFileMimetype;
