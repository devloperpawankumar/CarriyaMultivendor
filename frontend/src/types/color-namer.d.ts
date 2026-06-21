declare module 'color-namer' {
  type ColorNamerEntry = {
    name: string;
    hex: string;
  };

  type ColorNamerResult = {
    basic?: ColorNamerEntry[];
    html?: ColorNamerEntry[];
    ntc?: ColorNamerEntry[];
    pantone?: ColorNamerEntry[];
  };

  export default function colorNamer(
    color: string,
    options?: { pick?: string | string[] }
  ): ColorNamerResult;
}

