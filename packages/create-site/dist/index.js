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
const child_process_1 = require("child_process");
const readline_1 = __importDefault(require("readline"));
const ncp_1 = __importDefault(require("ncp"));
const core_1 = __importDefault(require("@lollygag/core"));
const handlebars_1 = __importDefault(require("@lollygag/handlebars"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const qPrefix = '\x1b[36mquestion\x1b[0m';
const wPrefix = '\x1b[33mwarning \x1b[0m';
function getOption(question, message, callback) {
    if (message)
        console.log(message);
    return new Promise((res) => {
        rl.question(question, (answer) => __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line callback-return
            res(callback(answer, getOption));
        }));
    });
}
const defaultProjectDir = '';
const getProjectDirQuestion = `${qPrefix} Project directory: `;
function getProjectDir(dir, func) {
    let result;
    // eslint-disable-next-line no-negated-condition
    if (!dir) {
        result = `${wPrefix} Directory name cannot be blank`;
    }
    else if (!dir.match(/^[\w]([\w-]*[\w])*$/)
        || dir.indexOf('-_') !== -1
        || dir.indexOf('_-') !== -1) {
        result = `${wPrefix} Invalid directory name... '${dir}'`;
    }
    else if ((0, fs_1.existsSync)(dir)) {
        result = `${wPrefix} The directory '${dir}' exists`;
    }
    else {
        result = dir;
    }
    return func && result !== dir
        ? func(getProjectDirQuestion, result, getProjectDir)
        : result;
}
const defaultSiteName = 'Lollygag Site';
const getSiteNameQuestion = `${qPrefix} Site name (${defaultSiteName}): `;
const getSiteName = (name) => name;
const defaultSiteDescription = 'A Lollygag starter site.';
const getSiteDescriptionQuestion = `${qPrefix} Site description (${defaultSiteDescription}): `;
const getSiteDescription = (description) => description;
const defaultUseTs = 'yes';
const getUseTsQuestion = `${qPrefix} Use TypeScript? (${defaultUseTs}): `;
function getUseTs(useTs, func) {
    let result;
    useTs.toLowerCase();
    const no = ['no', 'n', 'false'];
    const yes = ['yes', 'y', 'true'];
    const validValues = [...yes, ...no];
    // eslint-disable-next-line no-negated-condition
    if (useTs && !validValues.includes(useTs)) {
        let vals = [...validValues];
        const lastVal = vals.pop();
        vals = `${vals.join(', ')} and ${lastVal}`;
        result = `${wPrefix} Valid values are ${vals}`;
    }
    else {
        result = useTs === '' || yes.includes(useTs) ? 'yes' : 'no';
    }
    return func && !['yes', 'no'].includes(result)
        ? func(getUseTsQuestion, result, getUseTs)
        : result;
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
                callback: getProjectDir,
                question: getProjectDirQuestion,
                varToSet: 'projectDir',
                returnType: 'string',
            },
            '--projectdir': {
                callback: getProjectDir,
                question: getProjectDirQuestion,
                varToSet: 'projectDir',
                returnType: 'string',
            },
            '-n': {
                callback: getSiteName,
                question: getSiteNameQuestion,
                varToSet: 'siteName',
                returnType: 'string',
            },
            '--name': {
                callback: getSiteName,
                question: getSiteNameQuestion,
                varToSet: 'siteName',
                returnType: 'string',
            },
            '-d': {
                callback: getSiteDescription,
                question: getSiteDescriptionQuestion,
                varToSet: 'siteDescription',
                returnType: 'string',
            },
            '--description': {
                callback: getSiteDescription,
                question: getSiteDescriptionQuestion,
                varToSet: 'siteDescription',
                returnType: 'string',
            },
            '-t': {
                callback: getUseTs,
                question: getUseTsQuestion,
                varToSet: 'useTs',
                returnType: 'boolstring',
            },
            '--typescript': {
                callback: getUseTs,
                question: getUseTsQuestion,
                varToSet: 'useTs',
                returnType: 'boolstring',
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
            let val = '';
            if (idx > -1) {
                if (opt.returnType === 'string') {
                    val = validOptions.includes(process.argv[idx + 1])
                        ? ''
                        : process.argv[idx + 1];
                }
                if (opt.returnType === 'boolstring')
                    val = 'yes';
                const checkedVal = opt.callback(val);
                if (checkedVal !== val) {
                    val = '';
                    console.log(checkedVal);
                }
            }
            // eslint-disable-next-line require-atomic-updates
            vars[opt.varToSet]
                = val
                    // eslint-disable-next-line no-await-in-loop
                    || (yield getOption(opt.question, null, opt.callback))
                    || vars[opt.varToSet].trim();
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
            .in((0, path_1.resolve)(__dirname, '../', (0, path_1.join)('structures', vars.useTs === 'yes' ? 'ts' : 'js')))
            .out(vars.projectDir)
            .do((0, handlebars_1.default)({
            newExtname: false,
            targetExtnames: ['.json', '.ts', '.md', '.js'],
        }))
            .build();
        (0, fs_1.unlinkSync)('.timestamp');
        yield new Promise((res, rej) => {
            (0, ncp_1.default)((0, path_1.resolve)(__dirname, '../', (0, path_1.join)('structures', 'universal')), vars.projectDir, (err) => {
                if (err)
                    rej(err);
                res(null);
            });
        });
        const yarnVersion = (0, child_process_1.spawnSync)('yarn --version', {
            shell: true,
        })
            .stdout.toString()
            .trim();
        const packageManager = yarnVersion ? 'yarn' : 'npm';
        const installCommand = yarnVersion ? 'yarn' : 'npm install';
        const install = (0, child_process_1.spawn)(`cd ${vars.projectDir} && ${installCommand}`, {
            shell: true,
        });
        install.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });
        install.on('exit', (exitCode) => {
            console.log();
            console.log('--------------------------------------------');
            console.log();
            console.log('Your new Lollygag site is ready.');
            console.log();
            console.log('Next steps:');
            console.log();
            console.log(`$ cd ${vars.projectDir}`);
            console.log(`$ ${packageManager} start`);
            console.log();
            console.log('This would start a live dev server at');
            console.log('http://localhost:3000. For more info, check');
            console.log('out the docs: https://lollygag.github.io');
            console.log();
            console.log('Happy building!');
            console.log();
            console.log('--------------------------------------------');
            console.log();
            process.exit(exitCode || 0);
        });
    });
}());
