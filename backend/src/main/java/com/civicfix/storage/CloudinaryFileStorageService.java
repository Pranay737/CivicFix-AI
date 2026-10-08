package com.civicfix.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.civicfix.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service("cloudinaryFileStorageService")
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;
    private final LocalDiskFileStorageService localFallback;
    private final boolean configured;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    public CloudinaryFileStorageService(
            @Value("${app.storage.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.storage.cloudinary.api-key:}") String apiKey,
            @Value("${app.storage.cloudinary.api-secret:}") String apiSecret,
            LocalDiskFileStorageService localFallback) {
        this.localFallback = localFallback;
        if (cloudName != null && !cloudName.isBlank() &&
            apiKey != null && !apiKey.isBlank() &&
            apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            this.configured = true;
            log.info("Cloudinary storage initialized for cloud: {}", cloudName);
        } else {
            this.cloudinary = null;
            this.configured = false;
            log.info("Cloudinary credentials not provided. Using local disk fallback storage.");
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
    @SuppressWarnings("unchecked")
    public StoredFile uploadFile(MultipartFile file, String folder) {
        validateFile(file);

        if (!configured || cloudinary == null) {
            log.debug("Falling back to local file storage as Cloudinary is not configured.");
            return localFallback.uploadFile(file, folder);
        }

        try {
            String folderName = "civicfix/" + (folder != null ? folder : "misc");
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folderName,
                            "resource_type", "image"
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            log.info("Successfully uploaded image to Cloudinary: publicId={}", publicId);

            return StoredFile.builder()
                    .fileUrl(secureUrl)
                    .publicId(publicId)
                    .originalFileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .build();
        } catch (Exception e) {
            log.error("Cloudinary upload failed, falling back to local storage: {}", e.getMessage());
            return localFallback.uploadFile(file, folder);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        if (configured && cloudinary != null && publicId != null) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Deleted image from Cloudinary: {}", publicId);
            } catch (IOException e) {
                log.warn("Could not delete image from Cloudinary: {}", e.getMessage());
            }
        } else {
            localFallback.deleteFile(publicId);
        }
    }
}
