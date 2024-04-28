"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const minimatch_1 = require("minimatch");
function validateBuild({ allowExternalDirectories = false, allowWorkingDirectoryOutput = false }) {
    const cwd = (0, path_1.resolve)(process.cwd());
    const contentDir = (0, path_1.resolve)(this._contentDir);
    const staticDir = (0, path_1.resolve)(this._staticDir);
    const outputDir = (0, path_1.resolve)(this._outputDir);
    if (contentDir === outputDir) {
        throw new Error('Content directory cannot be the same as the output directory.');
    }
    if (contentDir === cwd) {
        throw new Error(`Content directory '${contentDir}' is the same as the current working directory.`);
    }
    if (staticDir === outputDir) {
        throw new Error('Static directory cannot be the same as the output directory.');
    }
    if (staticDir === cwd) {
        throw new Error(`Static directory '${staticDir}' is the same as the current working directory.`);
    }
    if (!allowWorkingDirectoryOutput) {
        if (outputDir === cwd) {
            throw new Error(`Output directory '${outputDir}' is the same as the current working directory.`);
        }
    }
    if (!allowExternalDirectories) {
        if (!(0, minimatch_1.minimatch)(contentDir, (0, path_1.join)(cwd, '**/*'))) {
            throw new Error(`Content directory '${contentDir}' is outside the current working directory.`);
        }
        if (!(0, minimatch_1.minimatch)(staticDir, (0, path_1.join)(cwd, '**/*'))) {
            throw new Error(`Static directory '${staticDir}' is outside the current working directory.`);
        }
        if (!(0, minimatch_1.minimatch)(outputDir, (0, path_1.join)(cwd, '**/*'))) {
            throw new Error(`Output directory '${outputDir}' is outside the current working directory.`);
        }
    }
}
exports.default = validateBuild;
