function getFilename(imageUrl: string) {
  // Split the URL by the query parameter separator ("?")
  const parts = imageUrl.split('?');

  // Check if there's a query parameter
  if (parts.length < 2) {
    return null; // No query parameter, return null
  }

  // Get the query string
  const queryString = parts[1];

  // Split the query string by parameter separators ("&")
  const params = queryString.split('&');

  // Loop through each parameter
  for (const param of params) {
    // Split the parameter by the separator ("=") to get key-value pair
    const keyValue = param.split('=');

    // Check if the key is "image" (case-insensitive)
    if (keyValue[0].toLowerCase() === 'image') {
      return keyValue[1]; // Return the filename (value)
    }
  }

  // No "image" parameter found
  return null;
}

const download = (url: string) => {
  const imageName = getFilename(url) as string;

  const link = document.createElement('a');
  link.href = url;
  link.download = imageName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default download;
