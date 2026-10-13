package com.veritas.backend.controller;

import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for graph topology and collusion detection.
 * Queries PostgreSQL graph tables and recursive CTE collusion view.
 */
@RestController
@RequestMapping("/api/graph")
@CrossOrigin(originPatterns = "*")
public class GraphController {

    private static final Logger log = LoggerFactory.getLogger(GraphController.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public GraphController(JdbcTemplate jdbcTemplate, 
                           @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    /**
     * Get multi-hop collusion chains from recursive CTE view.
     */
    @GetMapping("/collusion-chains")
    public ResponseEntity<List<Map<String, Object>>> getCollusionChains() {
        String sql = "SELECT c.patient_zero_node, n1.label AS patient_zero_name, " +
                "c.derived_copy_node, n2.label AS copy_name, " +
                "c.hops, c.similarity_score, c.time_delta_minutes " +
                "FROM view_collusion_chains c " +
                "JOIN graph_nodes n1 ON c.patient_zero_node = n1.node_id " +
                "JOIN graph_nodes n2 ON c.derived_copy_node = n2.node_id;";
        try {
            List<Map<String, Object>> chains = jdbcTemplate.queryForList(sql);
            if (chains == null || chains.isEmpty()) {
                log.info("Collusion view returned 0 rows. Serving fallback collusion dataset.");
                return ResponseEntity.ok(getFallbackCollusionChains());
            }
            log.info("Retrieved {} collusion chain records from database.", chains.size());
            return ResponseEntity.ok(chains);
        } catch (Exception ex) {
            log.warn("Database query failed for collusion-chains (db offline or starting up): {}. Serving fallback dataset.", ex.getMessage());
            return ResponseEntity.ok(getFallbackCollusionChains());
        }
    }

    /**
     * Get all graph nodes and edges for topology visualization.
     */
    @GetMapping("/nodes")
    public ResponseEntity<Map<String, Object>> getGraphNodes() {
        try {
            List<Map<String, Object>> nodes = jdbcTemplate.queryForList("SELECT * FROM graph_nodes;");
            List<Map<String, Object>> edges = jdbcTemplate.queryForList("SELECT * FROM graph_edges;");

            if (nodes == null || nodes.isEmpty()) {
                log.info("Graph nodes query returned 0 rows. Serving fallback topology dataset.");
                return ResponseEntity.ok(getFallbackGraphData());
            }

            for (Map<String, Object> node : nodes) {
                parseJsonField(node, "properties");
            }
            if (edges != null) {
                for (Map<String, Object> edge : edges) {
                    parseJsonField(edge, "metadata");
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("nodes", nodes);
            response.put("edges", edges != null ? edges : List.of());
            log.info("Retrieved {} graph nodes and {} graph edges from database.", nodes.size(), edges != null ? edges.size() : 0);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.warn("Database query failed for graph nodes (db offline or starting up): {}. Serving fallback dataset.", ex.getMessage());
            return ResponseEntity.ok(getFallbackGraphData());
        }
    }

    /**
     * Parse string or PGobject JSON fields into structured JsonNode.
     */
    private void parseJsonField(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null || val instanceof Map || val instanceof List) {
            return;
        }
        try {
            String str = val.toString().trim();
            if ((str.startsWith("{") && str.endsWith("}")) || (str.startsWith("[") && str.endsWith("]"))) {
                map.put(key, objectMapper.readTree(str));
            }
        } catch (Exception ignored) {
            // Keep original string if parsing fails
        }
    }

    /**
     * Provide fallback collusion chain data if database is offline.
     */
    private List<Map<String, Object>> getFallbackCollusionChains() {
        List<Map<String, Object>> list = new ArrayList<>();

        Map<String, Object> c1 = new HashMap<>();
        c1.put("patient_zero_node", "11111111-1111-1111-1111-111111111111");
        c1.put("patient_zero_name", "Arjun Patel");
        c1.put("derived_copy_node", "22222222-2222-2222-2222-222222222222");
        c1.put("copy_name", "Rohan Gupta");
        c1.put("hops", 1);
        c1.put("similarity_score", 82.0);
        c1.put("time_delta_minutes", 16);
        list.add(c1);

        Map<String, Object> c2 = new HashMap<>();
        c2.put("patient_zero_node", "11111111-1111-1111-1111-111111111111");
        c2.put("patient_zero_name", "Arjun Patel");
        c2.put("derived_copy_node", "33333333-3333-3333-3333-333333333333");
        c2.put("copy_name", "Elena Rostova");
        c2.put("hops", 1);
        c2.put("similarity_score", 34.0);
        c2.put("time_delta_minutes", 48);
        list.add(c2);

        Map<String, Object> c3 = new HashMap<>();
        c3.put("patient_zero_node", "22222222-2222-2222-2222-222222222222");
        c3.put("patient_zero_name", "Rohan Gupta");
        c3.put("derived_copy_node", "44444444-4444-4444-4444-444444444444");
        c3.put("copy_name", "David Chen");
        c3.put("hops", 1);
        c3.put("similarity_score", 64.0);
        c3.put("time_delta_minutes", 42);
        list.add(c3);

        Map<String, Object> c4 = new HashMap<>();
        c4.put("patient_zero_node", "11111111-1111-1111-1111-111111111111");
        c4.put("patient_zero_name", "Arjun Patel");
        c4.put("derived_copy_node", "44444444-4444-4444-4444-444444444444");
        c4.put("copy_name", "David Chen");
        c4.put("hops", 2);
        c4.put("similarity_score", 82.0);
        c4.put("time_delta_minutes", 58);
        list.add(c4);

        return list;
    }

    /**
     * Provide fallback graph data if database is offline.
     */
    private Map<String, Object> getFallbackGraphData() {
        List<Map<String, Object>> nodes = new ArrayList<>();

        Map<String, Object> n1 = new HashMap<>();
        n1.put("node_id", "11111111-1111-1111-1111-111111111111");
        n1.put("entity_type", "STUDENT");
        n1.put("label", "Arjun Patel");
        n1.put("properties", Map.of("email", "arjun.p@cs.university.edu", "role", "PATIENT_ZERO", "trust_score", 0.98));
        nodes.add(n1);

        Map<String, Object> n2 = new HashMap<>();
        n2.put("node_id", "22222222-2222-2222-2222-222222222222");
        n2.put("entity_type", "STUDENT");
        n2.put("label", "Rohan Gupta");
        n2.put("properties", Map.of("email", "rohan.g@cs.university.edu", "role", "COLLUDER", "trust_score", 0.41));
        nodes.add(n2);

        Map<String, Object> n3 = new HashMap<>();
        n3.put("node_id", "33333333-3333-3333-3333-333333333333");
        n3.put("entity_type", "STUDENT");
        n3.put("label", "Elena Rostova");
        n3.put("properties", Map.of("email", "elena.r@cs.university.edu", "role", "EVASION_SUSPECT", "trust_score", 0.88));
        nodes.add(n3);

        Map<String, Object> n4 = new HashMap<>();
        n4.put("node_id", "44444444-4444-4444-4444-444444444444");
        n4.put("entity_type", "STUDENT");
        n4.put("label", "David Chen");
        n4.put("properties", Map.of("email", "david.c@cs.university.edu", "role", "SYNTHETIC_AI", "trust_score", 0.22));
        nodes.add(n4);

        Map<String, Object> n5 = new HashMap<>();
        n5.put("node_id", "55555555-5555-5555-5555-555555555555");
        n5.put("entity_type", "STUDENT");
        n5.put("label", "Sarah Jenkins");
        n5.put("properties", Map.of("email", "sarah.j@cs.university.edu", "role", "VERIFIED_ORIGINAL", "trust_score", 0.99));
        nodes.add(n5);

        List<Map<String, Object>> edges = new ArrayList<>();

        Map<String, Object> e1 = new HashMap<>();
        e1.put("edge_id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        e1.put("source_node", "11111111-1111-1111-1111-111111111111");
        e1.put("target_node", "22222222-2222-2222-2222-222222222222");
        e1.put("relationship", "COPIED_FROM");
        e1.put("weight", 82.0);
        e1.put("time_delta_minutes", 16);
        e1.put("metadata", Map.of("shared_kgrams", 142, "algorithm", "winnowing_w4_k5"));
        edges.add(e1);

        Map<String, Object> e2 = new HashMap<>();
        e2.put("edge_id", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        e2.put("source_node", "22222222-2222-2222-2222-222222222222");
        e2.put("target_node", "44444444-4444-4444-4444-444444444444");
        e2.put("relationship", "DERIVED_FROM");
        e2.put("weight", 64.0);
        e2.put("time_delta_minutes", 42);
        e2.put("metadata", Map.of("shared_tokens", 89, "algorithm", "jaccard_token"));
        edges.add(e2);

        Map<String, Object> e3 = new HashMap<>();
        e3.put("edge_id", "cccccccc-cccc-cccc-cccc-cccccccccccc");
        e3.put("source_node", "11111111-1111-1111-1111-111111111111");
        e3.put("target_node", "33333333-3333-3333-3333-333333333333");
        e3.put("relationship", "AST_CLONE");
        e3.put("weight", 34.0);
        e3.put("time_delta_minutes", 48);
        e3.put("metadata", Map.of("ast_nodes_matched", 48, "algorithm", "ast_tree_diff"));
        edges.add(e3);

        Map<String, Object> res = new HashMap<>();
        res.put("nodes", nodes);
        res.put("edges", edges);
        return res;
    }
}
