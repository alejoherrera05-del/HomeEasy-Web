function defaultLoadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(source);
    image.onerror = () => reject(new Error(`No se pudo cargar ${source}`));
    image.src = source;
  });
}

export async function preloadHommyLayers({
  layers,
  criticalLayers,
  loadImage = defaultLoadImage,
  signal,
}) {
  const entries = Object.entries(layers);
  const results = await Promise.allSettled(entries.map(([name, source]) => loadImage(source, name)));
  const loaded = [];
  const failed = [];
  results.forEach((result, index) => {
    const name = entries[index][0];
    if (result.status === "fulfilled") loaded.push(name);
    else failed.push({ name, reason: result.reason instanceof Error ? result.reason.message : String(result.reason) });
  });
  const criticalSet = new Set(criticalLayers);
  const criticalFailed = failed.filter(({ name }) => criticalSet.has(name));
  const optionalFailed = failed.filter(({ name }) => !criticalSet.has(name));
  return {
    cancelled: Boolean(signal?.aborted),
    status: criticalFailed.length ? "fallback" : "ready",
    loaded,
    failed,
    criticalFailed,
    optionalFailed,
  };
}

export function createLatestReactionQueue(execute) {
  let rendererStatus = "checking";
  let pending = null;
  let lastExecutedSequence = 0;
  let disposed = false;

  const run = (reaction) => {
    if (disposed || rendererStatus !== "ready" || !reaction?.sequence) return false;
    if (reaction.sequence <= lastExecutedSequence) return false;
    lastExecutedSequence = reaction.sequence;
    pending = null;
    execute(reaction);
    return true;
  };

  return {
    receive(reaction) {
      if (disposed || !reaction?.sequence || reaction.sequence <= lastExecutedSequence) return false;
      if (rendererStatus === "ready") return run(reaction);
      if (rendererStatus === "checking" && (!pending || reaction.sequence >= pending.sequence)) pending = reaction;
      return false;
    },
    setRendererStatus(status) {
      if (disposed) return false;
      rendererStatus = status;
      if (status === "fallback") pending = null;
      return status === "ready" && pending ? run(pending) : false;
    },
    dispose() {
      disposed = true;
      pending = null;
    },
    getSnapshot() {
      return {
        rendererStatus,
        pendingSequence: pending?.sequence ?? 0,
        lastExecutedSequence,
        disposed,
      };
    },
  };
}
