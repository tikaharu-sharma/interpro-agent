import { useState } from "react";
import { askQuestion } from "./api";
import type { Message } from "./types";
import MessageList from "./components/MessageList";
import Composer from "./components/Composer";

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState(() => crypto.randomUUID());

    async function handleSend(query: string) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: query }]);
        setLoading(true);
        try {
            const data = await askQuestion(query, threadId);
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: data.answer, data }]);
        } catch (e) {
            let text: string;
            if (e instanceof TypeError) {
                text = "Can't reach the server. Is the backend running?";
            } else {
                text = `${(e as Error).message} The conversation was reset, so earlier questions are forgotten.`;
                setThreadId(crypto.randomUUID());
            }
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text, error: true }]);
        }
        finally {
            setLoading(false);
        }
    }

    function newChat(){
        setMessages([]);
        setThreadId(crypto.randomUUID());
    }

    return (
        <div className="app">
            <header className="header">
                <div>
                    <h1>InterPro Agent</h1>
                    <p>Ask about plant proteins, GO terms and InterPro entries. Follow-up questions remember this conversation until you start a new chat or reload the page.</p>
                </div>
                <button
                    className="new-chat"
                    onClick={newChat}
                    disabled={loading || messages.length === 0}
                >
                    New chat
                </button>
            </header>       

            <MessageList messages={messages} loading={loading} />
            <Composer onSend={handleSend} disabled={loading} />
        </div>
    );
}

export default App;
