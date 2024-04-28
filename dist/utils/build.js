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
const path_1 = require("path");
const console_1 = require("console");
const generatePrettyUrls_1 = __importDefault(require("./generatePrettyUrls"));
const getFiles_1 = __importDefault(require("./getFiles"));
const parseFiles_1 = __importDefault(require("./parseFiles"));
const validateBuild_1 = __importDefault(require("./validateBuild"));
const writeFiles_1 = __importDefault(require("./writeFiles"));
const rimraf_1 = require("rimraf");
function build(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullBuild = false, allowExternalDirectories = false, allowWorkingDirectoryOutput = false, globPattern, } = options !== null && options !== void 0 ? options : {};
        validateBuild_1.default.call(this, {
            allowExternalDirectories,
            allowWorkingDirectoryOutput,
        });
        const defaultGlobPattern = '**/*';
        const globPatterns = [
            (0, path_1.join)(this._contentDir, globPattern !== null && globPattern !== void 0 ? globPattern : defaultGlobPattern),
            (0, path_1.join)(this._staticDir, globPattern !== null && globPattern !== void 0 ? globPattern : defaultGlobPattern),
        ];
        (0, console_1.time)('Total build time');
        if (fullBuild) {
            (0, console_1.time)(`Cleaned '${this._outputDir}' directory`);
            yield (0, rimraf_1.rimraf)((0, path_1.join)(this._outputDir, '**/*'));
            (0, console_1.timeEnd)(`Cleaned '${this._outputDir}' directory`);
        }
        (0, console_1.time)('Files collected');
        const fileList = yield getFiles_1.default.call(this, globPatterns);
        (0, console_1.timeEnd)('Files collected');
        (0, console_1.time)('Files parsed');
        const parsedFiles = (yield parseFiles_1.default.call(this, fileList)).filter((file) => !file.exclude);
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
        (0, console_1.timeEnd)('Total build time');
    });
}
exports.default = build;
