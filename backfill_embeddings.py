"""Add go_terms.embedding (vector(384)) and fill it for every GO term.

Safe to re-run: it only embeds rows where embedding IS NULL.
Uses the same model and normalization as generate_embedding() in adv_agent.py.

Usage (venv active, DATABASE_URL in .env pointing at the database you want to fix):
    python backfill_embeddings.py
"""
import os
import sys

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text

load_dotenv()
url = os.getenv("DATABASE_URL")
if not url:
    sys.exit("DATABASE_URL is not set (put it in .env).")

engine = create_engine(url)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")  # same as adv_agent.py
BATCH = 256


def to_vector_literal(vec) -> str:
    """pgvector accepts text like '[0.1,0.2,...]' cast to vector."""
    return "[" + ",".join(f"{float(x):.7f}" for x in vec) + "]"


# 1. migration: extension + column (both are no-ops if already there)
with engine.begin() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.execute(text("ALTER TABLE go_terms ADD COLUMN IF NOT EXISTS embedding vector(384)"))

# 2. what still needs embedding?
with engine.connect() as conn:
    rows = conn.execute(text("SELECT id, name FROM go_terms WHERE embedding IS NULL ORDER BY id")).fetchall()
print(f"{len(rows)} GO terms to embed")

# 3. embed and write back, one batch per transaction
for start in range(0, len(rows), BATCH):
    batch = rows[start:start + BATCH]
    vectors = model.encode([r.name for r in batch], normalize_embeddings=True, batch_size=64)
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE go_terms SET embedding = CAST(:v AS vector) WHERE id = :id"),
            [{"id": r.id, "v": to_vector_literal(v)} for r, v in zip(batch, vectors)],
        )
    print(f"  {min(start + BATCH, len(rows))}/{len(rows)}")

# 4. verify
with engine.connect() as conn:
    nulls = conn.execute(text("SELECT count(*) FROM go_terms WHERE embedding IS NULL")).scalar()
    dims = conn.execute(text("SELECT DISTINCT vector_dims(embedding) FROM go_terms")).scalars().all()
    print(f"rows still NULL: {nulls}   dimensions: {dims}")
    probe = "protein kinase activity"
    near = conn.execute(text(
        "SELECT id, name, embedding <=> (SELECT embedding FROM go_terms WHERE name = :n LIMIT 1) AS dist "
        "FROM go_terms WHERE EXISTS (SELECT 1 FROM go_terms WHERE name = :n) ORDER BY dist LIMIT 5"),
        {"n": probe}).fetchall()
    if near:
        print(f"nearest to '{probe}':")
        for r in near:
            print(f"  {r.dist:.3f}  {r.id}  {r.name}")
    else:
        print(f"(no GO term named '{probe}' to use as a probe; try any name from your table)")
