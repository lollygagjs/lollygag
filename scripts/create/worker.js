const {existsSync} = require('fs');
const {resolve, basename} = require('path');
const {default: Lollygag, handlebars} = require('../../packages/core/dist');

const workerName = process.argv[2];

if(!workerName) {
    console.log('No <workerName> provided.');
    console.log(
        `Sample usage: ${basename(
            __filename
        )} <workerName> [--properName <properName>] [--dryRun]`
    );
    console.log('Exiting...');
    process.exit(0);
}

const dryRunIndex = process.argv.indexOf('--dryRun');
const properNameIndex = process.argv.indexOf('--properName');

const isDryRun = dryRunIndex > -1;
const properName
    = properNameIndex > -1 ? process.argv[properNameIndex + 1] : workerName;

const indir = resolve(__dirname, '../seeds/worker');
const outdir = resolve(__dirname, `../../packages/${workerName}`);

if(existsSync(outdir)) {
    console.log(`Directory '${outdir}' exists. Exiting...`);
    process.exit(0);
}

if(isDryRun) {
    console.log('Doing a dry run...');
    console.log("Here's a sample rundown of actions to be perfomed:");
    console.log(`* Copy files from '${indir}' to '${outdir}'.`);
    console.log('* Do handlebars template processing.');
} else {
    console.log('Executing build...');

    new Lollygag()
        .config({
            prettyUrls: false,
            generateTimestamp: false,
        })
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
}
