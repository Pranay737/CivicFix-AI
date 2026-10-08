package com.civicfix.ai;

public interface LlmClient {
    String generateText(String prompt, String systemInstruction);
    boolean isAvailable();
}
