import { TWorker } from '@lollygag/core';
import { GifOptions, PngOptions, JpegOptions } from 'sharp';
export interface IImagesOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
    widths?: number[];
}
export default function images(options?: IImagesOptions): TWorker;
