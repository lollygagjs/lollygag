#!/usr/bin/env node

import {existsSync, unlinkSync} from 'fs';
import {join, resolve} from 'path';
import readline from 'readline';
import Lollygag from '@lollygag/core';
import handlebars from '@lollygag/handlebars';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const qPrefix = '\x1b[36mquestion\x1b[0m';
const wPrefix = '\x1b[33mwarning \x1b[0m';

const defaultProjectDir = '';

function getProjectDir(msg?: string): Promise<string> {
    if(msg) console.log(msg);

    return new Promise((res) => {
        rl.question(`${qPrefix} Project directory: `, (dir) => {
            // eslint-disable-next-line no-negated-condition
            if(!dir) {
                res(getProjectDir(`${wPrefix} Directory name cannot be blank`));
            } else if(
                !dir.match(/^[\w]([\w-]*[\w])*$/)
                || dir.indexOf('-_') !== -1
                || dir.indexOf('_-') !== -1
            ) {
                res(
                    getProjectDir(
                        `${wPrefix} Invalid directory name... '${dir}'`
                    )
                );
            } else if(existsSync(dir)) {
                res(getProjectDir(`${wPrefix} The directory '${dir}' exists`));
            } else {
                res(dir);
            }
        });
    });
}

const defaultSiteName = 'Lollygag Site';

function getSiteName(): Promise<string> {
    return new Promise((res) => {
        rl.question(`${qPrefix} Site name (${defaultSiteName}): `, (name) => {
            res(name);
        });
    });
}

const defaultSiteDescription = 'A Lollygag starter site.';

function getSiteDescription(): Promise<string> {
    return new Promise((res) => {
        rl.question(
            `${qPrefix} Site description (${defaultSiteDescription}): `,
            (description) => { res(description); }
        );
    });
}

const defaultUseTs = true;

function getUseTs(msg?: string): Promise<boolean> {
    if(msg) console.log(msg);

    return new Promise((res) => {
        rl.question(
            `${qPrefix} Use TypeScript? (${defaultUseTs}): `,
            (useTs) => {
                useTs.toLowerCase();

                const no = ['no', 'n', 'false'];
                const yes = ['yes', 'y', 'true'];
                const validValues = [...yes, ...no];

                // eslint-disable-next-line no-negated-condition
                if(useTs && !validValues.includes(useTs)) {
                    let vals: string | string[] = [...validValues];
                    const lastVal = vals.pop();

                    vals = `${vals.join(', ')} and ${lastVal}`;

                    res(getUseTs(`${wPrefix} Valid values are ${vals}`));
                } else {
                    res(Boolean(useTs === '' || yes.includes(useTs)));
                }
            }
        );
    });
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
        func: () => Promise<string | boolean>;
        returnType: 'string' | 'boolean';
        varToSet: TOptionVars;
    }

    const options: Record<string, ICreateOptions> = {
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
    const skips: TOptionVars[] = [];

    for(let i = 0; i < validOptions.length; i++) {
        const opt = options[validOptions[i]];

        // eslint-disable-next-line no-continue
        if(skips.includes(opt.varToSet)) continue;

        const idx = process.argv.indexOf(validOptions[i]);

        let val;

        if(idx > -1) {
            if(opt.returnType === 'string') {
                val = validOptions.includes(process.argv[idx + 1])
                    ? ''
                    : process.argv[idx + 1];
            }

            if(opt.returnType === 'boolean') val = true;
        }

        // eslint-disable-next-line no-await-in-loop
        const output = val || (await opt.func()) || vars[opt.varToSet];

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
