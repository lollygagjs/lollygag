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
const terser_1 = __importDefault(require("terser"));
const __1 = require("../..");
function terser(options) {
    return function terserWorker(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const defaultExtname = '.js';
            const { minifyOptions, newExtname = defaultExtname, targetExtnames = ['.js'], keepOriginal = true, } = options !== null && options !== void 0 ? options : {};
            const makeNewFile = keepOriginal && newExtname !== defaultExtname;
            const promises = files.map((f) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let file = f;
                if (makeNewFile)
                    file = (0, __1.deepCopy)(f);
                if (!targetExtnames.includes((0, path_1.extname)(file.path))
                    || (0, __1.fullExtname)(file.path).endsWith('.min.js')) {
                    return;
                }
                let filePath = file.path;
                if (newExtname !== false) {
                    filePath = (0, __1.changeExtname)(file.path, newExtname);
                }
                const { code } = yield terser_1.default.minify((_a = file.content) !== null && _a !== void 0 ? _a : '', minifyOptions);
                file.path = filePath;
                file.content = code;
                if (makeNewFile)
                    files.push(file);
            }));
            yield Promise.all(promises);
        });
    };
}
exports.default = terser;
