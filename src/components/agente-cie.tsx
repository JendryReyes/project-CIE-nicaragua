import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Send, X, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

export function AgenteCIE() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/60 bg-primary px-4 py-3">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Bot className="h-5 w-5" />
              <span className="font-display text-sm font-medium">Asistente CIE</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Cerrar asistente"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-[min(60vh,420px)] flex-col gap-3 overflow-y-auto bg-muted/30 p-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Hola, soy tu asistente del CIE.</p>
                <p className="mt-1">Puedo ayudarte con:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Sedes y niños atendidos</li>
                  <li>Resumen de facturación INSS</li>
                  <li>Puntualidad y asistencia de hoy</li>
                  <li>Planificación de horas</li>
                  <li>Catálogo de servicios clínicos</li>
                </ul>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";
              const text = m.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
              return (
                <div
                  key={m.id}
                  className={`flex max-w-[90%] flex-col gap-1 ${isUser ? "self-end" : "self-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card text-foreground"
                    }`}
                  >
                    {isUser ? (
                      text
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="self-start rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border/60 bg-card p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre sedes, niños, facturación..."
              className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  );
}

