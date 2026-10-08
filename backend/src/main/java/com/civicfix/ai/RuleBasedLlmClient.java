package com.civicfix.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("ruleBasedLlmClient")
public class RuleBasedLlmClient implements LlmClient {

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String generateText(String prompt, String systemInstruction) {
        log.info("Executing rule-based AI analyzer fallback...");
        String lowerPrompt = prompt.toLowerCase();

        // 1. Category and Department Detection
        String category = "Other Civic Issue";
        String department = "General Civic Affairs";
        String reasoning = "Categorized based on municipal grievance guidelines.";

        if (lowerPrompt.contains("pothole") || lowerPrompt.contains("road") || lowerPrompt.contains("asphalt") ||
                lowerPrompt.contains("crater") || lowerPrompt.contains("pavement") || lowerPrompt.contains("sidewalk")) {
            category = "Pothole / Road Damage";
            department = "Roads & Infrastructure";
            reasoning = "Detected road surface degradation indicators.";
        } else if (lowerPrompt.contains("garbage") || lowerPrompt.contains("trash") || lowerPrompt.contains("waste") ||
                lowerPrompt.contains("dump") || lowerPrompt.contains("litter") || lowerPrompt.contains("dustbin") || lowerPrompt.contains("bin")) {
            category = "Uncollected Garbage / Dump";
            department = "Sanitation & Waste Management";
            reasoning = "Detected solid waste accumulation indicators.";
        } else if (lowerPrompt.contains("light") || lowerPrompt.contains("streetlight") || lowerPrompt.contains("lamp") ||
                lowerPrompt.contains("dark") || lowerPrompt.contains("blackout") || lowerPrompt.contains("transformer") || lowerPrompt.contains("pole")) {
            category = "Broken Streetlight / Blackout";
            department = "Electricity & Streetlights";
            reasoning = "Detected public lighting or electrical fixture disruption.";
        } else if (lowerPrompt.contains("leak") || lowerPrompt.contains("burst") || lowerPrompt.contains("pipe") ||
                lowerPrompt.contains("drinking water") || lowerPrompt.contains("tap water") || lowerPrompt.contains("water supply")) {
            category = "Water Leakage / Pipe Burst";
            department = "Water Supply & Pipelines";
            reasoning = "Detected municipal water distribution damage.";
        } else if (lowerPrompt.contains("drain") || lowerPrompt.contains("sewer") || lowerPrompt.contains("manhole") ||
                lowerPrompt.contains("gutter") || lowerPrompt.contains("clogged") || lowerPrompt.contains("sewage")) {
            category = "Drainage Overflow / Clogged Drain";
            department = "Drainage & Sewage";
            reasoning = "Detected stormwater or sewer system blockage.";
        } else if (lowerPrompt.contains("bench") || lowerPrompt.contains("park") || lowerPrompt.contains("sign") ||
                lowerPrompt.contains("bus stop") || lowerPrompt.contains("shelter") || lowerPrompt.contains("vandal")) {
            category = "Damaged Public Property";
            department = "Roads & Infrastructure";
            reasoning = "Detected damage to civic public structures.";
        }

        // 2. Priority Detection
        String priority = "MEDIUM";
        if (lowerPrompt.contains("spark") || lowerPrompt.contains("live wire") || lowerPrompt.contains("electrocution") ||
                lowerPrompt.contains("open manhole") || lowerPrompt.contains("flood") || lowerPrompt.contains("gas leak") ||
                lowerPrompt.contains("emergency") || lowerPrompt.contains("hazard") || lowerPrompt.contains("danger") ||
                lowerPrompt.contains("school") || lowerPrompt.contains("hospital")) {
            priority = "CRITICAL";
            reasoning += " Priority elevated to CRITICAL due to public safety or proximity risk.";
        } else if (lowerPrompt.contains("burst") || lowerPrompt.contains("overflow") || lowerPrompt.contains("urgent") ||
                lowerPrompt.contains("high speed") || lowerPrompt.contains("arterial") || lowerPrompt.contains("main road")) {
            priority = "HIGH";
            reasoning += " Priority assessed as HIGH due to elevated public disruption.";
        } else if (lowerPrompt.contains("minor") || lowerPrompt.contains("cosmetic") || lowerPrompt.contains("small")) {
            priority = "LOW";
        }

        // 3. Summary Generation
        String summary = prompt.replaceAll("\n", " ").trim();
        if (summary.length() > 140) {
            summary = summary.substring(0, 137) + "...";
        }

        // Return as JSON matching schema
        return String.format(
                """
                {
                  "category": "%s",
                  "priority": "%s",
                  "department": "%s",
                  "summary": "%s",
                  "confidence": 0.92,
                  "reasoning": "%s"
                }
                """,
                category, priority, department, summary.replace("\"", "\\\""), reasoning.replace("\"", "\\\"")
        );
    }
}
