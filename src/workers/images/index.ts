import {deepCopy, Worker} from '../..';
import {GifOptions, PngOptions, JpegOptions, ResizeOptions} from 'sharp';
import {existsSync, mkdirSync, readFileSync, Stats, writeFileSync} from 'fs';
import {writeFile} from 'fs/promises';
import generateFilename from './helpers/generalFilename';
import processImages from './helpers/processImages';
import deleteStaleImages from './helpers/deleteStaleImages';

export interface IResizeParams {
    width?: number | null;
    height?: number | null;
    options?: ResizeOptions;
}

export interface ISizes {
    [name: string]: IResizeParams;
}

export interface IGenerated {
    [name: string]: {
        path: string;
        quality?: number;
    } & IResizeParams;
}

export interface IImagesOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
    sizes?: ISizes;
}

export interface IImagesMetaProps {
    birthtimeMs: Stats['birthtimeMs'];
    desired: string[];
    generated: IGenerated;
}

export interface IImagesMeta {
    [path: string]: IImagesMetaProps;
}

const validMimetypes = ['image/gif', 'image/png', 'image/jpeg'] as const;

export type ValidMimetypes = (typeof validMimetypes)[number];

export function worker(options?: IImagesOptions): Worker {
    return async function imagesWorker(files): Promise<void> {
        if(!files) return;

        const {gifOptions, pngOptions, jpegOptions, sizes} = options ?? {};

        const metaFile = '.images/meta.json';

        if(!existsSync('.images/')) mkdirSync('.images');
        if(!existsSync(metaFile)) writeFileSync(metaFile, '{}');

        const metaFileText = readFileSync(metaFile, {
            encoding: 'utf-8',
        });

        const oldMeta: IImagesMeta = JSON.parse(
            metaFileText.length
                ? readFileSync(metaFile, {encoding: 'utf-8'})
                : '{}'
        );

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

            const fullImgPath = generateFilename(originalFilePath);

            const fullImgObj: IGenerated = {
                full: {
                    path: fullImgPath,
                    quality,
                },
            };

            const desired: string[] = [fullImgPath];

            const sizesObj: IGenerated = Object.keys(sizes ?? {}).reduce(
                (size, key) => {
                    const sizePath = generateFilename(originalFilePath, key);

                    desired.push(sizePath);

                    // eslint-disable-next-line no-param-reassign
                    size[key] = {
                        path: sizePath,
                        width: (sizes ?? {})[key].width,
                        height: (sizes ?? {})[key].height,
                        options: (sizes ?? {})[key].options,
                        quality,
                    };

                    return size;
                },
                {} as IGenerated
            );

            meta[originalFilePath] = {
                birthtimeMs: file.stats.birthtimeMs,
                desired,
                generated: {...fullImgObj, ...sizesObj},
            };

            const oldFileMeta: IImagesMetaProps | undefined
                = oldMeta[originalFilePath];

            const previouslyProcessed
                = oldFileMeta
                && new Date(oldMeta[originalFilePath].birthtimeMs)
                    >= new Date(file.stats.birthtimeMs);

            const newFiles = await processImages({
                fileCopy: deepCopy(file),
                originalFilePath,
                fullImgPath,
                fileMimetype,
                sizesObj,
                quality,
                oldFileMeta,
                handlerOptions: {gifOptions, pngOptions, jpegOptions},
                previouslyProcessed,
            });

            file.path = fullImgPath;
            files.push(...newFiles);

            console.log(`Processing ${originalFilePath}... done!`);
        });

        await Promise.all(promises);

        deleteStaleImages(meta, oldMeta);

        await writeFile(metaFile, JSON.stringify(meta, null, 2));
    };
}

export default worker;
