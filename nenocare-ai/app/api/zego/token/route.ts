import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    roomId?: string;
    userId?: string;
    userName?: string;
  };

  if (!body.roomId || !body.userId || !body.userName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const appId = Number(process.env.ZEGOCLOUD_APPID || 0);
  const serverSecret = process.env.ZEGOCLOUD_SERVERSECRET || "";

  if (!appId || !serverSecret) {
    return NextResponse.json({ error: "Zego config missing" }, { status: 500 });
  }

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appId,
    serverSecret,
    body.roomId,
    body.userId,
    body.userName
  );

  return NextResponse.json({ kitToken });
}
