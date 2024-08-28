import sharp from 'sharp';

const sharpOpt = {
  quality: 50,
  force: true,
};

const ImageManipulation = {
  downScale: async (image: sharp.Sharp, outputPath: string, targetLongestSide = 640) => {
    // downscale images if they are larger than the target width maintaining aspect ratio

    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (metadata && width && height) {
      if (width > height && width > targetLongestSide) {
        return image
          .rotate()
          .resize(targetLongestSide, null, { withoutEnlargement: true })
          .webp(sharpOpt)
          .withMetadata()
          .toFile(outputPath);
      } else if (height > width && height > targetLongestSide) {
        return image
          .rotate()
          .resize(null, targetLongestSide, { withoutEnlargement: true })
          .webp(sharpOpt)
          .withMetadata()
          .toFile(outputPath);
      } else {
        return image.webp(sharpOpt).withMetadata().toFile(outputPath);
      }
    }

    return image;
  },
};

export default ImageManipulation;
