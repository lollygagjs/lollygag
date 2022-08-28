import sharp, {GifOptions, PngOptions, JpegOptions, Sharp} from 'sharp';
import {ValidMimetypes} from '..';

export interface IHandlerOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
}

type Handlers = {
    [mimetype in ValidMimetypes]: (
        img: Sharp,
        options: IHandlerOptions,
        quality?: number
    ) => void;
};

const handlers: Handlers = {
    'image/gif': (img, {gifOptions}: IHandlerOptions) => {
        img.gif(gifOptions);
    },
    'image/png': (img, {pngOptions}, quality) => {
        const q = pngOptions?.quality ?? quality;
        img.png({quality: q, ...pngOptions});
    },
    'image/jpeg': (img, {jpegOptions}, quality) => {
        const q = jpegOptions?.quality ?? quality;
        img.jpeg({quality: q, ...jpegOptions});
    },
};

export async function generateImage(
    path: string,
    fullImgPath: string,
    mimetype: ValidMimetypes,
    options: IHandlerOptions,
    quality?: number
) {
    const img = sharp(path);

    handlers[mimetype](img, options, quality);

    await img.toFile(fullImgPath);
}
