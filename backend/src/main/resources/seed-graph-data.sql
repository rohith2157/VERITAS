-- ============================================================================
-- VERITAS GRAPH AND COHORT SEED DATA
-- PostgreSQL Graph Topology for Academic Integrity Collusion Tracing
-- ============================================================================

-- Graph Nodes: Students & Submissions
INSERT INTO graph_nodes (node_id, entity_type, label, properties) VALUES
('11111111-1111-1111-1111-111111111111', 'STUDENT', 'Arjun Patel', '{"email": "arjun.p@cs.university.edu", "role": "PATIENT_ZERO", "trust_score": 0.98}'),
('22222222-2222-2222-2222-222222222222', 'STUDENT', 'Rohan Gupta', '{"email": "rohan.g@cs.university.edu", "role": "COLLUDER", "trust_score": 0.41}'),
('33333333-3333-3333-3333-333333333333', 'STUDENT', 'Elena Rostova', '{"email": "elena.r@cs.university.edu", "role": "EVASION_SUSPECT", "trust_score": 0.88}'),
('44444444-4444-4444-4444-444444444444', 'STUDENT', 'David Chen', '{"email": "david.c@cs.university.edu", "role": "SYNTHETIC_AI", "trust_score": 0.22}'),
('55555555-5555-5555-5555-555555555555', 'STUDENT', 'Sarah Jenkins', '{"email": "sarah.j@cs.university.edu", "role": "VERIFIED_ORIGINAL", "trust_score": 0.99}')
ON CONFLICT (node_id) DO NOTHING;

-- Graph Edges: Multi-Hop Collusion Chains & AST Clones
INSERT INTO graph_edges (edge_id, source_node, target_node, relationship, weight, time_delta_minutes, metadata) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'COPIED_FROM', 82.0, 16, '{"shared_kgrams": 142, "algorithm": "winnowing_w4_k5"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'DERIVED_FROM', 64.0, 42, '{"shared_tokens": 89, "algorithm": "jaccard_token"}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'AST_CLONE', 34.0, 48, '{"ast_nodes_matched": 48, "algorithm": "ast_tree_diff"}')
ON CONFLICT (edge_id) DO NOTHING;
