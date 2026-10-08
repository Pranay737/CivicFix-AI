package com.civicfix.storage;

import com.civicfix.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service("localFileStorageService")
public class LocalDiskFileStorageService implements FileStorageService {

    private final Path rootLocation;
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    public LocalDiskFileStorageService(@Value("${app.storage.local-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Initialized local file storage at: {}", this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize local storage folder", e);
        }
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Only JPG, PNG, and WEBP images are allowed.");
        }
    }

    @Override
    public StoredFile uploadFile(MultipartFile file, String folder) {
        validateFile(file);

        try {
            Path targetFolder = this.rootLocation.resolve(folder != null ? folder : "misc").normalize();
            Files.createDirectories(targetFolder);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String publicId = UUID.randomUUID().toString();
            String fileName = publicId + extension;
            Path destinationFile = targetFolder.resolve(fileName).normalize();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUrl = "/uploads/" + (folder != null ? folder + "/" : "") + fileName;
            log.info("Saved file locally to: {} (URL: {})", destinationFile, fileUrl);

            return StoredFile.builder()
                    .fileUrl(fileUrl)
                    .publicId(publicId)
                    .originalFileName(originalFilename)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .build();
        } catch (IOException e) {
            log.error("Failed to store file locally", e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        log.info("Local delete requested for publicId: {}", publicId);
        // Best effort local cleanup if needed
    }
}
