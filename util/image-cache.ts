const ImageCache = {
  cache: null as null | Images[],
  get() {
    return this.cache;
  },
  set(cache: Images[]) {
    this.cache = cache;
  },
};

export default ImageCache;
