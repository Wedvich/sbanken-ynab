import * as needle from 'needle';
/**
 *
 * @param data the data to merge into that data which has been staged thus far (with the {@link add} function)
 * and then sent to the backend.
 */
export declare function addDataAndSend(data: any): Promise<void | {
    res: needle.NeedleResponse;
    body: any;
}>;
export declare function allowAnalytics(): boolean;
/**
 * Adds a key-value pair to the analytics data `metadata` field. This doesn't send the analytics, just stages it for
 * sending later (via the {@link addDataAndSend} function).
 * @param key
 * @param value
 */
export declare function add(key: string, value: unknown): void;
