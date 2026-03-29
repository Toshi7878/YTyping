import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/** gzip 圧縮（入力はバイト列） */
export const gzipCompress = (data: Uint8Array | Buffer): Promise<Buffer> => gzipAsync(data);

/** gzip 展開（入力は gzip 済みバイト列） */
export const gzipDecompress = (data: Uint8Array | Buffer): Promise<Buffer> => gunzipAsync(data);
