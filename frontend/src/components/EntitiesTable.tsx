import type { Entity } from "../types";

interface Props {
    entities: Entity[];
}

export default function EntitiesTable({ entities }: Props) {
    return (
        <details className="evidence">
            <summary>InterPro entries ({entities.length})</summary>
            <table>
                <thead>
                    <tr><th>Accession</th><th>Type</th><th>Name</th></tr>
                </thead>
                <tbody>
                    {entities.map((e) => (
                        <tr key={e.accession}>
                            <td>
                                <a href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${e.accession}/`} target="_blank" rel="noreferrer">
                                    {e.accession}
                                </a>
                            </td>
                            <td>{e.type}</td>
                            <td>{e.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    );
}
