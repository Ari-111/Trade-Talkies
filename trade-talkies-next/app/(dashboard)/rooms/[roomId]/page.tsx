"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  senderUsername: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: { roomId: string } }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  const { data: initialMessages } = useQuery({
    queryKey: ["messages", params.roomId],
    queryFn: async () => {
      // Assuming default channel is 'general' for now, or we need to fetch channels first
      // For simplicity, let's assume the roomId IS the channelId for this demo, 
      // or we fetch the first channel of the room.
      // In the real app, we'd list channels on the side.
      // Let's just use the roomId as the channelId for the socket room for now.
      const res = await fetch(`/api/messages/${params.roomId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      path: "/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket");
      newSocket.emit("join_channel", params.roomId);
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [params.roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !auth.currentUser) return;

    const messageData = {
      channelId: params.roomId,
      roomId: params.roomId,
      content: input,
      senderUid: auth.currentUser.uid,
      senderUsername: auth.currentUser.displayName || "Anonymous",
      senderPhotoURL: auth.currentUser.photoURL,
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    // setMessages((prev) => [...prev, { ...messageData, id: "temp-" + Date.now() }]);
    
    // Send to socket
    socket.emit("send_message", messageData);
    
    // Persist to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.senderUsername === auth.currentUser?.displayName ? "items-end" : "items-start"}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${msg.senderUsername === auth.currentUser?.displayName ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              <p className="text-xs opacity-70 mb-1">{msg.senderUsername}</p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
