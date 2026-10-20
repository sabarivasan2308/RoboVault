package com.robovault.assets.controller;

import com.robovault.assets.dto.AssetCreateDto;
import com.robovault.assets.dto.AssetUpdateDto;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.service.AssetService;
import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<Asset>>> getAssets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AssetCategory category,
            @RequestParam(required = false) AssetStatus status) {
        PaginatedResponse<Asset> response = assetService.getAssetsPaginated(page, size, query, category, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssetsList() {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAllAssets()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> getAssetById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAssetById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<Asset>> createAsset(
            @Valid @RequestBody AssetCreateDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Admin";
        Asset created = assetService.createAsset(dto, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Asset registered", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(
            @PathVariable String id,
            @Valid @RequestBody AssetUpdateDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Admin";
        return ResponseEntity.ok(ApiResponse.success("Asset updated", assetService.updateAsset(id, dto, actor)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Admin";
        assetService.deleteAsset(id, actor);
        return ResponseEntity.ok(ApiResponse.success("Asset removed", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Asset>>> searchAssets(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AssetCategory category,
            @RequestParam(required = false) AssetStatus status) {
        return ResponseEntity.ok(ApiResponse.success(assetService.searchAssets(query, category, status)));
    }
}

