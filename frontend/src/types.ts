// Contract with the backend (backend/adv_agent.py serializers + adv_server.py).
// If the backend response changes, update this file.

export interface Protein {
    accession: string;
    taxon_id: string;
    name: string;
    description: string;
    length: string;
    sequence: string;
    proteome: string;
    gene: string;
    go_terms: string[];
    go_term_names: Record<string, string>; // GO ID -> name
    entities: string[];
}

export interface ProteinSummary{
    accession: string;
    name: string;
    description: string;
}

export interface GoTerm {
    id: string;
    name: string;
    category: string;
    proteins: ProteinSummary[];
}

export interface Literature {
    id: string;
    title: string;
    url: string;
}

export interface Entity {
    accession: string;
    type: string;
    name: string;
    description: string;
    literatures: Literature[];
    proteins: ProteinSummary[];
}

export interface OrthologHit {
    // from the BLAST run (L886-898)
    query_accession: string;
    accession: string;
    identity_percent: number;
    query_coverage_percent: number;
    subject_coverage_percent: number;
    evalue: number;
    bit_score: number;
    // added per hit (L1095-1112)
    source_accession: string;
    source_taxon_id: string;
    source_organism: string;
    target_taxon_id: string;
    target_organism: string;
    reverse_best_accession: string | null;
    reciprocal_best_hit: boolean;
    orthology_status: "RBH candidate" | "Similar protein; RBH not confirmed";
}


export interface OrthologSummary {
    source_accession: string;
    source_organism: string;
    target_organism: string;
    target_taxon_id: string;
    candidate_count: number;
    rbh_count: number;
    results: OrthologHit[];
    method: string;
    external_api_used: boolean;
    caveat: string;
}

export interface ChatResponse {
    answer: string;
    query_protein: Protein | null;
    proteins: Protein[];
    go_terms: GoTerm[];
    entities: Entity[];
    ortholog_results: OrthologSummary[];
}

export interface ApiError {
    detail: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    data?: ChatResponse;   // the evidence; only on assistant messages
    error?: boolean;       // true when the "answer" is really an error message
}

