declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    cancelled: boolean;
    uri?: string;
    width?: number;
    height?: number;
    type?: string;
    base64?: string;
  }

  export interface ImagePickerOptions {
    mediaTypes?: 'Images' | 'Videos' | 'All';
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    base64?: boolean;
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
} 