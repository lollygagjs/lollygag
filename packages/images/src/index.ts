/* eslint-disable no-param-reassign */
import {fullExtname,Worker} from '@lollygag/core';
import sharp, {GifOptions, PngOptions, JpegOptions} from 'sharp';
import {existsSync, mkdirSync, readFileSync, Stats, writeFileSync} from 'fs';
import {writeFile} from 'fs/promises';
import {basename, join} from 'path';

export interface IImagesOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
    widths?: number[];
}

function generateFilename(
    path: string,
    id: number | string,
    quality: number | false
) {
    const fileExt = fullExtname(path);
    const fileName = basename(path, fileExt);

    if(quality) return `${fileName}-${id}-q${quality}${fileExt}`;

    return `${fileName}-${id}${fileExt}`;
}

export default function images(options?: IImagesOptions):Worker {
    return async function imagesWorker(this:Worker, files): Promise<void> {
        if(!files) return;

        const {gifOptions, pngOptions, jpegOptions, widths} = options ?? {};

        const metaFile = '.images/meta.json';

        if(!existsSync('.images/')) mkdirSync('.images');
        if(!existsSync(metaFile)) writeFileSync(metaFile, '{}');

        interface IImagesMeta {
            [path: string]: {
                birthtimeMs: Stats['birthtimeMs'];
            };
        }

        const promises = files.map(async(file) => {
            if(!file.mimetype.startsWith('image')) return;

            const meta: IImagesMeta = JSON.parse(
                readFileSync(metaFile, {encoding: 'utf-8'}) ?? '{}'
            );

            if(meta[file.path] && file.stats) {
                if(
                    new Date(meta[file.path].birthtimeMs)
                    >= new Date(file.stats.birthtimeMs)
                ) {
                    return;
                }
            }

            console.log(`Processing ${file.path}...`);

            const img = sharp(file.path);

            let quality: number | false = false;

            switch(file.mimetype) {
                case 'image/gif':
                    img.gif(gifOptions);
                    break;
                case 'image/png':
                    quality = pngOptions?.quality ?? 100;
                    img.png({quality, ...pngOptions});
                    break;
                case 'image/jpeg':
                    quality = jpegOptions?.quality ?? 80;
                    img.jpeg({quality, ...jpegOptions});
                    break;
                default:
            }

            await img.toFile(
                join('.images', generateFilename(file.path, 'full', quality))
            );

            widths?.forEach((width) => {
                img.resize(width).toFile(
                    join('.images', generateFilename(file.path, width, quality))
                );
            });

            if(file.stats) {
                meta[file.path] = {
                    birthtimeMs: file.stats.birthtimeMs,
                };
            }

            console.log(`Processing ${file.path}... done!`);

            await writeFile(metaFile, JSON.stringify(meta, null, 2));
        });

        await Promise.all(promises);
    };
}
