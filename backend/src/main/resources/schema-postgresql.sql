-- ============================================================================
-- VERITAS PLATFORM UNIVERSAL POSTGRESQL & GRAPH SCHEMA
-- Enterprise Relational Entities + Graph Topology for Academic Integrity
-- Supports Recursive CTE Collusion Tracing & Cryptographic Ledger Audit
-- ============================================================================

-- 1. Universal User Directory
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT', -- STUDENT, INSTRUCTOR, OMBUDSMAN, AUDITOR
    institution VARCHAR(255) DEFAULT 'Stanford Academic Integrity Lab',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Classrooms & Cohorts
CREATE TABLE IF NOT EXISTS classrooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    instructor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    term VARCHAR(50) DEFAULT 'Fall 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Academic Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT,
    max_marks DOUBLE PRECISION DEFAULT 100.0,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Submissions & Cryptographic Attestations
CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    raw_text TEXT NOT NULL,
    similarity_score DOUBLE PRECISION DEFAULT 0.0,
    final_marks DOUBLE PRECISION DEFAULT 100.0,
    penalty_reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, EVALUATED, FLAGGED_FOR_REVIEW
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ledger_hash VARCHAR(64),
    evidentiary_seal VARCHAR(128),
    audit_report_json TEXT,
    matched_sources_json TEXT
);

-- 5. Graph Topology: Nodes (Students, Documents, Source Corpus, Citations)
CREATE TABLE IF NOT EXISTS graph_nodes (
    node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- STUDENT, SUBMISSION, CORPUS_DOC, EXTERNAL_SOURCE
    label VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Graph Topology: Edges (Collusion, Derivation, Citations, AST Clone)
CREATE TABLE IF NOT EXISTS graph_edges (
    edge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node UUID NOT NULL REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
    target_node UUID NOT NULL REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL, -- COPIED_FROM, DERIVED_FROM, AST_CLONE, CITATION_EXCLUSION
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0, -- Similarity percentage (0.0 - 100.0)
    time_delta_minutes INT DEFAULT 0,
    direction VARCHAR(50) DEFAULT 'DIRECTED',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-Performance Indices for Graph Traversal
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_node);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_node);
CREATE INDEX IF NOT EXISTS idx_graph_edges_rel ON graph_edges(relationship);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_hash ON submissions(ledger_hash);

-- 8. Recursive CTE View for Multi-Hop Collusion Chain & Patient Zero Tracing
CREATE OR REPLACE VIEW view_collusion_chains AS
WITH RECURSIVE collusion_path AS (
    -- Anchor: direct edges exceeding 25.0% collusion threshold
    SELECT 
        e.source_node,
        e.target_node,
        1 AS depth,
        e.weight AS initial_similarity,
        e.time_delta_minutes,
        ARRAY[e.source_node, e.target_node] AS path_nodes
    FROM graph_edges e
    WHERE e.relationship IN ('COPIED_FROM', 'DERIVED_FROM', 'AST_CLONE')
      AND e.weight >= 25.0

    UNION ALL

    -- Recursive traversal: follow who copied from the copier
    SELECT 
        p.source_node,
        e.target_node,
        p.depth + 1,
        p.initial_similarity,
        p.time_delta_minutes + e.time_delta_minutes,
        p.path_nodes || e.target_node
    FROM collusion_path p
    JOIN graph_edges e ON p.target_node = e.source_node
    WHERE NOT (e.target_node = ANY(p.path_nodes)) -- Prevent cycle infinite loops
      AND p.depth < 10
)
SELECT 
    source_node AS patient_zero_node,
    target_node AS derived_copy_node,
    depth AS hops,
    initial_similarity AS similarity_score,
    time_delta_minutes
FROM collusion_path;
