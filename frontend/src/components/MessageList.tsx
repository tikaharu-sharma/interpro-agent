import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "../types";

interface Props {
    messages: Message[];
    loading: boolean;
}

export default function MessageList({ messages, loading }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    return (
        <main className="messages">
            {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
            ))}
            {loading && <div className="thinking">Thinking…</div>}
            <div ref={bottomRef} />
        </main>
    );
}
