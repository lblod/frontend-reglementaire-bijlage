export function loadFromLocalStorage<T>(key: string) {
  const valueStr = localStorage.getItem(key);
  if (!valueStr) {
    return;
  }
  const value = JSON.parse(valueStr) as T;
  return value;
}

export function updateLocalStorage<T>(key: string, value: T) {
  const valueStr = JSON.stringify(value);
  localStorage.setItem(key, valueStr);
}

export function removeFromLocalStorage(key: string) {
  localStorage.removeItem(key);
}

export function clearLocalStorage() {
  localStorage.clear();
}
