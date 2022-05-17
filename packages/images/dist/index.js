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
const jimp_1 = __importDefault(require("jimp"));
function images(options) {
    return function imagesWorker(files, lollygag) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                if (!file.mimetype.startsWith('image'))
                    return;
                console.log(`Processing ${file.path}...`);
                yield jimp_1.default.read(file.path).then((img) => {
                    img.quality(75).resize(1200, jimp_1.default.AUTO).write(file.path);
                });
                console.log(`Processing ${file.path}... done!`);
            }));
            yield Promise.all(promises);
        });
    };
}
exports.default = images;
