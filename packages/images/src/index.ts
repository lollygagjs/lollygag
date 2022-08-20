/* eslint-disable no-continue */
import Jimp from 'jimp';
import {RaggedyObject, TWorker} from '@lollygag/core';
import {existsSync, mkdirSync, readFileSync, Stats, writeFileSync} from 'fs';
import {writeFile} from 'fs/promises';

export interface IImagesOptions {
    imageCompressorOptions?: RaggedyObject;
}

export default function images(options?: IImagesOptions): TWorker {
    return async function imagesWorker(this: TWorker, files): Promise<void> {
        if(!files) return;

        const metaFile = '.meta/lollygag-images.json';

        if(!existsSync('.meta/')) mkdirSync('.meta');

        if(!existsSync(metaFile)) {
            writeFileSync(metaFile, '{}');
        }

        interface IImagesMeta {
            [path: string]: {
                birthtime: Stats['birthtime'];
            };
        }

        const meta: IImagesMeta = JSON.parse(
            readFileSync(metaFile, {encoding: 'utf-8'}) ?? '{}'
        );

        const promises = files.map(async(file) => {
            if(!file.mimetype.startsWith('image')) return;

            if(meta[file.path] && file.stats) {
                if(
                    new Date(meta[file.path].birthtime)
                    >= new Date(file.stats.birthtime)
                ) {
                    return;
                }
            }

            console.log(`Processing ${file.path}...`);

            await Jimp.read(file.path).then((img) => {
                img.quality(75).resize(1200, Jimp.AUTO).write(file.path);

                if(file.stats) {
                    meta[file.path] = {
                        birthtime: file.stats.birthtime,
                    };
                }
            });

            console.log(`Processing ${file.path}... done!`);
        });

        await Promise.all(promises);

        await writeFile(metaFile, JSON.stringify(meta));
    };
}
