package com.civicfix.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component("geminiEmbeddingClient")
public class GeminiEmbeddingClient implements EmbeddingClient {

    private final String apiKey;
    private final String baseUrl;
    private final String embeddingModel;
    private final LocalEmbeddingClient localFallback;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiEmbeddingClient(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${app.ai.gemini.embedding-model:text-embedding-004}") String embeddingModel,
            LocalEmbeddingClient localFallback,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl;
        this.embeddingModel = embeddingModel;
        this.localFallback = localFallback;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public List<Float> generateEmbedding(String text) {
        if (apiKey.isBlank()) {
            return localFallback.generateEmbedding(text);
        }

        try {
            String url = String.format("%s/models/%s:embedContent?key=%s", baseUrl, embeddingModel, apiKey);

            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode contentObj = root.putObject("content");
            ArrayNode parts = contentObj.putArray("parts");
            parts.addObject().put("text", text);

            String requestBody = objectMapper.writeValueAsString(root);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode resNode = objectMapper.readTree(response.body());
                JsonNode valuesNode = resNode.path("embedding").path("values");
                if (valuesNode.isArray() && !valuesNode.isEmpty()) {
                    List<Float> result = new ArrayList<>(valuesNode.size());
                    for (JsonNode val : valuesNode) {
                        result.add((float) val.asDouble());
                    }
                    return result;
                }
            } else {
                log.warn("Gemini embedding returned status {}: {}. Falling back to local vectorizer.",
                        response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Gemini embedding API call failed: {}. Using local fallback.", e.getMessage());
        }

        return localFallback.generateEmbedding(text);
    }

    @Override
    public int getDimension() {
        return 768;
    }
}
