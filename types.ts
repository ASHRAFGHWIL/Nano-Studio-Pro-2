export interface Preset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

export interface ImageState {
  original: string | null; // Base64
  current: string | null; // Base64
  history: string[]; // Array of Base64 strings for undo
  historyIndex: number; // Pointer to the current version in history
  mimeType: string;
}

export enum StudioStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}