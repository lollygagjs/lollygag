/* eslint-disable no-param-reassign */
import {deepCopy, IFile, Worker} from '@lollygag/core';
import {GifOptions, PngOptions, JpegOptions} from 'sharp';
import {existsSync, mkdirSync, readFileSync, Stats, writeFileSync} from 'fs';
import {writeFile} from 'fs/promises';
import {generateFilename} from './helpers/generalFilename';
import {processImages} from './helpers/processImages';

export interface IImagesOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
    widths?: number[];
}

const validMimetypes = ['image/gif', 'image/png', 'image/jpeg'] as const;

export type ValidMimetypes = typeof validMimetypes[number];

interface IImagesMeta {
    [path: string]: {
        birthtimeMs: Stats['birthtimeMs'];
        generated?: string[];
    };
}

export default function images(options?: IImagesOptions): Worker {
    return async function imagesWorker(files): Promise<void> {
        if(!files) return;

        const {gifOptions, pngOptions, jpegOptions, widths} = options ?? {};

        const metaFile = '.images/meta.json';

        if(!existsSync('.images/')) mkdirSync('.images');
        if(!existsSync(metaFile)) writeFileSync(metaFile, '{}');

        const meta: IImagesMeta = {};

        const promises = files.map(async(f) => {
            const file = f;

            if(!file.stats) return;

            const fileMimetype = file.mimetype as ValidMimetypes;

            if(!validMimetypes.includes(fileMimetype)) return;

            const originalFilePath = file.path;

            console.log(`Processing ${originalFilePath}...`);

            let quality: number | undefined;

            if(fileMimetype === 'image/png') {
                quality = pngOptions?.quality ?? 80;
            } else if(fileMimetype === 'image/jpeg') {
                quality = jpegOptions?.quality ?? 80;
            }

            const fullImgPath = generateFilename(
                originalFilePath,
                'full',
                quality
            );

            const widthsPaths
                = widths?.map((width) =>
                    generateFilename(originalFilePath, width, quality)) ?? [];

            meta[originalFilePath] = {
                birthtimeMs: file.stats.birthtimeMs,
                generated: [fullImgPath, ...widthsPaths],
            };

            let newFiles: IFile[] = [];
            const fileCopy = deepCopy(file);

            const processImagesArgs = {
                fileCopy,
                originalFilePath,
                fullImgPath,
                fileMimetype,
                widthsPaths,
                quality,
                handlerOptions: {gifOptions, pngOptions, jpegOptions},
            };

            const metaFileText = readFileSync(metaFile, {
                encoding: 'utf-8',
            });

            const oldMeta: IImagesMeta = JSON.parse(
                metaFileText.length
                    ? readFileSync(metaFile, {encoding: 'utf-8'})
                    : '{}'
            );

            if(
                // file has been processed previously
                oldMeta[originalFilePath]
                && new Date(oldMeta[originalFilePath].birthtimeMs)
                    >= new Date(file.stats.birthtimeMs)
            ) {
                newFiles = await processImages({
                    ...processImagesArgs,
                    previouslyProcessed: true,
                });
            } else {
                newFiles = await processImages(processImagesArgs);
            }

            file.path = fullImgPath;
            files.push(...newFiles);

            console.log(`Processing ${originalFilePath}... done!`);
        });

        await Promise.all(promises);
        await writeFile(metaFile, JSON.stringify(meta, null, 2));
    };
}
