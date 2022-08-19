import { ICreateAppRequest } from '../../../lib/apps';
/**
 * Function to process the app creation request and
 * handle any errors that are request error and print
 * in a formatted string. It throws is error is unknown
 * or cannot be handled.
 * @param {ICreateAppRequest} data to create the app
 * @returns {String} response formatted string
 */
export declare function createApp(data: ICreateAppRequest): Promise<string | void>;
