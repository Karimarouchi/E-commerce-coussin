package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String slug;

    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ── Category ──────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "sub_category")
    private String subCategory;

    /** Comma-separated collection names */
    @Column(columnDefinition = "TEXT")
    private String collections;

    // ── Pricing ───────────────────────────────────────────────────
    @Builder.Default
    private double salePrice = 0;

    @Builder.Default
    private double costPrice = 0;

    @Builder.Default
    private boolean promoActive = false;

    @Builder.Default
    private double promoPrice = 0;

    private LocalDate promoStart;
    private LocalDate promoEnd;

    // ── Stock ─────────────────────────────────────────────────────
    @Builder.Default
    private int stock = 0;

    // ── Status: actif | archive | desactive | draft ───────────────
    @Column(nullable = false)
    @Builder.Default
    private String statut = "actif";

    // ── Marketing Badges ──────────────────────────────────────────
    @Builder.Default
    private boolean badgeNouveau = false;

    /** When badgeNouveau was last activated */
    private java.time.LocalDateTime nouveauteSince;

    /** Duration in days chosen by admin: 7 or 14 (null = no auto-expiry) */
    private Integer nouveauteDureeJours;

    @Builder.Default
    private boolean badgeBestSeller = false;

    @Builder.Default
    private boolean badgePromo = false;

    @Builder.Default
    private boolean badgeExclusif = false;

    // ── Visibility ────────────────────────────────────────────────
    @Builder.Default
    private boolean visibleSite = true;

    @Builder.Default
    private boolean visibleCategory = true;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean pinnedInSubCategory = false;

    // ── SEO ───────────────────────────────────────────────────────
    @Column(name = "meta_title")
    private String metaTitle;

    // ── Shipping & Dimensions ─────────────────────────────────────
    @Builder.Default
    private double weight = 0;

    @Builder.Default
    private double dimensionLength = 0;

    @Builder.Default
    private double dimensionWidth = 0;

    @Builder.Default
    private double dimensionHeight = 0;

    @Builder.Default
    private boolean specificFees = false;

    // ── Variants config (raw text, detailed variants in ProductVariant) ──
    /** Comma-separated colour names */
    @Column(columnDefinition = "TEXT")
    private String colors;

    /** Comma-separated size names */
    @Column(columnDefinition = "TEXT")
    private String sizes;

    // ── Performance label ─────────────────────────────────────────
    private String performance;

    // ── Media ─────────────────────────────────────────────────────
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    /** JSON map: { "Noir": ["dataUrl1","dataUrl2",null], "Rouge": [...] } */
    @Column(name = "color_images", columnDefinition = "TEXT")
    private String colorImages;

    // ── Upsell / Cross-sell (comma-separated product names) ───────
    @Column(name = "upsell_tags", columnDefinition = "TEXT")
    private String upsellTags;

    // ── Mix & Match ───────────────────────────────────────────────
    @Builder.Default
    @Column(name = "mix_match_enabled", nullable = false)
    private boolean mixMatchEnabled = true;

    @Builder.Default
    @Column(name = "mix_match_gender")
    private String mixMatchGender = "auto";

    @Builder.Default
    @Column(name = "mix_match_role")
    private String mixMatchRole = "auto";

    @Builder.Default
    @Column(name = "mix_match_image_index", nullable = false)
    private int mixMatchImageIndex = 2;

    // ── Variants ──────────────────────────────────────────────────
    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    // ── Audit ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
