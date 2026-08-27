export function extractS3Key(fileUrl, bucketName) {
  try {
    const url = new URL(fileUrl);
    if (url.pathname.startsWith(`/${bucketName}/`)) {
      return url.pathname.slice(`/${bucketName}/`.length);
    }
    return url.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}
