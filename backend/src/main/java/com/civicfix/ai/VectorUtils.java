package com.civicfix.ai;

import java.util.ArrayList;
import java.util.List;

public final class VectorUtils {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private VectorUtils() {}

    /**
     * Calculates the great-circle distance between two geographic coordinates in meters
     * using the Haversine formula.
     */
    public static double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Calculates cosine similarity between two float vectors. Returns value in [-1, 1].
     */
    public static double cosineSimilarity(List<Float> v1, List<Float> v2) {
        if (v1 == null || v2 == null || v1.isEmpty() || v2.isEmpty()) {
            return 0.0;
        }
        int minLen = Math.min(v1.size(), v2.size());
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < minLen; i++) {
            float a = v1.get(i);
            float b = v2.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Parses a string representation of vector (e.g. "[0.12, 0.45, ...]") into a List<Float>.
     */
    public static List<Float> parseVector(String vectorStr) {
        if (vectorStr == null || vectorStr.isBlank()) {
            return List.of();
        }
        String clean = vectorStr.trim();
        if (clean.startsWith("[")) clean = clean.substring(1);
        if (clean.endsWith("]")) clean = clean.substring(0, clean.length() - 1);

        String[] parts = clean.split(",");
        List<Float> result = new ArrayList<>(parts.length);
        for (String p : parts) {
            try {
                result.add(Float.parseFloat(p.trim()));
            } catch (NumberFormatException ignored) {}
        }
        return result;
    }

    /**
     * Serializes List<Float> to a string representation for storage.
     */
    public static String serializeVector(List<Float> vector) {
        if (vector == null || vector.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.size(); i++) {
            sb.append(vector.get(i));
            if (i < vector.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
