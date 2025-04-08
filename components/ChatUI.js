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
      <section className="py-10 px-4 bg-[#252525]">
        <h2 class="text-center text-white text-2xl font-semibold mb-4">
          🎥 Need a film recommendation?
        </h2>
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
          {loading && <p className="text-white">Loading...</p>}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex mt-4">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Chat to the AI for a mood analysis..."
            className="w-full sm:w-3/5 px-4 py-2 rounded-md text-white text-base"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold ml-[4px] px-6 py-2 rounded-md transition "
          >
            {loading ? "Thinking..." : "Send"}
          </Button>
        </form>
      </section>
    </>
  );
}
