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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.Lollygag = void 0;
const fs_1 = __importStar(require("fs"));
const console_1 = require("console");
const path_1 = require("path");
const gray_matter_1 = __importDefault(require("gray-matter"));
const rimraf_1 = __importDefault(require("rimraf"));
const glob_1 = __importDefault(require("glob"));
const minimatch_1 = __importDefault(require("minimatch"));
const chalk_1 = require("chalk");
const mmmagic_1 = __importDefault(require("mmmagic"));
const helpers_1 = require("./helpers");
__exportStar(require("./helpers"), exports);
const magic = new mmmagic_1.default.Magic(mmmagic_1.default.MAGIC_MIME_TYPE);
class Lollygag {
    constructor(__config = {
        generator: 'Lollygag',
        prettyUrls: true,
    }, __meta = {
        year: new Date().getFullYear(),
    }, __in = 'files', __out = 'public', __files = [], __workers = []) {
        this.__config = __config;
        this.__meta = __meta;
        this.__in = __in;
        this.__out = __out;
        this.__files = __files;
        this.__workers = __workers;
        this.handleTemplating = this._config.templatingHandler || helpers_1.handleHandlebars;
        (0, console_1.log)('Hello from Lollygag!');
    }
    config(config) {
        const c = config;
        if (c.subdir)
            c.subdir = (0, path_1.join)('/', c.subdir).replace(/\/$/, '');
        this.__config = Object.assign(Object.assign({}, this._config), c);
        return this;
    }
    get _config() {
        return this.__config;
    }
    meta(meta) {
        this.__meta = Object.assign(Object.assign({}, this._meta), meta);
        return this;
    }
    get _meta() {
        return this.__meta;
    }
    in(dir) {
        this.__in = (0, path_1.join)(dir);
        return this;
    }
    get _in() {
        return this.__in;
    }
    out(dir) {
        this.__out = (0, path_1.join)(dir);
        return this;
    }
    get _out() {
        return this.__out;
    }
    files(files) {
        this.__files = files;
        return this;
    }
    get _files() {
        return this.__files;
    }
    do(worker) {
        this.__workers.push(worker);
        return this;
    }
    get _workers() {
        return this.__workers;
    }
    getFileMimetype(filePath) {
        return new Promise((res, rej) => {
            magic.detectFile(filePath, (err, result) => {
                if (err)
                    rej(err);
                else
                    res(typeof result === 'string' ? result : result[0]);
            });
        });
    }
    getFiles(globPattern = (0, path_1.join)(this._in, '/**/*')) {
        return new Promise((res, rej) => {
            (0, glob_1.default)(globPattern, { nodir: true, dot: true }, (err, files) => {
                if (err)
                    rej(err);
                else
                    res(files);
            });
        });
    }
    parseFiles(files) {
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            const fileMimetype = yield this.getFileMimetype(file);
            const fileStats = yield fs_1.promises.stat(file);
            if (fileMimetype.startsWith('text/')
                || fileMimetype === 'inode/x-empty') {
                let rawFileContent = yield fs_1.promises.readFile(file, {
                    encoding: 'utf-8',
                });
                rawFileContent = this.handleTemplating(rawFileContent, this._config.templatingHandlerOptions || null, Object.assign(Object.assign({}, this._config), this._meta));
                const gmResult = (0, gray_matter_1.default)(rawFileContent);
                gmResult.content = this.handleTemplating(gmResult.content, this._config.templatingHandlerOptions || null, gmResult.data);
                return Object.assign(Object.assign({ path: file, content: gmResult.content, mimetype: fileMimetype }, gmResult.data), { stats: fileStats });
            }
            return { path: file, mimetype: fileMimetype, stats: fileStats };
        }));
        return Promise.all(promises);
    }
    generatePrettyUrls(files) {
        return files.map((file) => {
            if ((0, path_1.extname)(file.path) === '.html'
                && (0, path_1.basename)(file.path) !== 'index.html') {
                return Object.assign(Object.assign({}, file), { path: (0, path_1.join)((0, path_1.dirname)(file.path), (0, helpers_1.changeExtname)((0, path_1.basename)(file.path), ''), 'index.html') });
            }
            return file;
        });
    }
    write(files) {
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, path_1.join)(this._out, (0, helpers_1.removeParentFromPath)(this._in, file.path));
            const fileDir = (0, path_1.dirname)(filePath);
            if (!fs_1.default.existsSync(fileDir)) {
                yield fs_1.promises.mkdir(fileDir, { recursive: true });
            }
            if (file.mimetype.startsWith('text/')
                || file.mimetype === 'inode/x-empty'
                || file.mimetype === 'application/json') {
                yield fs_1.promises.writeFile(filePath, file.content || '');
            }
            else {
                yield fs_1.promises.copyFile(file.path, filePath);
            }
            yield fs_1.promises.writeFile('.timestamp', new Date().getTime().toString());
        }));
        return Promise.all(promises);
    }
    build(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._files && !(0, fs_1.existsSync)(this._in)) {
                (0, console_1.error)(`Input directory '${this._in}' does not exist.`);
                return;
            }
            (0, console_1.time)('Total build time');
            const defaultGlobPattern = (0, path_1.join)(this._in, '/**/*');
            const opts = Object.assign({ fullBuild: false, globPattern: defaultGlobPattern }, options);
            if (opts.fullBuild) {
                opts.globPattern = defaultGlobPattern;
                (0, console_1.time)(`Deleted '${this._out}' directory`);
                yield new Promise((resolve, reject) => (0, rimraf_1.default)(this._out, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve(0);
                }));
                (0, console_1.timeEnd)(`Deleted '${this._out}' directory`);
            }
            (0, console_1.time)('Files collected');
            const fileList = yield this.getFiles(opts.globPattern);
            (0, console_1.timeEnd)('Files collected');
            (0, console_1.time)('Files parsed');
            const fileObjects = this._files.filter((file) => (0, minimatch_1.default)(file.path, opts.globPattern || defaultGlobPattern));
            const parsedFiles = [
                ...fileObjects,
                ...(yield this.parseFiles(fileList)),
            ];
            (0, console_1.timeEnd)('Files parsed');
            yield this._workers.reduce((possiblePromise, worker) => __awaiter(this, void 0, void 0, function* () {
                const workerName = worker.name || 'unknown worker';
                yield Promise.resolve(possiblePromise);
                (0, console_1.log)(`Running ${workerName}...`);
                (0, console_1.time)(`Finished running ${workerName}`);
                yield worker(parsedFiles, this);
                (0, console_1.timeEnd)(`Finished running ${workerName}`);
            }), Promise.resolve());
            let toWrite = parsedFiles;
            if (this._config.prettyUrls) {
                (0, console_1.time)('Generated pretty URLs');
                toWrite = this.generatePrettyUrls(parsedFiles);
                (0, console_1.timeEnd)('Generated pretty URLs');
            }
            (0, console_1.time)('Files written');
            yield this.write(toWrite);
            (0, console_1.timeEnd)('Files written');
            (0, console_1.timeEnd)('Total build time');
        });
    }
}
exports.Lollygag = Lollygag;
process.on('unhandledRejection', (err) => {
    const msg = 'Build failed...';
    const dashes = '----------------------------------------';
    (0, console_1.log)((0, chalk_1.red)(`${dashes}\n${msg}\n${dashes}`));
    (0, console_1.error)(err);
    process.exit(43);
});
exports.default = Lollygag;
