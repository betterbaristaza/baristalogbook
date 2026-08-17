import { supabase } from './supabaseClient';

const BUCKET = 'logbook-images';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.82;
const SIGNED_URL_SECONDS = 60 * 60 * 24;

type ImageSection = 'coffees' | 'brews';
type ImageKind = 'front' | 'back' | 'brew';

interface UploadImageOptions {
  userId: string;
  section: ImageSection;
  recordId: string;
  kind: ImageKind;
  file: File;
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('The selected image could not be read.'));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('The image could not be prepared.'));
        }
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });

const prepareImage = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error('The selected image is larger than 15 MB.');
  }

  const image = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_EDGE / Math.max(image.width, image.height)
  );

  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Image processing is unavailable.');
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);

  if (blob.size > MAX_UPLOAD_SIZE) {
    throw new Error('The prepared image is larger than 5 MB.');
  }

  return blob;
};

export const imageService = {
  upload: async ({
    userId,
    section,
    recordId,
    kind,
    file,
  }: UploadImageOptions): Promise<string> => {
    const blob = await prepareImage(file);
    const path = `${userId}/${section}/${recordId}/${kind}.jpg`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return path;
  },

  createSignedUrl: async (
    path?: string | null
  ): Promise<string | undefined> => {
    if (!path) {
      return undefined;
    }

    if (
      path.startsWith('data:') ||
      path.startsWith('blob:') ||
      path.startsWith('http')
    ) {
      return path;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_SECONDS);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  },

  remove: async (path?: string | null): Promise<void> => {
    if (
      !path ||
      path.startsWith('data:') ||
      path.startsWith('blob:') ||
      path.startsWith('http')
    ) {
      return;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (error) {
      throw error;
    }
  },
};