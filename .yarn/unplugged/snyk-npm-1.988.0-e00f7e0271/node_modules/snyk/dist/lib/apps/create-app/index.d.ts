import { ICreateAppRequest, ICreateAppOptions } from '..';
/**
 * Validates and parsed the data required to create app.
 * Throws error if option is not provided or is invalid
 * @param {ICreateAppOptions} options required to create an app
 * @returns {ICreateAppRequest} data that is used to make the request
 */
export declare function createAppDataScriptable(options: ICreateAppOptions): ICreateAppRequest;
export declare function createAppDataInteractive(): Promise<ICreateAppRequest>;
