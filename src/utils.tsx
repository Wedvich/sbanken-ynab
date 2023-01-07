import { useRef } from 'preact/hooks';
import { createAction } from '@reduxjs/toolkit';

export const formatMoney = new Intl.NumberFormat('no', { style: 'currency', currency: 'NOK' })
  .format;

const crcTable = (() => {
  let c: number;
  const crcTable: Array<number> = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
})();

/** @see https://stackoverflow.com/a/18639999/351435 */
export function crc32(text: string): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < text.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ text.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export function usePrevious<T>(value: T) {
  const ref = useRef(value);
  const { current } = ref;
  ref.current = value;
  return current;
}

export const fetchInitialData = createAction('fetchInitialData');
