"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const minimatch_1 = require("minimatch");
function validateBuild({ allowExternalDirectories = false, allowWorkingDirectoryOutput = false }) {
    const cwd = (0, path_1.resolve)(process.cwd());
    const inDir = (0, path_1.resolve)(this._in);
    const outDir = (0, path_1.resolve)(this._out);
    if (!this._files && !(0, fs_1.existsSync)(inDir)) {
        throw new Error(`Input directory '${inDir}' does not exist.`);
    }
    if (inDir === outDir) {
        throw new Error('Input directory cannot be the same as the output directory.');
    }
    if (inDir === cwd) {
        throw new Error(`Input directory '${inDir}' is the same as the current working directory.`);
    }
    if (!allowWorkingDirectoryOutput) {
        if (outDir === cwd) {
            throw new Error(`Output directory '${outDir}' is the same as the current working directory.`);
        }
    }
    if (!allowExternalDirectories) {
        if (!(0, minimatch_1.minimatch)(inDir, (0, path_1.join)(cwd, '**/*'))) {
            throw new Error(`Input directory '${inDir}' is outside the current working directory.`);
        }
        if (!(0, minimatch_1.minimatch)(outDir, (0, path_1.join)(cwd, '**/*'))) {
            throw new Error(`Output directory '${outDir}' is outside the current working directory.`);
        }
    }
}
exports.default = validateBuild;
