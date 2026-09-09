"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { MessageCircle, X, Send } from "lucide-react";
import { COMPANY } from "@/lib/constants";

type ChatMessage = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "2 BHK flat Hirapur mein available hai?",
  "Budget 50 lakh mein kya milega?",
  "Apni property sell karni hai",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const fallback = await res.text().catch(() => "");
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: fallback || "Kuch gadbad ho gayi, kripya dobara try karein.",
          };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const chunk = accumulated;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: chunk };
          return copy;
        });
        scrollToBottom();
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Connection issue aa gaya. Seedhe call/WhatsApp karein: ${COMPANY.phone}`,
        };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with our AI assistant"}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-cream-50 shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
            <Image src="/images/ai-avatar.svg" alt="AI Assistant" fill className="object-cover" />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-2xl md:bottom-24 md:right-6">
          <div className="flex items-center gap-3 border-b border-navy-950/8 bg-navy-950 px-4 py-3 text-cream-50">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
              <Image src="/images/ai-avatar.svg" alt="AI Assistant" fill className="object-cover" />
            </span>
            <div>
              <p className="text-sm font-semibold">Riya · {COMPANY.name}</p>
              <p className="text-xs text-cream-100/70">Aapki property queries ka jawab, turant</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <p className="text-sm text-slate-600">
                    Namaste! Main Riya hoon, {COMPANY.name} ki virtual assistant. Property dhundhni
                    ho, price janna ho, ya kuch bhi poochna ho — bataiye.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-navy-950/15 px-3 py-1.5 text-xs text-navy-900 hover:bg-navy-950/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user" ? "bg-navy-950 text-cream-50" : "bg-navy-950/5 text-navy-950"
                  }`}
                >
                  {m.content || (sending && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-navy-950/8 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna sawaal likhein..."
              disabled={sending}
              className="flex-1 rounded-full border border-navy-950/15 px-3.5 py-2 text-sm focus:border-gold-500 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-950 text-cream-50 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
