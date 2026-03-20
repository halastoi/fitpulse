import '@testing-library/jest-dom/vitest'

// Provide a working localStorage implementation for jsdom environments that lack one
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  const store = new Map<string, string>()
  const localStorageMock: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    get length() { return store.size },
    key: (index: number) => [...store.keys()][index] ?? null,
  }
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
}
