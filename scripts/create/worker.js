const {existsSync, unlinkSync} = require('fs');
const {resolve, basename} = require('path');
const {default: Lollygag, handlebars} = require('../../packages/core/dist');

const workerName = process.argv[2];

if(!workerName) {
    console.log('No <workerName> provided');
    console.log(
        `Sample usage: ${basename(
            __filename
        )} <workerName> [--properName <properName>]`
    );
    console.log('Exiting...');
    process.exit(0);
}

const properNameIndex = process.argv.indexOf('--properName');

let properNameValue;

if(properNameIndex > -1) {
    properNameValue = process.argv[properNameIndex + 1];
}

const properName = properNameValue || workerName;

const indir = resolve(__dirname, '../seeds/worker');
const outdir = resolve(__dirname, `../../packages/${workerName}`);

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
