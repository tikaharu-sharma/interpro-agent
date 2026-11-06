import type { Protein } from "../types";

const ORGANISMS: Record<string, string> = {
    "3702": "Arabidopsis thaliana",
    "2711": "Citrus sinensis",
};

interface Props {
    proteins: Protein[];
}

export default function ProteinsTable({ proteins }: Props) {
    return (
        <details className="evidence">
            <summary>Proteins ({proteins.length})</summary>
            <table>
                <thead>
                    <tr>
                        <th>Accession</th>
                        <th>Gene</th>
                        <th>Name</th>
                        <th>Organism</th>
                        <th>Length</th>
                    </tr>
                </thead>
                <tbody>
                    {proteins.map((p) => (
                        <tr key={p.accession}>
                            <td>
                                <a
                                    href={`https://www.uniprot.org/uniprotkb/${p.accession}/entry`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {p.accession}
                                </a>
                            </td>
                            <td>{p.gene}</td>
                            <td>{p.name}</td>
                            <td>{ORGANISMS[p.taxon_id] ?? p.taxon_id}</td>
                            <td>{p.length}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    );
}
