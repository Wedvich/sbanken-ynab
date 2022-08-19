declare function addSpinner(label: string): Promise<void>;
declare namespace addSpinner {
    var sticky: (s?: any) => void;
    var clear: <T>(label: any) => (valueToPassThrough: T) => T;
    var clearAll: () => void;
}
export { addSpinner as spinner };
