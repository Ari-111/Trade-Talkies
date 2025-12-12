import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, tags, ownerUid } = body;

    // Find the user's internal ID first
    const user = await prisma.user.findUnique({ where: { uid: ownerUid } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const room = await prisma.room.create({
      data: {
        name,
        description,
        tags,
        ownerUid,
        memberIDs: [user.id], // Add creator as member
        channels: [
          { id: crypto.randomUUID(), name: "general", type: "text" },
          { id: crypto.randomUUID(), name: "announcements", type: "text" },
        ],
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
