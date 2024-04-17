const ImageCache = {
  cache: null as null | Image[],
  get() {
    return this.cache;
  },
  set(cache: Image[]) {
    this.cache = cache;
  },
};

export default ImageCache;
