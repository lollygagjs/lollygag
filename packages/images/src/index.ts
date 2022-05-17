/* eslint-disable no-continue */
import {dirname, extname, join} from 'path';
import Jimp from 'jimp';
import {changeExtname, TWorker} from '@lollygag/core';

export interface IImagesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    imageCompressorOptions?: any;
}

export default function images(options?: IImagesOptions): TWorker {
    return async function imagesWorker(
        this: TWorker,
        files,
        lollygag
    ): Promise<void> {
        if(!files) return;

        const promises = files.map(async(file) => {
            if(!file.mimetype.startsWith('image')) return;

            console.log(`Processing ${file.path}...`);

            await Jimp.read(file.path).then((img) => {
                img.quality(75).resize(1200, Jimp.AUTO).write(file.path);
            });

            console.log(`Processing ${file.path}... done!`);
        });

        await Promise.all(promises);
    };
}
