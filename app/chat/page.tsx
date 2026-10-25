"use client";

import { useState } from "react";
import ChatBot from "@/components/chat/ChatBot";

export default function ChatPage() {
  const [session, setSession] = useState(0);
  return <ChatBot key={session} onReset={() => setSession((s) => s + 1)} />;
}
