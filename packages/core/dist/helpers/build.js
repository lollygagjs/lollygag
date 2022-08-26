"use strict";
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
const minimatch_1 = __importDefault(require("minimatch"));
const path_1 = require("path");
const console_1 = require("console");
const __1 = require("..");
const generatePrettyUrls_1 = __importDefault(require("./generatePrettyUrls"));
const getFiles_1 = __importDefault(require("./getFiles"));
const parseFiles_1 = __importDefault(require("./parseFiles"));
const validateBuild_1 = __importDefault(require("./validateBuild"));
const writeFiles_1 = __importDefault(require("./writeFiles"));
function build(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullBuild = false, allowExternalDirectories = false, allowWorkingDirectoryOutput = false, globPattern, } = options !== null && options !== void 0 ? options : {};
        validateBuild_1.default.call(this, {
            allowExternalDirectories,
            allowWorkingDirectoryOutput,
        });
        const defaultGlobPattern = '**/*';
        const normalizedGlobPattern = (0, path_1.join)(this._in, globPattern !== null && globPattern !== void 0 ? globPattern : defaultGlobPattern);
        (0, console_1.time)('Total build time');
        (0, console_1.time)('Files collected');
        const fileList = yield getFiles_1.default.call(this, normalizedGlobPattern);
        (0, console_1.timeEnd)('Files collected');
        (0, console_1.time)('Files parsed');
        /**
         * Get files added through `Lollygag.files()` with paths that
         * match `normalizedGlobPattern`.
         */
        const fileObjects = this._files.filter((file) => (0, minimatch_1.default)(file.path, normalizedGlobPattern));
        const parsedFiles = [
            ...fileObjects,
            ...(yield parseFiles_1.default.call(this, fileList)),
        ];
        (0, console_1.timeEnd)('Files parsed');
        yield this._workers.reduce((possiblePromise, worker) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const workerName = (_a = worker.name) !== null && _a !== void 0 ? _a : 'unknown worker';
            yield Promise.resolve(possiblePromise);
            (0, console_1.log)(`Running ${workerName}...`);
            (0, console_1.time)(`Finished running ${workerName}`);
            yield worker(parsedFiles, this);
            (0, console_1.timeEnd)(`Finished running ${workerName}`);
        }), Promise.resolve());
        let toWrite = parsedFiles;
        if (this._config.prettyUrls) {
            (0, console_1.time)('Generated pretty URLs');
            toWrite = (0, generatePrettyUrls_1.default)(parsedFiles);
            (0, console_1.timeEnd)('Generated pretty URLs');
        }
        (0, console_1.time)('Files written');
        yield writeFiles_1.default.call(this, toWrite);
        (0, console_1.timeEnd)('Files written');
        if (fullBuild) {
            (0, console_1.time)(`Cleaned '${this._out}' directory`);
            const written = toWrite.map((file) => (0, __1.addParentToPath)(this._out, 
            // TODO: Ooooooooooh
            (0, __1.removeParentFromPath)(this._in, file.path)));
            const existing = yield getFiles_1.default.call(this, (0, path_1.join)(this._out, '/**/*'));
            const difference = existing.filter((ex) => !written.includes(ex));
            // Delete old files and leftover directories
            yield (0, __1.deleteFiles)(difference);
            yield (0, __1.deleteEmptyDirs)(this._out);
            (0, console_1.timeEnd)(`Cleaned '${this._out}' directory`);
        }
        (0, console_1.timeEnd)('Total build time');
    });
}
exports.default = build;
