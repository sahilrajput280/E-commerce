import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "👋 Hi! How can I assist you with your travel plans today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      const model = (import.meta.env.VITE_GEMINI_MODEL_NAME as string | undefined) || "gemini-2.5-flash";
      const baseUrl = (import.meta.env.VITE_GEMINI_API_URL as string | undefined) || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const systemPrompt = import.meta.env.VITE_CHATBOT_SYSTEM_PROMPT as string | undefined;
      const projectInfo = import.meta.env.VITE_CHATBOT_PROJECT_INFO as string | undefined;

      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY");
      }

      const guardrail = systemPrompt || "You are CarSe-Chalo's helpful assistant for this travel e-commerce site. Only answer about our services, bookings, packages, activities, and popular destinations. If a query is unrelated, politely steer back to these topics. Keep answers concise, helpful, and friendly.";
      const preamble = [guardrail, projectInfo].filter(Boolean).join("\n\n");

      const historyContents = [...messages, userMessage].map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));
      const contents = preamble
        ? [{ role: "user", parts: [{ text: preamble }] }, ...historyContents]
        : historyContents;

      const resp = await fetch(`${baseUrl}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const message = (data && data.error && data.error.message) || "Gemini API error";
        throw new Error(message);
      }

      const candidate = data && data.candidates && data.candidates[0];
      const reply = (candidate && candidate.content && candidate.content.parts && candidate.content.parts.map((p: any) => p.text).join("")) || "";
      setMessages((prev) => [...prev, { sender: "bot", text: reply || "(No response)" }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Gemini request failed:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ Gemini error: ${message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Chat Display */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gradient-to-b from-white to-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow transition-opacity duration-300 animate-fadeIn ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end rounded-br-none"
                : "bg-gray-200 text-gray-900 self-start rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="text-gray-500 text-xs italic animate-pulse">CarSe-Chalo is typing...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
