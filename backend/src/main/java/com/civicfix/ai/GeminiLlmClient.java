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

@Slf4j
@Component("geminiLlmClient")
public class GeminiLlmClient implements LlmClient {

    private final String apiKey;
    private final String baseUrl;
    private final String chatModel;
    private final RuleBasedLlmClient fallbackClient;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiLlmClient(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${app.ai.gemini.chat-model:gemini-2.5-flash}") String chatModel,
            RuleBasedLlmClient fallbackClient,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl;
        this.chatModel = chatModel;
        this.fallbackClient = fallbackClient;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        if (this.apiKey.isBlank()) {
            log.info("Gemini API key is not configured. GeminiLlmClient will use RuleBased fallback.");
        } else {
            log.info("Gemini LLM Client initialized with model: {}", chatModel);
        }
    }

    @Override
    public boolean isAvailable() {
        return !apiKey.isBlank();
    }

    @Override
    public String generateText(String prompt, String systemInstruction) {
        if (!isAvailable()) {
            return fallbackClient.generateText(prompt, systemInstruction);
        }

        try {
            String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, chatModel, apiKey);

            ObjectNode root = objectMapper.createObjectNode();

            // System instruction if provided
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                ObjectNode sysNode = objectMapper.createObjectNode();
                ArrayNode sysParts = sysNode.putArray("parts");
                sysParts.addObject().put("text", systemInstruction);
                root.set("systemInstruction", sysNode);
            }

            // Contents
            ArrayNode contents = root.putArray("contents");
            ObjectNode contentObj = contents.addObject();
            contentObj.put("role", "user");
            ArrayNode parts = contentObj.putArray("parts");
            parts.addObject().put("text", prompt);

            // Generation config
            ObjectNode genConfig = root.putObject("generationConfig");
            genConfig.put("temperature", 0.2);
            genConfig.put("responseMimeType", "application/json");

            String requestBody = objectMapper.writeValueAsString(root);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode resNode = objectMapper.readTree(response.body());
                JsonNode candidates = resNode.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            } else {
                log.warn("Gemini API returned status {}: {}. Falling back to rule-based engine.",
                        response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Gemini API call encountered exception: {}. Using rule-based fallback.", e.getMessage());
        }

        return fallbackClient.generateText(prompt, systemInstruction);
    }
}
