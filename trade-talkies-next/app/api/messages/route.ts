import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, roomId, content, type, senderUid, senderUsername, senderPhotoURL } = body;

    const message = await prisma.message.create({
      data: {
        channelId,
        roomId,
        content,
        type: type || "text",
        senderUid,
        senderUsername,
        senderPhotoURL,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
