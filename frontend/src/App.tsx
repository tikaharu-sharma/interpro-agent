import { useState } from "react";
import { askQuestion } from "./api";
import type { Message } from "./types";
import MessageList from "./components/MessageList";
import Composer from "./components/Composer";

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
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
        <div className="app">
            <header className="header">
                <h1>InterPro Agent</h1>
                <p>Ask about plant proteins, GO terms and InterPro entries. Each question is answered independently.</p>
            </header>
            <MessageList messages={messages} loading={loading} />
            <Composer onSend={handleSend} disabled={loading} />
        </div>
    );
}

export default App;
