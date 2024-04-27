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
exports.livedev = void 0;
const path_1 = require("path");
const http_1 = __importDefault(require("http"));
const console_1 = require("console");
const chokidar_1 = require("chokidar");
const chalk_1 = require("chalk");
const minimatch_1 = require("minimatch");
const serve_handler_1 = __importDefault(require("serve-handler"));
const livereload_1 = __importDefault(require("livereload"));
const node_html_parser_1 = require("node-html-parser");
const __1 = require("../..");
function rebuild(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { triggeredPath, eventSuffix, lollygag, watchOptions } = options;
        const msg = `File \`${triggeredPath}\` ${eventSuffix}.\nRebuilding...`;
        const dashes = '----------------------------------------';
        (0, console_1.log)((0, chalk_1.green)(`${dashes}\n${msg}\n${dashes}`));
        let globPattern = null;
        if (!watchOptions.fullBuild) {
            let toRebuild = true;
            Object.keys(watchOptions.patterns).forEach((patternKey) => {
                if ((0, minimatch_1.minimatch)(triggeredPath, patternKey)) {
                    toRebuild = watchOptions.patterns[patternKey];
                }
            });
            let validTriggeredPath = '';
            if ((0, minimatch_1.minimatch)(triggeredPath, (0, path_1.join)(lollygag._in, '**/*'))) {
                validTriggeredPath = (0, __1.removeParentFromPath)(lollygag._in, triggeredPath);
            }
            if (typeof toRebuild === 'boolean') {
                globPattern = validTriggeredPath;
            }
            else {
                globPattern = toRebuild;
            }
        }
        yield lollygag.build({
            fullBuild: watchOptions.fullBuild,
            globPattern,
        });
    });
}
let serverStarted = false;
function livedev(options) {
    return function livedevWorker(files, lollygag) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const serverPort = (_a = options.serverPort) !== null && _a !== void 0 ? _a : 3000;
            const livereloadHost = (_b = options.livereloadHost) !== null && _b !== void 0 ? _b : 'localhost';
            const livereloadPort = (_c = options.livereloadPort) !== null && _c !== void 0 ? _c : 35729;
            if (options.injectLivereloadScript) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if ((0, path_1.extname)(file.path) !== '.html')
                        continue;
                    const doc = (0, node_html_parser_1.parse)((_d = file.content) !== null && _d !== void 0 ? _d : '');
                    const body = doc.querySelector('body');
                    if (!body)
                        continue;
                    const script = (0, node_html_parser_1.parse)(`<script src='http://${livereloadHost}:${livereloadPort}/livereload.js'></script>`);
                    body.appendChild(script);
                    file.content = doc.toString();
                }
            }
            if (serverStarted)
                return;
            serverStarted = true;
            const staticDir = (0, path_1.resolve)(lollygag._out);
            const server = http_1.default.createServer((req, res) => (0, serve_handler_1.default)(req, res, {
                public: staticDir,
                cleanUrls: true,
            }));
            yield new Promise((ok) => {
                server.listen(serverPort, () => {
                    (0, console_1.log)((0, chalk_1.green)(`Server running at port ${serverPort}`));
                    ok(null);
                });
            });
            yield new Promise((ok) => {
                livereload_1.default
                    .createServer({ port: livereloadPort }, () => {
                    (0, console_1.log)((0, chalk_1.green)(`Livereload server running at port ${livereloadPort}`));
                    ok(null);
                })
                    .watch([staticDir, (0, path_1.resolve)('.timestamp')]);
            });
            const toWatch = [];
            Object.keys(options.patterns).forEach((pattern) => {
                toWatch.push(pattern);
            });
            const watched = (0, chokidar_1.watch)(toWatch, { ignoreInitial: true });
            function onAddOrChange(path) {
                return __awaiter(this, void 0, void 0, function* () {
                    watched.off('add', onAddOrChange);
                    watched.off('change', onAddOrChange);
                    yield rebuild({
                        eventSuffix: 'changed',
                        triggeredPath: path,
                        watchOptions: options,
                        lollygag,
                    });
                    watched.on('add', onAddOrChange);
                    watched.on('change', onAddOrChange);
                });
            }
            watched.on('add', onAddOrChange);
            watched.on('change', onAddOrChange);
        });
    };
}
exports.livedev = livedev;
exports.default = livedev;
