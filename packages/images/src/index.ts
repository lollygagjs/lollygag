/* eslint-disable no-param-reassign */
import {deepCopy, fullExtname, IFile, Worker} from '@lollygag/core';
import sharp, {GifOptions, PngOptions, JpegOptions, Sharp} from 'sharp';
import {existsSync, mkdirSync, readFileSync, Stats, writeFileSync} from 'fs';
import {writeFile} from 'fs/promises';
import {basename, dirname, join} from 'path';

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
    const fileBasename = basename(path, fileExt);

    let fileName: string;

    if(quality) fileName = `${fileBasename}-${id}-q${quality}${fileExt}`;
    else fileName = `${fileBasename}-${id}${fileExt}`;

    const dir = join('.images', dirname(path));

    if(!existsSync(dir)) mkdirSync(dir, {recursive: true});

    return join(dir, fileName);
}

async function generateWidths(
    img: Sharp,
    widths: number[],
    quality: number | false,
    file: IFile,
    files: IFile[]
) {
    await Promise.all(
        widths.map(async(width) => {
            const imgPath = generateFilename(file.path, width, quality);

            await img.resize(width).toFile(imgPath);

            files.push({...file, path: imgPath});
        })
    );
}

export default function images(options?: IImagesOptions): Worker {
    return async function imagesWorker(files): Promise<void> {
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

        const promises = files.map(async(f) => {
            const file = f;

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

            const fullImgPath = generateFilename(file.path, 'full', quality);

            await img.toFile(fullImgPath);

            if(widths) {
                await generateWidths(
                    img,
                    widths,
                    quality,
                    deepCopy(file),
                    files
                );
            }

            file.path = fullImgPath;

            if(file.stats) {
                meta[file.path] = {
                    birthtimeMs: file.stats.birthtimeMs,
                };
            }

            console.log(`Processing ${file.path}... done!`);

            await writeFile(metaFile, JSON.stringify(meta, null, 2));
        });

        await Promise.all(promises);

        // TODO: temp
        console.log(files.filter((f) => !f.path.startsWith('files')));
    };
}
