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

/** Fetches completed live streams (past broadcasts) from the channel. Cached for 1 hour. */
export async function getYouTubeStreams(maxResults = 50): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&type=video&eventType=completed&maxResults=${maxResults}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("YouTube Streams API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || []).map(
      (item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high?: { url: string }; default?: { url: string } }; publishedAt: string } }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })
    );
  } catch (error) {
    console.error("Failed to fetch YouTube streams:", error);
    return [];
  }
}

/** Playlist IDs to display on the media page. */
export const ALLOWED_PLAYLIST_IDS = [
  "PL_XW5f-8WbWHW0gshPzOp_QCv4EEZeF_D",
  "PL_XW5f-8WbWHgU5Piur86UHwb1dfDX10i",
  "PL_XW5f-8WbWFH5RITspSW51Rh5nHPMbFv",
  "PL_XW5f-8WbWFgFRRk6Mz9aMoQqLwtnN2Q",
  "PL_XW5f-8WbWG1OhSGBSHzV78V6fYwUnEe",
  "PL_XW5f-8WbWFLGdeEgS06fzlagL1fA6Ym",
];

/**
 * Fetches videos from a specific YouTube playlist. Cached for 1 hour.
 *
 * Uses a two-step fetch: playlistItems for video IDs, then videos.list
 * for actual publish dates and privacy status. Filters out private/scheduled
 * videos and sorts by publish date (latest first).
 */
export async function getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !playlistId) {
    return [];
  }

  try {
    // Step 1: Get video IDs from playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=50`;
    const playlistRes = await fetch(playlistUrl, { next: { revalidate: 3600 } });

    if (!playlistRes.ok) {
      console.error("YouTube PlaylistItems API error:", playlistRes.status, await playlistRes.text());
      return [];
    }

    const playlistData = await playlistRes.json();
    const videoIds = (playlistData.items || [])
      .filter(
        (item: { snippet: { resourceId?: { videoId?: string } } }) =>
          item.snippet.resourceId?.videoId
      )
      .map(
        (item: { snippet: { resourceId: { videoId: string } } }) =>
          item.snippet.resourceId.videoId
      );

    if (videoIds.length === 0) return [];

    // Step 2: Fetch actual video details (publish date, privacy status)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(",")}&part=snippet,status`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 3600 } });

    if (!videosRes.ok) {
      console.error("YouTube Videos API error:", videosRes.status, await videosRes.text());
      return [];
    }

    const videosData = await videosRes.json();

    return (videosData.items || [])
      .filter(
        (item: { status: { privacyStatus: string } }) =>
          item.status.privacyStatus === "public"
      )
      .map(
        (item: {
          id: string;
          snippet: {
            title: string;
            thumbnails: { high?: { url: string }; default?: { url: string } };
            publishedAt: string;
          };
        }) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id}`,
        })
      )
      .sort(
        (a: YouTubeVideo, b: YouTubeVideo) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  } catch (error) {
    console.error("Failed to fetch playlist videos:", error);
    return [];
  }
}
