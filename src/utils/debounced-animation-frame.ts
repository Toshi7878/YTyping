const pendingFrames = new Map<string, number>();

export function requestDebouncedAnimationFrame(frameId: string, callback: () => void): () => void {
  cancelIfPending(frameId);
  const frame = requestAnimationFrame(() => {
    pendingFrames.delete(frameId);
    callback();
  });
  pendingFrames.set(frameId, frame);

  // useEffectのクリーンアップ関数として使用可能
  return () => cancelIfPending(frameId);
}

function cancelIfPending(frameId: string): void {
  const pending = pendingFrames.get(frameId);
  if (pending !== undefined) {
    cancelAnimationFrame(pending);
    pendingFrames.delete(frameId);
  }
}

// すべての保留中のフレームをキャンセル（オプション）
export function cancelAllFrames(): void {
  for (const frame of pendingFrames.values()) {
    cancelAnimationFrame(frame);
  }
  pendingFrames.clear();
}
