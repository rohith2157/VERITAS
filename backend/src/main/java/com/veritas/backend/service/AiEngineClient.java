package com.veritas.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiEngineClient {

    private final RestClient restClient;

    public AiEngineClient(@Value("${veritas.ai-engine.url:http://localhost:8000}") String aiEngineUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiEngineUrl)
                .build();
    }

    public Map<String, Object> compare1to1(String textA, String textB, String titleA, String titleB, boolean excludeQuotes, boolean excludeBiblio) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("text_a", textA);
        payload.put("text_b", textB);
        payload.put("title_a", titleA);
        payload.put("title_b", titleB);
        payload.put("exclude_quotes", excludeQuotes);
        payload.put("exclude_bibliography", excludeBiblio);

        return restClient.post()
                .uri("/api/v1/compare/one-to-one")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> compareCohort(List<Map<String, Object>> documents, double threshold) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("documents", documents);
        payload.put("collusion_threshold", threshold);
        payload.put("exclude_quotes", true);
        payload.put("exclude_bibliography", true);

        return restClient.post()
                .uri("/api/v1/compare/many-to-many")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> detectAiForensics(String text) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("text", text);

        return restClient.post()
                .uri("/api/v1/detect/ai-forensics")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> detectCodeAst(String codeA, String codeB, String language) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("code_a", codeA);
        payload.put("code_b", codeB);
        payload.put("language", language);

        return restClient.post()
                .uri("/api/v1/detect/code-ast")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }
}

