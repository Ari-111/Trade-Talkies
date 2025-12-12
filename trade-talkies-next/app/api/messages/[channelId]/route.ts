import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { channelId: string } }) {
  try {
    const messages = await prisma.message.findMany({
      where: { channelId: params.channelId },
      orderBy: { timestamp: "asc" },
      take: 50, // Pagination limit
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
