#!/usr/bin/env node

import {existsSync, unlinkSync} from 'fs';
import {join, resolve} from 'path';
import readline from 'readline';
import Lollygag, {RaggedyAny} from '@lollygag/core';
import handlebars from '@lollygag/handlebars';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'question',
});

function getProjectDir(msg?: string): Promise<string> {
    if(msg) console.log(msg);

    return new Promise((res) => {
        rl.question('Project directory: ', (dir) => {
            // eslint-disable-next-line no-negated-condition
            if(!dir) {
                res(getProjectDir('Directory name cannot be blank...'));
            } else if(
                !dir.match(/^[\w]([\w-]*[\w])*$/)
                || dir.indexOf('-_') !== -1
                || dir.indexOf('_-') !== -1
            ) {
                res(getProjectDir(`Invalid directory name... '${dir}'`));
            } else {
                res(dir);
            }
        });
    });
}

const defaultSiteName = 'Lollygag Site';

function getSiteName(): Promise<string> {
    return new Promise((res) => {
        rl.question(`Site name (${defaultSiteName}): `, (name) => {
            res(name);
        });
    });
}

const defaultSiteDescription = 'A Lollygag starter site.';

function getSiteDescription(): Promise<string> {
    return new Promise((res) => {
        rl.question(
            `Site description (${defaultSiteDescription}): `,
            (description) => {
                res(description);
            }
        );
    });
}

const defaultUseTs = true;

function getUseTs(msg?: string): Promise<boolean> {
    if(msg) console.log(msg);

    return new Promise((res) => {
        rl.question(`Use TypeScript? (${defaultUseTs}): `, (useTs) => {
            useTs.toLowerCase();

            const no = ['no', 'n', 'false'];
            const yes = ['yes', 'y', 'true'];
            const validValues = [...yes, ...no];

            // eslint-disable-next-line no-negated-condition
            if(useTs && !validValues.includes(useTs)) {
                let vals: string | string[] = [...validValues];
                const lastVal = vals.pop();

                vals = `${vals.join(', ')} and ${lastVal}`;

                res(getUseTs(`Valid values are ${vals}.`));
            } else {
                res(Boolean(useTs === '' || yes.includes(useTs)));
            }
        });
    });
}

(async function start() {
    const vars: Record<string, RaggedyAny> = {
        siteName: defaultSiteName,
        siteDescription: defaultSiteDescription,
        useTs: defaultUseTs,
    };

    interface ICreateOptions {
        aliases: string[];
        func: () => Promise<string | boolean>;
        returnType: 'string' | 'boolean';
        varToSet: 'siteName' | 'siteDescription' | 'useTs';
    }

    const options: Record<string, ICreateOptions> = {
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

    if(validOptions.includes(projectDirValue)) {
        projectDirValue = (await getProjectDir()).trim();
    }

    if(
        projectDirValue
        && (!projectDirValue.match(/^[\w]([\w-]*[\w])*$/)
            || projectDirValue.indexOf('-_') !== -1
            || projectDirValue.indexOf('_-') !== -1)
    ) {
        projectDirValue = (
            await getProjectDir(
                `Invalid directory name... '${projectDirValue}'`
            )
        ).trim();
    }

    const projectDir = join(projectDirValue || (await getProjectDir()).trim());

    if(existsSync(projectDir)) {
        console.log(`The directory '${projectDir}' exists. Exiting...`);
        process.exit(0);
    }

    for(let i = 0; i < validOptions.length; i++) {
        const opt = options[validOptions[i]];
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

        vars[opt.varToSet] = output.trim ? output.trim() : output;
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
        .out(projectDir)
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
