package com.robovault.checkouts.controller;

import com.robovault.checkouts.dto.CheckoutApprovalDto;
import com.robovault.checkouts.dto.CheckoutReturnDto;
import com.robovault.checkouts.dto.CheckoutSubmitDto;
import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import com.robovault.checkouts.service.CheckoutService;
import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkouts")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<CheckoutRecord>>> getCheckouts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) CheckoutStatus status,
            @RequestParam(required = false) String userEmail) {
        return ResponseEntity.ok(ApiResponse.success(checkoutService.getCheckoutsPaginated(page, size, status, userEmail)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CheckoutRecord>> getCheckoutById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(checkoutService.getCheckoutById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutRecord>> requestCheckout(
            @Valid @RequestBody CheckoutSubmitDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "student@robovault.edu";
        CheckoutRecord record = checkoutService.requestCheckout(dto, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Checkout requested", record));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT', 'FACULTY')")
    public ResponseEntity<ApiResponse<CheckoutRecord>> approveCheckout(
            @PathVariable String id,
            @RequestBody CheckoutApprovalDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        dto.setApproved(true);
        return ResponseEntity.ok(ApiResponse.success("Checkout approved", checkoutService.approveCheckout(id, dto, actor)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT', 'FACULTY')")
    public ResponseEntity<ApiResponse<CheckoutRecord>> rejectCheckout(
            @PathVariable String id,
            @RequestBody CheckoutApprovalDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        dto.setApproved(false);
        return ResponseEntity.ok(ApiResponse.success("Checkout rejected", checkoutService.approveCheckout(id, dto, actor)));
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<CheckoutRecord>> issueEquipment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Assistant";
        return ResponseEntity.ok(ApiResponse.success("Equipment issued", checkoutService.issueEquipment(id, actor)));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<CheckoutRecord>> returnEquipment(
            @PathVariable String id,
            @Valid @RequestBody CheckoutReturnDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Assistant";
        return ResponseEntity.ok(ApiResponse.success("Return processed and inspected", checkoutService.returnEquipment(id, dto, actor)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<CheckoutRecord>> cancelCheckout(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Student";
        return ResponseEntity.ok(ApiResponse.success("Checkout cancelled", checkoutService.cancelCheckout(id, actor)));
    }
}
