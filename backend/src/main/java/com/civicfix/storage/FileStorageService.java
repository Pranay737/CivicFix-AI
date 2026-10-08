package com.civicfix.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StoredFile uploadFile(MultipartFile file, String folder);
    void deleteFile(String publicId);
    void validateFile(MultipartFile file);
}
