const {existsSync} = require('fs');
const {resolve, relative} = require('path');
const {Lollygag} = require('../packages/core');
const {handlebars} = require('../packages/handlebars');

const workerName = process.argv[2];
const scriptPath = relative(process.cwd(), __filename);

if(!workerName) {
    console.log(`Usage: 'node ${scriptPath} [workername]'`);
    console.log('No workername provided. Exiting...');
    process.exit(0);
}

const indir = resolve(__dirname, './seeds/worker');
const outdir = resolve(__dirname, `../packages/${workerName}`);

if(existsSync(outdir)) {
    console.log(`Directory '${outdir}' exists. Exiting...`);
    process.exit(0);
}

console.log(indir);
console.log(outdir);

new Lollygag()
    .config({workerName})
    .in(indir)
    .out(outdir)
    .do(
        handlebars({
            newExtname: false,
            targetExtnames: ['.ts', '.json', '.md'],
        })
    )
    .build();
