import type { GoTerm } from "../types";

interface Props {
    goTerms: GoTerm[];
}

export default function GoTermsTable({ goTerms }: Props) {
    return (
        <details className="evidence">
            <summary>GO terms ({goTerms.length})</summary>
            <table>
                <thead>
                    <tr><th>GO ID</th><th>Name</th><th>Category</th></tr>
                </thead>
                <tbody>
                    {goTerms.map((g) => (
                        <tr key={g.id}>
                            <td>
                                <a href={`https://www.ebi.ac.uk/QuickGO/term/${g.id}`} target="_blank" rel="noreferrer">
                                    {g.id}
                                </a>
                            </td>
                            <td>{g.name}</td>
                            <td>{g.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    );
}
