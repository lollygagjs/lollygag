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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = require("path");
const __1 = require("..");
function writeFiles(files) {
    const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        /**
         * Change `file.path` to final output path.
         */
        const filePath = (0, path_1.join)(this._out, 
        // TODO: Ooooooh
        (0, __1.removeUpToParentFromPath)(this._in, file.path));
        console.log(filePath);
        const fileDir = (0, path_1.dirname)(filePath);
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
exports.default = writeFiles;
