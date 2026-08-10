package com.ecommerce.controller;

import com.ecommerce.dto.response.UploadResponse;
import com.ecommerce.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/uploads")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
@RequiredArgsConstructor
public class AdminUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder) throws Exception {
        String url = fileStorageService.store(file, folder);
        String filename = url.substring(url.lastIndexOf('/') + 1);
        return ResponseEntity.ok(UploadResponse.builder()
                .url(url)
                .folder(folder)
                .filename(filename)
                .build());
    }
}
