package com.ecommerce.controller;

import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    /**
     * Validate a coupon code (frontoffice checkout).
     * Optionally pass userId to check per-user limits.
     */
    @GetMapping("/validate")
    public ResponseEntity<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(couponService.validateCoupon(code, userId));
    }

    /**
     * Returns the currently active auto-trigger coupon for a given trigger name.
     * Used by the frontoffice to auto-apply hesitation/anniversary/first-order
     * coupons.
     */
    @GetMapping("/auto-trigger")
    public ResponseEntity<CouponResponse> getAutoTriggerCoupon(@RequestParam String trigger) {
        return couponService.getActiveAutoTriggerCoupon(trigger)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
