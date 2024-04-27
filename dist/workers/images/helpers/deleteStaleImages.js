"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function deleteStaleImages(meta, oldMeta) {
    Object.keys(oldMeta).forEach((imageKey) => {
        const staleImages = oldMeta[imageKey].desired.filter((d) => !meta[imageKey].desired.includes(d));
        staleImages.forEach((filePath) => {
            (0, fs_1.unlinkSync)(filePath);
        });
    });
}
exports.default = deleteStaleImages;
