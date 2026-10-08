package com.civicfix.controller;

import com.civicfix.storage.FileStorageService;
import com.civicfix.storage.StoredFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Tag(name = "File Uploads", description = "Endpoints for uploading complaint and resolution evidence images")
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload single image (JPEG, PNG, WEBP, max 5 MB)")
    public ResponseEntity<StoredFile> uploadSingle(@RequestParam("file") MultipartFile file,
                                                  @RequestParam(value = "folder", defaultValue = "complaints") String folder) {
        StoredFile storedFile = fileStorageService.uploadFile(file, folder);
        return ResponseEntity.status(HttpStatus.CREATED).body(storedFile);
    }

    @PostMapping("/batch")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload multiple images (max 5 files)")
    public ResponseEntity<List<StoredFile>> uploadBatch(@RequestParam("files") List<MultipartFile> files,
                                                       @RequestParam(value = "folder", defaultValue = "complaints") String folder) {
        if (files.size() > 5) {
            throw new IllegalArgumentException("Maximum of 5 images can be uploaded simultaneously");
        }
        List<StoredFile> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(fileStorageService.uploadFile(file, folder));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(results);
    }
}
