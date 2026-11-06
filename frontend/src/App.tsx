import { useState } from "react";
import { askQuestion } from "./api";
import type { Message } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [threadId] = useState(() => crypto.randomUUID());

    async function handleSend(query: string) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: query }]);
        setLoading(true);
        try {
            const data = await askQuestion(query, threadId);
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: data.answer, data }]);
        } catch (e) {
            const text = e instanceof TypeError
                ? "Can't reach the server. Is the backend running?"
                : (e as Error).message;
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text, error: true }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {messages.map((m) => (
                <div key={m.id}>
                  <b>{m.role}:</b>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                </div>))}
            {loading && <p>Thinking…</p>}
            <form onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim() || loading) return;
                handleSend(input.trim());
                setInput("");
            }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} />
                <button disabled={loading}>Send</button>
            </form>
        </div>
    );
}

export default App;
