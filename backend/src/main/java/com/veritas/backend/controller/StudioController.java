package com.veritas.backend.controller;

import com.veritas.backend.service.AiEngineClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/studio")
@CrossOrigin(origins = "*")
public class StudioController {

    private final AiEngineClient aiEngineClient;

    public StudioController(AiEngineClient aiEngineClient) {
        this.aiEngineClient = aiEngineClient;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> res = new HashMap<>();
        res.put("status", "UP");
        res.put("gateway", "Veritas Spring Boot 3 Gateway");
        res.put("java_version", "21 LTS");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/compare-1to1")
    public ResponseEntity<Map<String, Object>> compare1to1(@RequestBody Map<String, Object> payload) {
        String textA = (String) payload.getOrDefault("text_a", "");
        String textB = (String) payload.getOrDefault("text_b", "");
        String titleA = (String) payload.getOrDefault("title_a", "Document A");
        String titleB = (String) payload.getOrDefault("title_b", "Document B");
        boolean excludeQuotes = payload.get("exclude_quotes") != null ? Boolean.parseBoolean(payload.get("exclude_quotes").toString()) : true;
        boolean excludeBiblio = payload.get("exclude_bibliography") != null ? Boolean.parseBoolean(payload.get("exclude_bibliography").toString()) : true;

        Map<String, Object> result = aiEngineClient.compare1to1(textA, textB, titleA, titleB, excludeQuotes, excludeBiblio);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cohort-matrix")
    public ResponseEntity<Map<String, Object>> cohortMatrix(@RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> documents = (List<Map<String, Object>>) payload.get("documents");
        Double threshold = payload.get("collusion_threshold") != null ? Double.valueOf(payload.get("collusion_threshold").toString()) : 25.0;

        Map<String, Object> result = aiEngineClient.compareCohort(documents, threshold);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ai-forensics")
    public ResponseEntity<Map<String, Object>> aiForensics(@RequestBody Map<String, String> payload) {
        String text = payload.getOrDefault("text", "");
        Map<String, Object> result = aiEngineClient.detectAiForensics(text);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/code-ast")
    public ResponseEntity<Map<String, Object>> codeAst(@RequestBody Map<String, String> payload) {
        String codeA = payload.getOrDefault("code_a", "");
        String codeB = payload.getOrDefault("code_b", "");
        String lang = payload.getOrDefault("language", "python");

        Map<String, Object> result = aiEngineClient.detectCodeAst(codeA, codeB, lang);
        return ResponseEntity.ok(result);
    }
}

