import { Worker } from '@lollygag/core';
import { GifOptions, PngOptions, JpegOptions } from 'sharp';
export interface IImagesOptions {
    gifOptions?: GifOptions;
    pngOptions?: PngOptions;
    jpegOptions?: JpegOptions;
    widths?: number[];
}
declare const validMimetypes: readonly ["image/gif", "image/png", "image/jpeg"];
export declare type ValidMimetypes = typeof validMimetypes[number];
export default function images(options?: IImagesOptions): Worker;
export {};
