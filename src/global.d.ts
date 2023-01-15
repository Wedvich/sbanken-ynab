declare const VITE_REVISION: string;

declare module '@babel/plugin-transform-react-jsx-source';

interface JSON {
  parse<T = any>(text: string, reviver?: (this: any, key: string, value: any) => any): T;
}
