/**
 * YouTube Video Fetcher
 *
 * Fetches the latest videos from the AIC YouTube channel via the YouTube
 * Data API v3. Results are cached for 1 hour via Next.js ISR. Returns an
 * empty array if the API key or channel ID is missing, or if the API fails.
 *
 * @module lib/youtube
 */

/** A YouTube video with metadata for display on the /media page. */
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCxxxxxxx"; // Set in env

/** Fetches the latest videos from the AIC YouTube channel. Cached for 1 hour. */
export async function getYouTubeVideos(maxResults = 8): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&type=video&maxResults=${maxResults}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour

    if (!res.ok) {
      console.error("YouTube API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || []).map(
      (item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high: { url: string } }; publishedAt: string } }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })
    );
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return [];
  }
}

/** Live stream status for the AIC YouTube channel. */
export interface YouTubeLiveStream {
  isLive: boolean;
  videoId?: string;
  title?: string;
  url?: string;
}

/** Checks if the AIC YouTube channel is currently live streaming. Cached for 60s. */
export async function getYouTubeLiveStream(): Promise<YouTubeLiveStream> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return { isLive: false };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&eventType=live&type=video&maxResults=1`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error("YouTube Live API error:", res.status, await res.text());
      return { isLive: false };
    }

    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) {
      return { isLive: false };
    }

    const item = items[0];
    return {
      isLive: true,
      videoId: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    };
  } catch (error) {
    console.error("Failed to check live stream:", error);
    return { isLive: false };
  }
}
