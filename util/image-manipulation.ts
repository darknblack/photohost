import sharp from 'sharp';

const ImageManipulation = {
  downScale: async (image: sharp.Sharp, outputPath: string, targetWidth = 220, actualPath: string) => {
    // downscale images if they are larger than the target width maintaining aspect ratio

    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (metadata && width && height && width > targetWidth) {
      return image
        .resize(targetWidth, null, {
          withoutEnlargement: true,
        })
        .withMetadata()
        .toFile(outputPath);
    }

    return image;
  },
};

export default ImageManipulation;
