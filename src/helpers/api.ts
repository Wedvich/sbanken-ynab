import axios, { AxiosInstance } from 'axios';

export abstract class Api {
  protected instance: AxiosInstance;

  constructor(baseUrl: string) {
    this.instance = axios.create({
      baseURL: baseUrl,
    });
  }
}
