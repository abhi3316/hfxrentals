import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// In-memory Storage mock
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((idx: number) => Object.keys(store)[idx] ?? null),
    get length() {
      return Object.keys(store).length;
    }
  };
};

const mockStorage = createStorageMock();
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true });
}
if (typeof globalThis !== 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.clear();
});

// Mock window.alert and window.confirm
vi.spyOn(window, 'alert').mockImplementation(() => {});
vi.spyOn(window, 'confirm').mockImplementation(() => true);

// Mock HTMLCanvasElement for image compression tests
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
    if (contextId === '2d') {
      return {
        drawImage: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn()
      };
    }
    return null;
  });

  HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string) => {
    const dummyBlob = new Blob(['dummy-image-binary-data'], { type: type || 'image/webp' });
    callback(dummyBlob);
  });

  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockImplementation((type?: string) => {
    return `data:${type || 'image/webp'};base64,dGVzdC1kYXRh`;
  });
}

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof URL.createObjectURL === 'undefined' || !vi.isMockFunction(URL.createObjectURL)) {
  URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
}
if (typeof URL.revokeObjectURL === 'undefined' || !vi.isMockFunction(URL.revokeObjectURL)) {
  URL.revokeObjectURL = vi.fn();
}

// Mock Element.prototype.scrollIntoView for JSDOM
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn();
}
