declare const VITE_REVISION: string;

interface JSON {
  parse<T = any>(text: string, reviver?: (this: any, key: string, value: any) => any): T;
}
