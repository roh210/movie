"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChatUI({ messages, setMessages }) {
  const [input, setInput] = useState(""); // Stores user input
  const [loading, setLoading] = useState(false); // Tracks API loading state

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to state
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput(""); // Clear input
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();
      console.log("AI Response:", data);

      // Add AI response to messages
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/**ADD TAILWIND TO CLASS NAME TO ADJUST SIZING OF THE CHAT BOT */}
      <ScrollArea className="h-[400px] border p-4">
        {messages.map((m, index) => (
          <div key={index} className="mb-3">
            {m.role === "user" && (
              <Card className="bg-gray-200 p-2 rounded-lg">
                <Avatar>
                  <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-a-TsxH9PktJwB8farsqn2EOlcsO9ODhp_Q&s" />
                </Avatar>
                <p>
                  <strong>User:</strong> {m.content}
                </p>
              </Card>
            )}
            {m.role === "assistant" && (
              <Card className="bg-blue-200 p-2 rounded-lg">
                <Avatar>
                  <AvatarImage src="https://img.freepik.com/free-vector/gradient-ai-robot-vectorart_78370-4114.jpg" />
                </Avatar>
                <p>
                  <strong>AI:</strong> {m.content}
                </p>
              </Card>
            )}
          </div>
        ))}
        {loading && <p>Loading...</p>}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex mt-4">
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
        />
        <Button type="submit" disabled={loading} className="ml-2">
          {loading ? "Thinking..." : "Send"}
        </Button>
      </form>
    </>
  );
}
