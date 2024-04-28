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
exports.worker = void 0;
const path_1 = require("path");
const postcss_1 = __importDefault(require("postcss"));
const __1 = require("../..");
function worker(options) {
    return function postcssWorker(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const defaultExtname = '.css';
            const { newExtname = defaultExtname, targetExtnames = ['.css', '.pcss'], keepOriginal = true, plugins, processOptions, } = options !== null && options !== void 0 ? options : {};
            const makeNewFile = keepOriginal && newExtname !== defaultExtname;
            const promises = files.map((f) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let file = f;
                if (makeNewFile)
                    file = (0, __1.deepCopy)(f);
                if (!targetExtnames.includes((0, path_1.extname)(file.path))
                    || (0, __1.fullExtname)(file.path).endsWith('.min.css')) {
                    return;
                }
                const existingSourcemap = files.find((x) => x.path === (0, path_1.join)(`${f.path}.map`));
                let filePath = file.path;
                if (newExtname !== false) {
                    filePath = (0, __1.changeExtname)(file.path, newExtname);
                }
                const result = yield (0, postcss_1.default)(plugins).process((_a = file.content) !== null && _a !== void 0 ? _a : '', Object.assign({ from: f.path, to: filePath, map: {
                        inline: false,
                        prev: existingSourcemap ? existingSourcemap.content : false,
                    } }, processOptions));
                file.path = filePath;
                file.content = result.css;
                if (makeNewFile)
                    files.push(file);
                if (result.map) {
                    if (newExtname) {
                        if (!keepOriginal && existingSourcemap) {
                            existingSourcemap.path = (0, path_1.join)(`${filePath}.map`);
                            existingSourcemap.content = result.map.toString();
                        }
                        else {
                            files.push({
                                path: (0, path_1.join)(`${filePath}.map`),
                                content: result.map.toString(),
                                mimetype: 'application/json',
                            });
                        }
                    }
                    else if (existingSourcemap) {
                        existingSourcemap.content = result.map.toString();
                    }
                    else {
                        files.push({
                            path: (0, path_1.join)(`${filePath}.map`),
                            content: result.map.toString(),
                            mimetype: 'application/json',
                        });
                    }
                }
            }));
            yield Promise.all(promises);
        });
    };
}
exports.worker = worker;
exports.default = worker;
