package com.civicfix.config;

import com.civicfix.ai.EmbeddingClient;
import com.civicfix.ai.GeminiEmbeddingClient;
import com.civicfix.ai.GeminiLlmClient;
import com.civicfix.ai.LlmClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    @Bean
    @Primary
    public LlmClient primaryLlmClient(GeminiLlmClient geminiLlmClient) {
        return geminiLlmClient;
    }

    @Bean
    @Primary
    public EmbeddingClient primaryEmbeddingClient(GeminiEmbeddingClient geminiEmbeddingClient) {
        return geminiEmbeddingClient;
    }
}
