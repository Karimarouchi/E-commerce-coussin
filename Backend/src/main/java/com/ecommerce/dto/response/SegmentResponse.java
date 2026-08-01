package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SegmentResponse {
    private Long id;
    private String name;
    private String label;
    private String color;
    private String description;
    private String icon;
    private long userCount;
}
