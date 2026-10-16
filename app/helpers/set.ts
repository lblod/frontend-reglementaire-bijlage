export default function set<V, K extends keyof V>(
  object: V,
  key: K,
  value: V[K],
) {
  return () => {
    object[key] = value;
  };
}
