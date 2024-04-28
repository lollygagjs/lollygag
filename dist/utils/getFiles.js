"use strict";
// import {join} from 'path';
// import {glob} from 'glob';
// import Lollygag from '..';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// export default async function getFiles(
//     this: Lollygag,
//     globPattern = join(this._in, '/**/*')
// ): Promise<string[]> {
//     return glob(globPattern, {nodir: true, dot: true});
// }
const path_1 = require("path");
const glob_1 = require("glob");
function getFiles() {
    return __awaiter(this, arguments, void 0, function* (globPatterns = [
        (0, path_1.join)(this._contentDir, '/**/*'),
        (0, path_1.join)(this._staticDir, '/**/*'),
    ]) {
        const promises = globPatterns.map((pattern) => (0, glob_1.glob)(pattern, { nodir: true, dot: true }));
        const filesArrays = yield Promise.all(promises);
        return filesArrays.flat();
    });
}
exports.default = getFiles;
