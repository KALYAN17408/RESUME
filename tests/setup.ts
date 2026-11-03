import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock IntersectionObserver for Framer Motion viewport triggers
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  unobserve = vi.fn();
}

if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver for Framer Motion viewport triggers
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  } as any;
}

if (typeof Blob !== 'undefined') {
  if (!Blob.prototype.text) {
    Blob.prototype.text = function () {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Failed to read text'));
        reader.readAsText(this);
      });
    };
  }
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error || new Error('Failed to read arrayBuffer'));
        reader.readAsArrayBuffer(this);
      });
    };
  }
}

if (typeof File !== 'undefined') {
  if (!File.prototype.text && Blob?.prototype?.text) {
    File.prototype.text = Blob.prototype.text;
  }
  if (!File.prototype.arrayBuffer && Blob?.prototype?.arrayBuffer) {
    File.prototype.arrayBuffer = Blob.prototype.arrayBuffer;
  }
}
