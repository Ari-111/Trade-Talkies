import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: params.uid },
      include: {
        joinedRooms: true,
        ownedRooms: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
