import {existsSync, unlinkSync} from 'fs';
import {resolve, relative} from 'path';
import {default as Lollygag, handlebars} from '../packages/core';

const workerName = process.argv[2];
const scriptPath = relative(process.cwd(), __filename);

if(!workerName) {
    console.log(`Usage: 'node ${scriptPath} [workername]'`);
    console.log('No [workername] provided. Exiting...');
    process.exit(0);
}

const properNameIndex = process.argv.indexOf('--properName');

let properNameValue;

if(properNameIndex > -1) {
    properNameValue = process.argv[properNameIndex + 1];
}

const properName = properNameValue || workerName;

const indir = resolve(__dirname, './seeds/worker');
const outdir = resolve(__dirname, `../packages/${workerName}`);

if(existsSync(outdir)) {
    console.log(`Directory '${outdir}' exists. Exiting...`);
    process.exit(0);
}

new Lollygag()
    .meta({workerName, properName})
    .in(indir)
    .out(outdir)
    .do(
        handlebars({
            newExtname: false,
            targetExtnames: ['.ts', '.json', '.md'],
        })
    )
    .build();

unlinkSync('.timestamp');
