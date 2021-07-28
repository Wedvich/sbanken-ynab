declare module '*.svg' {
  const content: any;
  export default content;
}

interface JSON {
  parse<T = any>(text: string, reviver?: (this: any, key: string, value: any) => any): T;
}
