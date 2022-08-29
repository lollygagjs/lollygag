/// <reference types="node" />
import { Worker } from '@lollygag/core';
import { GifOptions, PngOptions, JpegOptions, ResizeOptions } from 'sharp';
import { Stats } from 'fs';
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
export interface IImagesMeta {
    [path: string]: {
        birthtimeMs: Stats['birthtimeMs'];
        generated?: IGenerated;
    };
}
declare const validMimetypes: readonly ["image/gif", "image/png", "image/jpeg"];
export declare type ValidMimetypes = typeof validMimetypes[number];
export default function images(options?: IImagesOptions): Worker;
export {};
