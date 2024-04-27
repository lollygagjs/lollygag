"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const fs_1 = require("fs");
const path_1 = require("path");
function generateFilename(path, sizeId) {
    const fileExt = (0, __1.fullExtname)(path);
    const fileBasename = (0, path_1.basename)(path, fileExt);
    const fileName = fileBasename + (sizeId ? `-${sizeId}` : '') + fileExt;
    const dir = (0, path_1.join)('.images', (0, path_1.dirname)(path));
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    return (0, path_1.join)(dir, fileName);
}
exports.default = generateFilename;
