export declare function makeRequest<T>(payload: any): Promise<T>;
/**
 * All rest request will essentially be the same and are JSON by default
 * Thus if no headers provided default headers are used
 * @param {any} payload for the request
 * @returns
 */
export declare function makeRequestRest<T>(payload: any): Promise<T>;
