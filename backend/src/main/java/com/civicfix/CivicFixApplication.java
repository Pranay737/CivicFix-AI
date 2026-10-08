package com.civicfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class CivicFixApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(CivicFixApplication.class, args);
    }

    private static void loadDotEnv() {
        File[] candidateFiles = new File[] {
                new File(".env"),
                new File("../.env"),
                new File("../../.env"),
                new File("C:/Users/harik/.gemini/antigravity/scratch/civicfix-ai/.env")
        };

        for (File envFile : candidateFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    System.out.println("Loaded environment configurations from: " + envFile.getAbsolutePath());
                    break;
                } catch (IOException e) {
                    System.err.println("Could not read .env file: " + e.getMessage());
                }
            }
        }
    }
}
