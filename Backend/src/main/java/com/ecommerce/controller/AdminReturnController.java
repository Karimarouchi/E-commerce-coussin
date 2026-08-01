package com.ecommerce.controller;

import com.ecommerce.dto.response.ReturnResponse;
import com.ecommerce.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/returns")
@RequiredArgsConstructor
public class AdminReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<List<ReturnResponse>> getAll() {
        return ResponseEntity.ok(returnService.getAllReturns());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReturnResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(returnService.updateStatus(id, body.get("status")));
    }
}
