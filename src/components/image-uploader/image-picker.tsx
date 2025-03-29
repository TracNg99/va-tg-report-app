import { Box, Button, Tooltip } from '@mantine/core';
import { Image as ImageDisplay } from '@mantine/core';
import { Dropzone, DropzoneIdle } from '@mantine/dropzone';
import { IconCloudUpload, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

export function blobToBase64(file: File | Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export function calculateSize(img: any) {
  const width = img?.width;
  const height = img?.height;
  const buffer = Buffer.from(img.src.split(',')[1], 'base64');
  const size = buffer.length / Math.pow(1024, 2); // in MB
  const scale = 0.7 / size;

  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  return [newWidth, newHeight];
}

export async function handleResize(
  file: File | Blob,
  fileName?: string,
): Promise<{ image: string; name: string }> {
  const imageString = await blobToBase64(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageString;

    img.onload = () => {
      const [newWidth, newHeight] = calculateSize(img);
      const canvas = document.createElement('canvas');

      canvas.width = newWidth;
      canvas.height = newHeight;

      // context is where the canvas references to know what data to render
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      // "compression" occurs below, where the new image is drawn onto the canvas based on the parameters we pass in
      // the second and third parameters tell the canvas where to place the image within its render, starting from the top left corner (i.e. a value greater than 0 will add whitespace from top-down, left-to-right
      // referencing https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // here we specify the quality, which is the second argument in .toDataUrl(...) | here the output should be 50% the quality of the original, lowering the detail and file size
      const newImageUrl = ctx.canvas.toDataURL('image/jpg', 1); // quality ranges 0-1
      // below is not necessary (used for testing)
      // const buffer = Buffer.from(newImageUrl.split(",")[1], "base64");

      resolve({
        image: newImageUrl,
        name: (file as File).name || (fileName as string),
      });
    };
    img.onerror = (e) => reject(e);
  });
}

interface UploadHandlerProps {
  acceptedFiles: File[] | FileList | null;
  selectedImages: Array<{ image: string | null; name: string | null }>;
  setImageError: (state: boolean) => void;
  setSelectedImages: (
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  onImageUpload: (
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  withResize?: boolean;
  allowMultiple?: boolean;
}

export const handleImageUpload = ({
  acceptedFiles,
  withResize,
  allowMultiple,
  selectedImages,
  setImageError,
  setSelectedImages,
  onImageUpload,
}: UploadHandlerProps) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
    const files =
      typeof acceptedFiles === 'object'
        ? Array.from(acceptedFiles)
        : acceptedFiles;
    const images = files.map((file) => {
      const reader = new FileReader();
      if (!withResize || file.size / Math.pow(1024, 2) < 3.5) {
        return new Promise<{
          image: string | null;
          name: string | null;
        }>((resolve) => {
          reader.onload = () => {
            resolve({ image: reader.result as string, name: file.name });
          };
          reader.onerror = () => {
            setImageError(true);
            resolve({ image: null, name: file.name });
          };
          reader.readAsDataURL(file);
        });
      } else {
        // Resize image

        return new Promise<{
          image: string | null;
          name: string | null;
        }>((resolve) => {
          handleResize(file).then((image) => {
            resolve(image);
          });
        });
      }
    });

    Promise.all(images).then((uploadedImages) => {
      const updatedImages = allowMultiple
        ? [...selectedImages, ...uploadedImages]
        : uploadedImages;
      setSelectedImages(updatedImages);
      setImageError(false);
      onImageUpload(updatedImages); // Notify parent component
    });
  }
};

interface ImageUploaderProps {
  onImageUpload: (
    images: { image: string | null; name: string | null }[],
  ) => void;
  withDropzone?: boolean;
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: { image: string | null; name: string | null }[];
  withResize?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  allowAddNew = true,
  allowMultiple = false,
  fetchImages = [],
  withResize = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<
    {
      image: string | null;
      name: string | null;
    }[]
  >([]);
  const [imageError, setImageError] = useState(false);

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImageUpload(updatedImages); // Notify parent component
  };

  useEffect(() => {
    if (fetchImages.length > 0) {
      setSelectedImages(fetchImages);
    }
  }, [fetchImages]);

  const paramObj = {
    withResize,
    allowMultiple,
    selectedImages,
    setImageError,
    setSelectedImages,
    onImageUpload,
  };

  return (
    <div className="flex flex-col lg:mx gap-4">
      <div className="flex flex-wrap gap-2">
        {selectedImages.map((img, index) => (
          <Box
            key={index}
            className={`relative overflow-hidden rounded-md border ${allowMultiple ? 'w-[250px] h-[250px]' : 'w-full h-full'} border-gray-300`}
          >
            <ImageDisplay
              src={
                imageError || !img.image
                  ? 'https://via.placeholder.com/100x100?text=No+Image'
                  : img.image
              }
              alt={img.name || 'Uploaded'}
              onError={() => setImageError(true)}
              width={allowMultiple ? 100 : undefined}
              height={allowMultiple ? 100 : undefined}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />

            {allowAddNew && (
              <Tooltip label="Remove">
                <Button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 p-1 text-white bg-gray-800/50 hover:bg-gray-800/80"
                  size="xs"
                >
                  <IconX size="0.8rem" />
                </Button>
              </Tooltip>
            )}
          </Box>
        ))}
      </div>
      <Dropzone
        className="border-solid mb-4 lg:mb-0"
        onDrop={(files) =>
          handleImageUpload({
            acceptedFiles: files,
            ...paramObj,
          })
        }
      >
        <DropzoneIdle>
          <div className="flex flex-col items-center justify-center h-80">
            <IconCloudUpload className="size-6" />
            <p className="mt-2 text-base-black/50 text-md">
              Choose photos or drag & drop it here
            </p>
            <Button
              variant="outline"
              className="bg-orange-50 text-orange-500 mt-6"
              type="button"
            >
              Browse File
            </Button>
          </div>
        </DropzoneIdle>
      </Dropzone>
    </div>
  );
};

export default ImageUploader;
