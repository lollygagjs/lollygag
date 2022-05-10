"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterObject = exports.mapObject = exports.foreachObject = exports.removeParentFromPath = exports.addParentToPath = exports.changeFullExtname = exports.changeExtname = exports.fullExtname = void 0;
const path_1 = require("path");
function fullExtname(filePath) {
    const extensions = path_1.basename(filePath).split('.');
    extensions.shift();
    return `.${extensions.join('.')}`;
}
exports.fullExtname = fullExtname;
function changeExtname(filePath, newExtension) {
    return path_1.join(path_1.dirname(filePath), `${path_1.basename(filePath, path_1.extname(filePath))}${newExtension}`);
}
exports.changeExtname = changeExtname;
function changeFullExtname(filePath, newExtension) {
    return path_1.join(path_1.dirname(filePath), `${path_1.basename(filePath, fullExtname(filePath))}${newExtension}`);
}
exports.changeFullExtname = changeFullExtname;
function addParentToPath(parent, path) {
    // remove leading and trailing slashes
    let cleanParent = path_1.join(parent).replace(/^\/|\/$/g, '');
    if (path.startsWith('/'))
        cleanParent = path_1.join('/', cleanParent);
    return path_1.join(cleanParent, path);
}
exports.addParentToPath = addParentToPath;
function removeParentFromPath(parent, path) {
    // remove leading and trailing slashes
    const cleanParent = path_1.join(parent).replace(/^\/|\/$/g, '');
    return path_1.join(path.replace(`${cleanParent}/`, ''));
}
exports.removeParentFromPath = removeParentFromPath;
function foreachObject(obj, callback) {
    Object.keys(obj).forEach((key) => callback(obj[key], key, obj));
}
exports.foreachObject = foreachObject;
function mapObject(obj, callback) {
    return Object.keys(obj).map((key) => callback(obj[key], key, obj));
}
exports.mapObject = mapObject;
function filterObject(obj, callback) {
    return Object.keys(obj).filter((key) => callback(obj[key], key, obj));
}
exports.filterObject = filterObject;
