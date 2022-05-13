#!/usr/bin/env node

import {existsSync, unlinkSync} from 'fs';
import {join, resolve} from 'path';
import {spawn} from 'child_process';
import readline from 'readline';
import Lollygag from '@lollygag/core';
import handlebars from '@lollygag/handlebars';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const qPrefix = '\x1b[36mquestion\x1b[0m';
const wPrefix = '\x1b[33mwarning \x1b[0m';

type TGetOptionCallback = (
    answer: string,
    // eslint-disable-next-line no-use-before-define
    func?: typeof getOption
) => string | Promise<string> | boolean;

function getOption(
    question: string,
    message: string | null,
    callback: TGetOptionCallback
): Promise<string> {
    if(message) console.log(message);

    console.log(callback.name);

    return new Promise((res) => {
        rl.question(question, async(answer) => {
            // eslint-disable-next-line callback-return
            res(callback(answer, getOption) as string | Promise<string>);
        });
    });
}

const defaultProjectDir = '';
const getProjectDirQuestion = `${qPrefix} Project directory: `;

function getProjectDir(dir: string, func?: typeof getOption) {
    let result;

    // eslint-disable-next-line no-negated-condition
    if(!dir) {
        result = `${wPrefix} Directory name cannot be blank`;
    } else if(
        !dir.match(/^[\w]([\w-]*[\w])*$/)
        || dir.indexOf('-_') !== -1
        || dir.indexOf('_-') !== -1
    ) {
        result = `${wPrefix} Invalid directory name... '${dir}'`;
    } else if(existsSync(dir)) {
        result = `${wPrefix} The directory '${dir}' exists`;
    } else {
        result = dir;
    }

    return func && result !== dir
        ? func(getProjectDirQuestion, result, getProjectDir)
        : result;
}

const defaultSiteName = 'Lollygag Site';
const getSiteNameQuestion = `${qPrefix} Site name (${defaultSiteName}): `;

const getSiteName = (name: string) => name;

const defaultSiteDescription = 'A Lollygag starter site.';
const getSiteDescriptionQuestion = `${qPrefix} Site description (${defaultSiteDescription}): `;

const getSiteDescription = (description: string) => description;

const defaultUseTs = true;
const getUseTsQuestion = `${qPrefix} Use TypeScript? (${defaultUseTs}): `;

function getUseTs(useTs: string, func?: typeof getOption) {
    let result;

    useTs.toLowerCase();

    const no = ['no', 'n', 'false'];
    const yes = ['yes', 'y', 'true'];
    const validValues = [...yes, ...no];

    // eslint-disable-next-line no-negated-condition
    if(useTs && !validValues.includes(useTs)) {
        let vals: string | string[] = [...validValues];
        const lastVal = vals.pop();

        vals = `${vals.join(', ')} and ${lastVal}`;

        result = `${wPrefix} Valid values are ${vals}`;
    } else {
        result = useTs === '' || yes.includes(useTs);
    }

    return func && typeof result === 'string'
        ? func(getUseTsQuestion, result, getUseTs)
        : result;
}

(async function start() {
    const vars = {
        siteName: defaultSiteName,
        siteDescription: defaultSiteDescription,
        useTs: defaultUseTs,
        projectDir: defaultProjectDir,
    };

    type TOptionVars = keyof typeof vars;

    interface ICreateOptions {
        callback: TGetOptionCallback;
        question: string;
        varToSet: TOptionVars;
        returnType: 'string' | 'boolean';
    }

    const options: Record<string, ICreateOptions> = {
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
            returnType: 'boolean',
        },
        '--typescript': {
            callback: getUseTs,
            question: getUseTsQuestion,
            varToSet: 'useTs',
            returnType: 'boolean',
        },
    };

    const validOptions = Object.keys(options).map((key) => key);
    const skips: TOptionVars[] = [];

    for(let i = 0; i < validOptions.length; i++) {
        const opt = options[validOptions[i]];

        // eslint-disable-next-line no-continue
        if(skips.includes(opt.varToSet)) continue;

        const idx = process.argv.indexOf(validOptions[i]);

        let val: string | boolean = '';

        if(idx > -1) {
            if(opt.returnType === 'string') {
                val = validOptions.includes(process.argv[idx + 1])
                    ? ''
                    : process.argv[idx + 1];
            }

            if(opt.returnType === 'boolean') val = true;

            const checkedVal = opt.callback(val?.toString());

            if(checkedVal.toString() !== val) {
                val = '';
                console.log(checkedVal);
            }
        }

        const output
            = val
            // eslint-disable-next-line no-await-in-loop
            || (await getOption(opt.question, null, opt.callback))
            || vars[opt.varToSet];

        (vars[opt.varToSet] as string | boolean)
            = typeof output === 'string' ? output.trim() : output;

        skips.push(opt.varToSet);
    }

    const packageName = vars.siteName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    await new Lollygag()
        .config({
            siteName: vars.siteName,
            siteDescription: vars.siteDescription,
            packageName,
        })
        .in(
            resolve(
                __dirname,
                '../',
                join('structures', vars.useTs ? 'ts' : 'js')
            )
        )
        .out(vars.projectDir)
        .do(
            handlebars({
                newExtname: false,
                targetExtnames: ['.json', '.ts', '.md'],
            })
        )
        .build();

    unlinkSync('.timestamp');

    process.exit(0);
}());
