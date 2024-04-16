import chokidar from 'chokidar';

export const DirectoryWatcher = {
  isWatching: false,
  watch(imagePath: string, cb = () => {}) {
    // Initialize a file system watcher for the "images/" directory
    const watcher = chokidar.watch(imagePath, {
      persistent: true,
      ignoreInitial: true, // Ignore initial directory scan
      usePolling: true,
      useFsEvents: false,
    });

    // Add event listeners for file system changes
    watcher.on('add', cb);
    this.isWatching = true;
  },
};
