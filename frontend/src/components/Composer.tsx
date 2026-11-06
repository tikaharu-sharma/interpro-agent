import { useState } from "react";

interface Props {
    onSend: (query: string) => void;
    disabled: boolean;
}

export default function Composer({ onSend, disabled }: Props) {
    const [input, setInput] = useState("");

    return (
        <form
            className="composer"
            onSubmit={(e) => {
                e.preventDefault();
                const query = input.trim();
                if (!query || disabled) return;
                onSend(query);
                setInput("");
            }}
        >
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
            />
            <button disabled={disabled}>Send</button>
        </form>
    );
}
