import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, username, displayName, photoURL, interests } = body;

    // Upsert user: create if not exists, update if exists
    const user = await prisma.user.upsert({
      where: { uid },
      update: {
        email,
        username,
        displayName,
        photoURL,
        interests,
      },
      create: {
        uid,
        email,
        username,
        displayName,
        photoURL,
        interests,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to onboard user" }, { status: 500 });
  }
}
