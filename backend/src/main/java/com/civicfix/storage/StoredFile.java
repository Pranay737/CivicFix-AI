package com.civicfix.storage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredFile {
    private String fileUrl;
    private String publicId;
    private String originalFileName;
    private String contentType;
    private long size;
}
