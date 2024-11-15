import sharp from 'sharp';

interface Metadata {
  width: number;
  height: number;
  orientation: number;
}

function getNormalSize({ width, height, orientation }: Metadata) {
  return orientation >= 5 ? { width: height, height: width } : { width, height };
}

const ImageManipulation = {
  // downscale images if they are larger than the target width maintaining aspect ratio
  downScale: async (buffer: Buffer, isSmall: boolean) => {
    const sharpOpt: sharp.WebpOptions = {
      quality: isSmall ? 30 : 70,
      force: true,
      effort: isSmall ? 2 : 6,
    };

    const targetLongestSide = isSmall ? 640 : 1920;

    const image = sharp(buffer);
    const metadata = await image.metadata();
    const { width, height } = getNormalSize(metadata as Metadata);

    if (width > targetLongestSide || height > targetLongestSide) {
      const resizeOptions =
        width >= height ? { width: targetLongestSide, height: null } : { width: null, height: targetLongestSide };

      return image
        .rotate()
        .resize(resizeOptions.width, resizeOptions.height, { withoutEnlargement: true })
        .webp(sharpOpt)
        .withMetadata()
        .toBuffer();
    }

    // No resizing needed; convert directly
    return image.webp(sharpOpt).withMetadata().toBuffer();
  },
};

export default ImageManipulation;
