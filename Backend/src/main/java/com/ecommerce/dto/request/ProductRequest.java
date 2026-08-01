package com.ecommerce.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProductRequest {

    private String nom;
    private String slug;
    private String sku;
    private String description;

    private Long categoryId;
    private String subCategory;
    private String collections;

    // Pricing
    private double salePrice;
    private double costPrice;
    private boolean promoActive;
    private double promoPrice;
    private LocalDate promoStart;
    private LocalDate promoEnd;

    // Stock
    private int stock;

    // Status
    private String statut = "actif";

    // Badges
    private boolean badgeNouveau;
    /** Duration in days for the Nouveauté badge: 7 or 14 */
    private Integer nouveauteDureeJours;
    private boolean badgeBestSeller;
    private boolean badgePromo;
    private boolean badgeExclusif;

    // Visibility
    private boolean visibleSite = true;
    private boolean visibleCategory = true;
    private boolean pinnedInSubCategory;

    // SEO
    private String metaTitle;

    // Shipping
    private double weight;
    private double dimensionLength;
    private double dimensionWidth;
    private double dimensionHeight;
    private boolean specificFees;

    // Variants config
    private String colors;
    private String sizes;

    // Performance
    private String performance;

    // Media
    private String imageUrl;

    /** JSON-serialized color images map */
    private String colorImages;

    // Upsell
    private String upsellTags;

    // Mix & Match
    private boolean mixMatchEnabled = true;
    private String mixMatchGender = "auto";
    private String mixMatchRole = "auto";
    private int mixMatchImageIndex = 2;

    // Variant rows
    private List<ProductVariantRequest> variants;

    @Data
    public static class ProductVariantRequest {
        private Long id;
        private String label;
        private String colorSwatch;
        private String sku;
        private double price;
        private int stock;
    }
}
