import sharp from 'sharp';

const sharpOpt = {
  quality: 50,
  force: true,
};

const ImageManipulation = {
  downScale: async (image: sharp.Sharp, outputPath: string, targetLongestSide = 640, actualPath: string) => {
    // downscale images if they are larger than the target width maintaining aspect ratio

    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (metadata && width && height) {
      if (width > height && width > targetLongestSide) {
        return image
          .resize(targetLongestSide, null, { withoutEnlargement: true })
          .withMetadata()
          .webp(sharpOpt)
          .toFile(outputPath);
      } else if (height > width && height > targetLongestSide) {
        return image
          .resize(null, targetLongestSide, { withoutEnlargement: true })
          .withMetadata()
          .webp(sharpOpt)
          .toFile(outputPath);
      } else {
        return image.webp(sharpOpt).toFile(outputPath);
      }
    }

    return image;
  },
};

export default ImageManipulation;
