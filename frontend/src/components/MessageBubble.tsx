import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";

interface Props {
    message: Message;
}

export default function MessageBubble({ message }: Props) {
    return (
        <div className={`msg ${message.role}${message.error ? " error" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
    );
}
