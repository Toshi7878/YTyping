export function extractYouTubeVideoId(url: string) {
  const regex = /[?&]v=([^?&]+)/;
  const match = url.match(regex);

  // If match is not found, try to match using short URL format
  if (!match) {
    const shortUrlRegex = /youtu\.be\/([^?&]+)/;
    const shortUrlMatch = url.match(shortUrlRegex);

    if (shortUrlMatch && shortUrlMatch[1]) {
      return shortUrlMatch[1];
    }

    // Try to match YouTube Shorts URL format
    const shortsRegex = /youtube\.com\/shorts\/([^?&]+)/;
    const shortsMatch = url.match(shortsRegex);

    if (shortsMatch && shortsMatch[1]) {
      return shortsMatch[1];
    }
  }

  // Check if a match is found
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  } else {
    // No match found or invalid URL
    return undefined;
  }
}
