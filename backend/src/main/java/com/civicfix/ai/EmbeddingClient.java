package com.civicfix.ai;

import java.util.List;

public interface EmbeddingClient {
    List<Float> generateEmbedding(String text);
    int getDimension();
}
