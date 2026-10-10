-- V3: Align embedding column type with JPA entity mapping (TEXT)
DROP INDEX IF EXISTS idx_complaints_embedding;
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;

ALTER TABLE complaints ALTER COLUMN embedding TYPE TEXT USING embedding::text;
ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE TEXT USING embedding::text;
