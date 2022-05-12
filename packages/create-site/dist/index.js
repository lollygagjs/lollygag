#!/usr/bin/env node
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
const fs_1 = require("fs");
const path_1 = require("path");
const readline_1 = __importDefault(require("readline"));
const core_1 = __importDefault(require("@lollygag/core"));
const handlebars_1 = __importDefault(require("@lollygag/handlebars"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'question',
});
function getProjectDir(msg) {
    if (msg)
        console.log(msg);
    return new Promise((res) => {
        rl.question('Project directory: ', (dir) => {
            // eslint-disable-next-line no-negated-condition
            if (!dir) {
                res(getProjectDir('Directory name cannot be blank...'));
            }
            else if (!dir.match(/^[\w]([\w-]*[\w])*$/)
                || dir.indexOf('-_') !== -1
                || dir.indexOf('_-') !== -1) {
                res(getProjectDir(`Invalid directory name... '${dir}'`));
            }
            else {
                res(dir);
            }
        });
    });
}
const defaultSiteName = 'Lollygag Site';
function getSiteName() {
    return new Promise((res) => {
        rl.question(`Site name (${defaultSiteName}): `, (name) => {
            res(name);
        });
    });
}
const defaultSiteDescription = 'A Lollygag starter site.';
function getSiteDescription() {
    return new Promise((res) => {
        rl.question(`Site description (${defaultSiteDescription}): `, (description) => {
            res(description);
        });
    });
}
const defaultUseTs = true;
function getUseTs(msg) {
    if (msg)
        console.log(msg);
    return new Promise((res) => {
        rl.question(`Use TypeScript? (${defaultUseTs}): `, (useTs) => {
            useTs.toLowerCase();
            const no = ['no', 'n', 'false'];
            const yes = ['yes', 'y', 'true'];
            const validValues = [...yes, ...no];
            // eslint-disable-next-line no-negated-condition
            if (useTs && !validValues.includes(useTs)) {
                let vals = [...validValues];
                const lastVal = vals.pop();
                vals = `${vals.join(', ')} and ${lastVal}`;
                res(getUseTs(`Valid values are ${vals}.`));
            }
            else {
                res(Boolean(useTs === '' || yes.includes(useTs)));
            }
        });
    });
}
(function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const vars = {
            siteName: defaultSiteName,
            siteDescription: defaultSiteDescription,
            useTs: defaultUseTs,
        };
        const options = {
            '--name': {
                aliases: ['-n'],
                func: getSiteName,
                returnType: 'string',
                varToSet: 'siteName',
            },
            '--description': {
                aliases: ['-d'],
                func: getSiteDescription,
                returnType: 'string',
                varToSet: 'siteDescription',
            },
            '--ts': {
                aliases: ['-t'],
                func: getUseTs,
                returnType: 'boolean',
                varToSet: 'useTs',
            },
        };
        const validOptions = Object.keys(options).map((key) => key);
        const aliases = Object.keys(options)
            .map((key) => options[key].aliases)
            .flat();
        const validOptionsAndAliases = [...validOptions, ...aliases];
        console.log(validOptions);
        console.log(aliases);
        let projectDirValue = process.argv[2];
        if (validOptions.includes(projectDirValue)) {
            projectDirValue = (yield getProjectDir()).trim();
        }
        if (projectDirValue
            && (!projectDirValue.match(/^[\w]([\w-]*[\w])*$/)
                || projectDirValue.indexOf('-_') !== -1
                || projectDirValue.indexOf('_-') !== -1)) {
            projectDirValue = (yield getProjectDir(`Invalid directory name... '${projectDirValue}'`)).trim();
        }
        const projectDir = (0, path_1.join)(projectDirValue || (yield getProjectDir()).trim());
        if ((0, fs_1.existsSync)(projectDir)) {
            console.log(`The directory '${projectDir}' exists. Exiting...`);
            process.exit(0);
        }
        for (let i = 0; i < validOptions.length; i++) {
            const opt = options[validOptions[i]];
            const idx = process.argv.indexOf(validOptions[i]);
            let val;
            if (idx > -1) {
                if (opt.returnType === 'string') {
                    val = validOptions.includes(process.argv[idx + 1])
                        ? ''
                        : process.argv[idx + 1];
                }
                if (opt.returnType === 'boolean')
                    val = true;
            }
            // eslint-disable-next-line no-await-in-loop
            const output = val || (yield opt.func()) || vars[opt.varToSet];
            vars[opt.varToSet] = output.trim ? output.trim() : output;
        }
        const packageName = vars.siteName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        yield new core_1.default()
            .config({
            siteName: vars.siteName,
            siteDescription: vars.siteDescription,
            packageName,
        })
            .in((0, path_1.resolve)(__dirname, '../', (0, path_1.join)('structures', vars.useTs ? 'ts' : 'js')))
            .out(projectDir)
            .do((0, handlebars_1.default)({
            newExtname: false,
            targetExtnames: ['.json', '.ts', '.md'],
        }))
            .build();
        (0, fs_1.unlinkSync)('.timestamp');
        process.exit(0);
    });
}());
