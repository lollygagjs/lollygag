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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParentFromPath = exports.addParentToPath = exports.changeFullExtname = exports.changeExtname = exports.fullExtname = void 0;
const path_1 = require("path");
__exportStar(require("./workers/handlebars"), exports);
__exportStar(require("./workers/markdown"), exports);
__exportStar(require("./workers/templates"), exports);
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
