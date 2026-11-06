import type { OrthologSummary } from "../types";

interface Props {
    summary: OrthologSummary;
}

export default function OrthologsTable({ summary }: Props) {
    return (
        <details className="evidence" open>
            <summary>
                Ortholog candidates: {summary.source_accession} in {summary.target_organism} ({summary.rbh_count} RBH of {summary.candidate_count})
            </summary>
            <table>
                <thead>
                    <tr>
                        <th>Accession</th><th>Identity %</th><th>Query cov. %</th>
                        <th>E-value</th><th>Bit score</th><th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.results.map((h, i) => (
                        <tr key={`${h.accession}-${i}`}>
                            <td>
                                <a href={`https://www.uniprot.org/uniprotkb/${h.accession}/entry`} target="_blank" rel="noreferrer">
                                    {h.accession}
                                </a>
                            </td>
                            <td>{h.identity_percent}</td>
                            <td>{h.query_coverage_percent}</td>
                            <td>{h.evalue === 0 ? "0" : h.evalue.toExponential(1)}</td>
                            <td>{h.bit_score}</td>
                            <td>{h.orthology_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="caveat">{summary.caveat}</p>
        </details>
    );
}
