"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilename = void 0;
const core_1 = require("@lollygag/core");
const fs_1 = require("fs");
const path_1 = require("path");
function generateFilename(path, id, quality) {
    const fileExt = (0, core_1.fullExtname)(path);
    const fileBasename = (0, path_1.basename)(path, fileExt);
    let fileName;
    if (quality)
        fileName = `${fileBasename}-${id}-q${quality}${fileExt}`;
    else
        fileName = `${fileBasename}-${id}${fileExt}`;
    const dir = (0, path_1.join)('.images', (0, path_1.dirname)(path));
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    return (0, path_1.join)(dir, fileName);
}
exports.generateFilename = generateFilename;
