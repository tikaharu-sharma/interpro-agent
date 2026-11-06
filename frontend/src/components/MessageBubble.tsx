import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";
import ProteinsTable from "./ProteinsTable";
import GoTermsTable from "./GoTermsTable";
import EntitiesTable from "./EntitiesTable";
import OrthologsTable from "./OrthologsTable";

interface Props {
    message: Message;
}

export default function MessageBubble({ message }: Props) {
    const data = message.data;

    return (
        <div className={`msg ${message.role}${message.error ? " error" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            {data && data.proteins.length > 0 && <ProteinsTable proteins={data.proteins} />}
            {data && data.go_terms.length > 0 && <GoTermsTable goTerms={data.go_terms} />}
            {data && data.entities.length > 0 && <EntitiesTable entities={data.entities} />}
            {data?.ortholog_results.map((s) => (
                <OrthologsTable key={s.source_accession} summary={s} />
            ))}
        </div>
    );
}

