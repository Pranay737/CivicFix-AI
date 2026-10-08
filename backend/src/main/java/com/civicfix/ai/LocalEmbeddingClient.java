package com.civicfix.ai;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Component("localEmbeddingClient")
public class LocalEmbeddingClient implements EmbeddingClient {

    private static final int DIMENSION = 768;

    @Override
    public List<Float> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            List<Float> empty = new ArrayList<>(DIMENSION);
            for (int i = 0; i < DIMENSION; i++) empty.add(0.0f);
            return empty;
        }

        float[] vector = new float[DIMENSION];
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        String[] words = normalized.split("\\s+");

        try {
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");

            // Word-level hash distribution
            for (String word : words) {
                if (word.isBlank()) continue;
                byte[] wBytes = word.getBytes(StandardCharsets.UTF_8);

                byte[] hash1 = md5.digest(wBytes);
                byte[] hash2 = sha256.digest(wBytes);

                for (int i = 0; i < hash1.length; i++) {
                    int idx1 = Math.abs((hash1[i] * 31 + i) % DIMENSION);
                    vector[idx1] += (hash1[i] & 0xFF) / 255.0f;
                }

                for (int i = 0; i < hash2.length; i++) {
                    int idx2 = Math.abs((hash2[i] * 17 + i * 3) % DIMENSION);
                    vector[idx2] += (hash2[i] & 0xFF) / 255.0f;
                }
            }

            // Character n-gram distribution for fuzzy matching
            for (int i = 0; i < normalized.length() - 2; i++) {
                String trigram = normalized.substring(i, i + 3);
                int hash = Math.abs(trigram.hashCode() % DIMENSION);
                vector[hash] += 0.5f;
            }

        } catch (NoSuchAlgorithmException ignored) {}

        // L2 Normalize
        double norm = 0.0;
        for (float v : vector) {
            norm += v * v;
        }
        norm = Math.sqrt(norm);

        List<Float> result = new ArrayList<>(DIMENSION);
        if (norm > 0) {
            for (float v : vector) {
                result.add((float) (v / norm));
            }
        } else {
            for (int i = 0; i < DIMENSION; i++) result.add(0.0f);
        }

        return result;
    }

    @Override
    public int getDimension() {
        return DIMENSION;
    }
}
