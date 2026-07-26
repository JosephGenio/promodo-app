type Listener = () => void;

const unauthorizedListeners = new Set<Listener>();

export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export function emitUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener());
}
