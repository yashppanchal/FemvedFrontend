import type {
  LibraryStreamResponse,
  MyLibraryVideoDto,
} from "../api/library";

/** Flip to `false` to use only live `/users/me/library` data. */
export const USE_MOCK_MY_LIBRARY_FOR_DESIGN = true;

export function isMockLibraryVideo(video: MyLibraryVideoDto): boolean {
  return video.videoId.startsWith("mock-");
}

export const MOCK_MY_LIBRARY_VIDEOS: MyLibraryVideoDto[] = [
  {
    videoId: "mock-mc-sleep",
    title: "Sleep & nervous system reset",
    slug: "mock-sleep-masterclass",
    cardImage: null,
    iconEmoji: "🌙",
    gradientClass: "grad-1",
    videoType: "MASTERCLASS",
    totalDuration: "1h 12m",
    episodeCount: null,
    expertName: "Dr. Ananya Mehta",
    purchasedAt: "2025-03-01T10:00:00.000Z",
    watchProgressSeconds: 42 * 60,
    lastWatchedAt: "2026-04-08T19:30:00.000Z",
    categorySlug: "sleep-rest",
  },
  {
    videoId: "mock-series-movement",
    title: "Movement for hormone balance",
    slug: "mock-movement-series",
    cardImage: null,
    iconEmoji: "🧘",
    gradientClass: "grad-3",
    videoType: "SERIES",
    totalDuration: "4h 20m",
    episodeCount: 6,
    expertName: "Priya Nair",
    purchasedAt: "2026-02-14T14:20:00.000Z",
    watchProgressSeconds: 52 * 60,
    lastWatchedAt: "2026-04-10T09:15:00.000Z",
    categorySlug: "movement",
  },
];

/** Public sample (Big Buck Bunny) for layout testing — replace with real streams in production. */
const MOCK_SAMPLE_WATCH_URL =
  "https://www.youtube.com/watch?v=aqz-KE-bpKQ";

export function buildMockLibraryStream(
  video: MyLibraryVideoDto,
): LibraryStreamResponse {
  if (video.videoType === "SERIES") {
    return {
      videoId: video.videoId,
      videoType: "SERIES",
      streamUrl: null,
      overallProgressSeconds: video.watchProgressSeconds,
      lastWatchedAt: video.lastWatchedAt ?? undefined,
      episodes: [
        {
          episodeId: "mock-ep-1",
          episodeNumber: 1,
          title: "Foundations — breath and alignment",
          streamUrl: MOCK_SAMPLE_WATCH_URL,
          watchProgressSeconds: 52 * 60,
          isCompleted: false,
        },
        {
          episodeId: "mock-ep-2",
          episodeNumber: 2,
          title: "Hips and core — gentle strength",
          streamUrl: MOCK_SAMPLE_WATCH_URL,
          watchProgressSeconds: 0,
          isCompleted: false,
        },
        {
          episodeId: "mock-ep-3",
          episodeNumber: 3,
          title: "Nervous system downshift",
          streamUrl: null,
          watchProgressSeconds: 0,
          isCompleted: false,
        },
        {
          episodeId: "mock-ep-4",
          episodeNumber: 4,
          title: "Cycle-aware pacing",
          streamUrl: null,
          watchProgressSeconds: 0,
          isCompleted: false,
        },
        {
          episodeId: "mock-ep-5",
          episodeNumber: 5,
          title: "Integration flow",
          streamUrl: null,
          watchProgressSeconds: 0,
          isCompleted: false,
        },
        {
          episodeId: "mock-ep-6",
          episodeNumber: 6,
          title: "Closing ritual",
          streamUrl: null,
          watchProgressSeconds: 0,
          isCompleted: false,
        },
      ],
    };
  }

  return {
    videoId: video.videoId,
    videoType: "MASTERCLASS",
    streamUrl: MOCK_SAMPLE_WATCH_URL,
    episodes: [],
    overallProgressSeconds: video.watchProgressSeconds,
    lastWatchedAt: video.lastWatchedAt ?? undefined,
  };
}
