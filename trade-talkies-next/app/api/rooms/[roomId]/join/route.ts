import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { uid } = await request.json();
    
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const room = await prisma.room.update({
      where: { id: params.roomId },
      data: {
        memberIDs: {
          push: user.id
        }
      }
    });

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
