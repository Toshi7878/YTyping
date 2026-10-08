import { ORPCError } from "@orpc/client";

/** oRPC のエラーコード（NOT_FOUND など）を取得する。oRPC 以外のエラーなら undefined */
export const getORPCErrorCode = (error: unknown) => (error instanceof ORPCError ? error.code : undefined);
