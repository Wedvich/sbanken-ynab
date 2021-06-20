const byteToHex = [];

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0');
  byteToHex.push(hexOctet);
}

export const bufferToHex = (buffer: ArrayLike<number> | ArrayBufferLike) => {
  const u8buffer = new Uint8Array(buffer);
  const hexOctets = new Array(u8buffer.length);

  for (let i = 0; i < u8buffer.length; ++i) {
    hexOctets[i] = byteToHex[u8buffer[i]];
  }

  return hexOctets.join('');
};

export const hash = async (source: string) => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(source);
  const hashBuffer = await crypto.subtle.digest('sha-256', buffer);
  const hash = bufferToHex(hashBuffer);
  return hash;
};

export const getEntities = (entity: string, prefix?: string): Array<any> => {
  console.group('getEntities()');
  const key = `${prefix ? `${prefix}:` : ''}${entity}`;
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];

    const entities = JSON.parse(data);
    if (!Array.isArray(entities)) {
      console.error('Unexpected entity format - clearing key %s', key);
      localStorage.removeItem(key);
      return [];
    }
  } catch {
    console.error('Unable to read entities - clearing key %s', key);
    localStorage.removeItem(key);
    return [];
  } finally {
    console.groupEnd();
  }
};
