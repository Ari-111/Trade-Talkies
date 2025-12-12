import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Button>Create Room</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`} className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-muted-foreground mb-4">{room.description}</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{room._count.members} members</span>
                <div className="flex gap-2">
                  {room.tags.map((tag) => (
                    <span key={tag} className="bg-secondary px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
