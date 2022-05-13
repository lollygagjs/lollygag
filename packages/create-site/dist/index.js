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
});
const qPrefix = '\x1b[36mquestion\x1b[0m';
const wPrefix = '\x1b[33mwarning \x1b[0m';
const defaultProjectDir = '';
function getProjectDir(msg) {
    if (msg)
        console.log(msg);
    return new Promise((res) => {
        rl.question(`${qPrefix} Project directory: `, (dir) => {
            // eslint-disable-next-line no-negated-condition
            if (!dir) {
                res(getProjectDir(`${wPrefix} Directory name cannot be blank`));
            }
            else if (!dir.match(/^[\w]([\w-]*[\w])*$/)
                || dir.indexOf('-_') !== -1
                || dir.indexOf('_-') !== -1) {
                res(getProjectDir(`${wPrefix} Invalid directory name... '${dir}'`));
            }
            else if ((0, fs_1.existsSync)(dir)) {
                res(getProjectDir(`${wPrefix} The directory '${dir}' exists`));
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
        rl.question(`${qPrefix} Site name (${defaultSiteName}): `, (name) => {
            res(name);
        });
    });
}
const defaultSiteDescription = 'A Lollygag starter site.';
function getSiteDescription() {
    return new Promise((res) => {
        rl.question(`${qPrefix} Site description (${defaultSiteDescription}): `, (description) => { res(description); });
    });
}
const defaultUseTs = true;
function getUseTs(msg) {
    if (msg)
        console.log(msg);
    return new Promise((res) => {
        rl.question(`${qPrefix} Use TypeScript? (${defaultUseTs}): `, (useTs) => {
            useTs.toLowerCase();
            const no = ['no', 'n', 'false'];
            const yes = ['yes', 'y', 'true'];
            const validValues = [...yes, ...no];
            // eslint-disable-next-line no-negated-condition
            if (useTs && !validValues.includes(useTs)) {
                let vals = [...validValues];
                const lastVal = vals.pop();
                vals = `${vals.join(', ')} and ${lastVal}`;
                res(getUseTs(`${wPrefix} Valid values are ${vals}`));
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
            projectDir: defaultProjectDir,
        };
        const options = {
            '-p': {
                func: getProjectDir,
                returnType: 'string',
                varToSet: 'projectDir',
            },
            '--projectdir': {
                func: getProjectDir,
                returnType: 'string',
                varToSet: 'projectDir',
            },
            '-n': {
                func: getSiteName,
                returnType: 'string',
                varToSet: 'siteName',
            },
            '--name': {
                func: getSiteName,
                returnType: 'string',
                varToSet: 'siteName',
            },
            '-d': {
                func: getSiteDescription,
                returnType: 'string',
                varToSet: 'siteDescription',
            },
            '--description': {
                func: getSiteDescription,
                returnType: 'string',
                varToSet: 'siteDescription',
            },
            '-t': {
                func: getUseTs,
                returnType: 'boolean',
                varToSet: 'useTs',
            },
            '--typescript': {
                func: getUseTs,
                returnType: 'boolean',
                varToSet: 'useTs',
            },
        };
        const validOptions = Object.keys(options).map((key) => key);
        const skips = [];
        for (let i = 0; i < validOptions.length; i++) {
            const opt = options[validOptions[i]];
            // eslint-disable-next-line no-continue
            if (skips.includes(opt.varToSet))
                continue;
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
            vars[opt.varToSet]
                = typeof output === 'string' ? output.trim() : output;
            skips.push(opt.varToSet);
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
            .out(vars.projectDir)
            .do((0, handlebars_1.default)({
            newExtname: false,
            targetExtnames: ['.json', '.ts', '.md'],
        }))
            .build();
        (0, fs_1.unlinkSync)('.timestamp');
        process.exit(0);
    });
}());
