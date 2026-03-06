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

/** A YouTube playlist with metadata for display on the /media page. */
export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
}

/** Fetches all playlists from the AIC YouTube channel. Cached for 1 hour. */
export async function getYouTubePlaylists(): Promise<YouTubePlaylist[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,contentDetails&maxResults=50`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("YouTube Playlists API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || []).map(
      (item: {
        id: string;
        snippet: {
          title: string;
          description: string;
          thumbnails: { high?: { url: string }; default?: { url: string } };
        };
        contentDetails: { itemCount: number };
      }) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
        videoCount: item.contentDetails.itemCount,
      })
    );
  } catch (error) {
    console.error("Failed to fetch YouTube playlists:", error);
    return [];
  }
}

/** Fetches videos from a specific YouTube playlist. Cached for 1 hour. */
export async function getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !playlistId) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=50`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("YouTube PlaylistItems API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || [])
      .filter(
        (item: { snippet: { resourceId?: { videoId?: string } } }) =>
          item.snippet.resourceId?.videoId
      )
      .map(
        (item: {
          snippet: {
            resourceId: { videoId: string };
            title: string;
            thumbnails: { high?: { url: string }; default?: { url: string } };
            publishedAt: string;
          };
        }) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        })
      );
  } catch (error) {
    console.error("Failed to fetch playlist videos:", error);
    return [];
  }
}
