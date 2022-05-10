"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
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
const fs_1 = __importStar(require("fs"));
const console_1 = require("console");
const path_1 = require("path");
const front_matter_1 = __importDefault(require("front-matter"));
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
        year: new Date().getFullYear(),
        permalinks: true,
    }, __in = 'files', __out = 'public', __files = [], __workers = []) {
        this.__config = __config;
        this.__in = __in;
        this.__out = __out;
        this.__files = __files;
        this.__workers = __workers;
        console_1.log('Hello from Lollygag!');
    }
    config(config) {
        const c = config;
        if (c.subdir)
            c.subdir = path_1.join('/', c.subdir).replace(/\/$/, '');
        this.__config = Object.assign(Object.assign({}, this._config), c);
        return this;
    }
    get _config() {
        return this.__config;
    }
    in(dir) {
        this.__in = dir;
        return this;
    }
    get _in() {
        return this.__in;
    }
    out(dir) {
        this.__out = dir;
        return this;
    }
    get _out() {
        return this.__out;
    }
    subdir(dir) {
        this.__config.subdir = path_1.join('/', dir).replace(/\/$/, '');
        return this;
    }
    get _subdir() {
        return this.__config.subdir || '';
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
        return new Promise((resolve, reject) => {
            magic.detectFile(filePath, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(typeof result === 'string' ? result : result[0]);
            });
        });
    }
    getFiles(globPattern = path_1.join(this._in, '/**/*')) {
        return new Promise((resolve, reject) => {
            glob_1.default(globPattern, { nodir: true }, (err, files) => {
                if (err)
                    reject(err);
                else
                    resolve(files);
            });
        });
    }
    parseFiles(files) {
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            const fileMimetype = yield this.getFileMimetype(file);
            const fileStats = yield fs_1.promises.stat(file);
            if (fileMimetype.startsWith('text/')
                || fileMimetype === 'inode/x-empty') {
                return fs_1.promises
                    .readFile(file, { encoding: 'utf-8' })
                    .then((fileContent) => {
                    const fmResult = front_matter_1.default(fileContent);
                    return Object.assign({ path: file, content: fmResult.body, mimetype: fileMimetype, stats: fileStats }, fmResult.attributes);
                });
            }
            return { path: file, mimetype: fileMimetype };
        }));
        return Promise.all(promises);
    }
    write(files) {
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.join(this._out, helpers_1.removeParentFromPath(this._in, file.path));
            const fileDir = path_1.dirname(filePath);
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
    permalinks(files) {
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            if (path_1.extname(file.path) === '.html'
                && path_1.basename(file.path) !== 'index.html') {
                return Object.assign(Object.assign({}, file), { path: path_1.join(path_1.dirname(file.path), helpers_1.changeExtname(path_1.basename(file.path), ''), 'index.html') });
            }
            return file;
        }));
        return Promise.all(promises);
    }
    build(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console_1.time('Total build time');
            const defaultGlobPattern = path_1.join(this._in, '/**/*');
            const opts = Object.assign({ fullBuild: false, globPattern: defaultGlobPattern }, options);
            if (opts.fullBuild) {
                opts.globPattern = defaultGlobPattern;
                console_1.time(`Deleted \`${this._out}\` directory`);
                yield new Promise((resolve, reject) => rimraf_1.default(this._out, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve(0);
                }));
                console_1.timeEnd(`Deleted \`${this._out}\` directory`);
            }
            console_1.time('Getting files');
            const fileList = yield this.getFiles(opts.globPattern);
            console_1.timeEnd('Getting files');
            console_1.time('Parsing files');
            const fileObjects = this._files.filter((file) => minimatch_1.default(file.path, opts.globPattern || defaultGlobPattern));
            const parsedFiles = [
                ...fileObjects,
                ...(yield this.parseFiles(fileList)),
            ];
            console_1.timeEnd('Parsing files');
            yield this._workers.reduce((possiblePromise, worker) => __awaiter(this, void 0, void 0, function* () {
                const workerName = worker.name || 'unknown worker';
                yield Promise.resolve(possiblePromise);
                console_1.time(`Running ${workerName}`);
                yield worker(parsedFiles, this);
                console_1.timeEnd(`Running ${workerName}`);
            }), Promise.resolve());
            let toWrite = parsedFiles;
            if (this._config.permalinks) {
                console_1.time('Building permalinks');
                toWrite = yield this.permalinks(parsedFiles);
                console_1.timeEnd('Building permalinks');
            }
            console_1.time('Writing files');
            yield this.write(toWrite);
            console_1.timeEnd('Writing files');
            console_1.timeEnd('Total build time');
        });
    }
}
process.on('unhandledRejection', (err) => {
    const msg = 'Build failed...';
    const dashes = '----------------------------------------';
    console_1.log(chalk_1.red(`${dashes}\n${msg}\n${dashes}`));
    console_1.error(err);
});
exports.default = Lollygag;
