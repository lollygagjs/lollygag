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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.validateBuild = exports.writeFiles = exports.generatePrettyUrls = exports.getFiles = exports.parseFiles = void 0;
const fs_1 = __importStar(require("fs"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const glob_1 = require("glob");
const posix_1 = require("path/posix");
const minimatch_1 = require("minimatch");
const general_1 = require("./general");
function parseFiles(files) {
    const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const fileMimetype = yield (0, general_1.getFileMimetype)(file);
        const fileStats = yield fs_1.promises.stat(file);
        // if file size is 0, return immediately
        if (fileStats.size === 0) {
            return { path: file, mimetype: fileMimetype, exclude: true };
        }
        if (fileMimetype.startsWith('text/')
            || fileMimetype === 'inode/x-empty') {
            let rawFileContent = yield fs_1.promises.readFile(file, {
                encoding: 'utf-8',
            });
            // if file is empty return immediately
            if (!rawFileContent.trim()) {
                return {
                    path: file,
                    mimetype: fileMimetype,
                    exclude: true,
                };
            }
            rawFileContent = this.handleTemplating(rawFileContent, (_a = this._config.templatingHandlerOptions) !== null && _a !== void 0 ? _a : null, Object.assign(Object.assign({}, this._config), this._sitemeta));
            const grayMatterResult = (0, gray_matter_1.default)(rawFileContent);
            grayMatterResult.content = this.handleTemplating(grayMatterResult.content, (_b = this._config.templatingHandlerOptions) !== null && _b !== void 0 ? _b : null, grayMatterResult.data);
            return Object.assign(Object.assign({ path: file, content: grayMatterResult.content, mimetype: fileMimetype }, grayMatterResult.data), { stats: fileStats });
        }
        return { path: file, mimetype: fileMimetype, stats: fileStats };
    }));
    return Promise.all(promises);
}
exports.parseFiles = parseFiles;
function getFiles() {
    return __awaiter(this, arguments, void 0, function* (globPatterns = [
        (0, posix_1.join)(this._contentDir, '/**/*'),
        (0, posix_1.join)(this._staticDir, '/**/*'),
    ]) {
        const promises = globPatterns.map((pattern) => (0, glob_1.glob)(pattern, { nodir: true, dot: true }));
        const filesArrays = yield Promise.all(promises);
        return filesArrays.flat();
    });
}
exports.getFiles = getFiles;
function generatePrettyUrls(files) {
    return files.map((file) => {
        if ((0, posix_1.extname)(file.path) === '.html'
            && (0, posix_1.basename)(file.path) !== 'index.html') {
            return Object.assign(Object.assign({}, file), { path: (0, posix_1.join)((0, posix_1.dirname)(file.path), (0, general_1.changeExtname)((0, posix_1.basename)(file.path), ''), 'index.html') });
        }
        return file;
    });
}
exports.generatePrettyUrls = generatePrettyUrls;
function writeFiles(files) {
    const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        /**
         * Change `file.path` to final output path.
         */
        const filePath = (0, posix_1.join)(this._outputDir, 
        // TODO: Ooooooh
        (0, general_1.removeUpToParentsFromPath)([this._contentDir, this._staticDir], file.path));
        const fileDir = (0, posix_1.dirname)(filePath);
        if (!fs_1.default.existsSync(fileDir)) {
            yield fs_1.promises.mkdir(fileDir, { recursive: true });
        }
        if (file.mimetype.startsWith('text/')
            || file.mimetype === 'inode/x-empty'
            || file.mimetype === 'application/json') {
            yield fs_1.promises.writeFile(filePath, (_a = file.content) !== null && _a !== void 0 ? _a : '');
        }
        else {
            yield fs_1.promises.copyFile(file.path, filePath);
        }
    }));
    const timestamp = this._config.generateTimestamp
        ? fs_1.promises.writeFile('.timestamp', new Date().getTime().toString())
        : Promise.resolve();
    return Promise.all([...promises, timestamp]);
}
exports.writeFiles = writeFiles;
function validateBuild({ allowExternalDirectories = false, allowWorkingDirectoryOutput = false }) {
    const cwd = (0, posix_1.resolve)(process.cwd());
    const contentDir = (0, posix_1.resolve)(this._contentDir);
    const staticDir = (0, posix_1.resolve)(this._staticDir);
    const outputDir = (0, posix_1.resolve)(this._outputDir);
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
        if (!(0, minimatch_1.minimatch)(contentDir, (0, posix_1.join)(cwd, '**/*'))) {
            throw new Error(`Content directory '${contentDir}' is outside the current working directory.`);
        }
        if (!(0, minimatch_1.minimatch)(staticDir, (0, posix_1.join)(cwd, '**/*'))) {
            throw new Error(`Static directory '${staticDir}' is outside the current working directory.`);
        }
        if (!(0, minimatch_1.minimatch)(outputDir, (0, posix_1.join)(cwd, '**/*'))) {
            throw new Error(`Output directory '${outputDir}' is outside the current working directory.`);
        }
    }
}
exports.validateBuild = validateBuild;
