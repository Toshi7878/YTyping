import { GetYouTubeMovieInfo } from "@/app/edit/ts/type";
import { UploadResult } from "@/types";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  const { videoId } = await req.json();
  const API_KEY = process.env.GCP_AUTH_KEY;

  // 動画情報の取得
  const videoResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
  );
  const videoData = await videoResponse.json();

  if (videoData.items.length === 0) {
    const errorInfo: UploadResult = {
      id: null,
      title: "譜面情報生成に失敗しました",
      message: "手動で設定するか、しばらく時間をおいてからもう一度お試しください",
      status: 500,
    };
    return NextResponse.json(errorInfo);
  }

  const { channelTitle, description, title, tags }: GetYouTubeMovieInfo =
    videoData.items[0].snippet;

  return NextResponse.json({ channelTitle, description, title, tags });
}
