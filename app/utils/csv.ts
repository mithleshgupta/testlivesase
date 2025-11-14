import * as fastcsv from 'fast-csv';
import { createReadStream } from 'fs';
import AppError from './AppError';
import { Readable } from 'stream';

type RecordType = Record<string, any>;
type IterType = { function: Function, key: string };

export class Reader {
    private static async parse(
        readable: Readable,
        error: string,
        key?: string,
        common?: RecordType,
        commonIter?: IterType
    ): Promise<any[]> {
        const results: any[] = [];

        return new Promise<any[]>((resolve, reject) => {
            readable
                .pipe(fastcsv.parse({ headers: true, ignoreEmpty: true }))
                .on('data', (row) => {
                    let new_row: any;
                    
                    if (commonIter) {
                        common = { ...common, [commonIter.key]: commonIter.function() }
                    }

                    new_row = { ...common };

                    if (key && row[key]) {
                        new_row[key] = row[key];
                    } else {
                        new_row = { ...row, ...new_row };
                    }

                    if (new_row !== null) {
                        results.push(new_row);
                    }
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (_) => {
                    reject(new AppError(error, 400));
                });
        });
    }

    private static async parseStringList(
        readable: Readable,
        error: string,
        key: string,
    ): Promise<any[]> {
        const results: any[] = [];

        return new Promise<any[]>((resolve, reject) => {
            readable
                .pipe(fastcsv.parse({ headers: true, ignoreEmpty: true }))
                .on('data', (row) => {
                    const new_row = row[key];

                    if (new_row !== null) {
                        results.push(new_row);
                    }
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (_) => {
                    reject(new AppError(error, 400));
                });
        });
    }


    static async fromStringtoObject(
        text: string,
        key?: string,
        common?: RecordType,
        commonIter?: IterType
    ) {
        const readable = Readable.from(text);

        const data = await this.parse(
            readable,
            "Unable to read CSV",
            key,
            common,
            commonIter
        );

        return data;
    }

    static async fromStringtoList(text: string, key: string) {
        const readable = Readable.from(text);

        const data = await this.parseStringList(
            readable,
            "Unable to read CSV",
            key
        );

        return data;
    }

    static async fromFiletoObject(
        path: string,
        key?: string,
        common?: RecordType,
        commonIter?: IterType
    ) {
        const readable = createReadStream(path);

        const data = await this.parse(
            readable,
            "Unable to read CSV",
            key,
            common,
            commonIter
        );

        return data;
    }

    static async fromFiletoList(path: string, key: string) {
        const readable = createReadStream(path);

        const data = await this.parseStringList(
            readable,
            "Unable to read CSV",
            key
        );

        return data;
    }

}