package com.robovault.assets;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.dto.AssetCreateDto;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.assets.service.AssetService;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private AssetService assetService;

    private Asset sampleAsset;

    @BeforeEach
    void setUp() {
        sampleAsset = new Asset("RB-ESP32-014", "ESP32 Board", AssetCategory.DEVELOPMENT_BOARDS,
                "Espressif", "WROOM", "SN123", 10, "Rack B2", AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Test desc");
        sampleAsset.setId("mongo-id-1");
    }

    @Test
    void testCreateAsset_Success() {
        AssetCreateDto dto = new AssetCreateDto();
        dto.setAssetId("RB-ESP32-014");
        dto.setName("ESP32 Board");
        dto.setCategory(AssetCategory.DEVELOPMENT_BOARDS);
        dto.setQuantity(10);
        dto.setLocation("Rack B2");

        when(assetRepository.existsByAssetId("RB-ESP32-014")).thenReturn(false);
        when(assetRepository.save(any(Asset.class))).thenReturn(sampleAsset);

        Asset created = assetService.createAsset(dto, "admin@robovault.edu");

        assertNotNull(created);
        assertEquals("RB-ESP32-014", created.getAssetId());
        verify(assetRepository, times(1)).save(any(Asset.class));
        verify(activityLogService, times(1)).log(eq("admin@robovault.edu"), eq("ASSET_CREATED"), eq("ASSET"), anyString(), anyString());
    }

    @Test
    void testCreateAsset_DuplicateId_ThrowsException() {
        AssetCreateDto dto = new AssetCreateDto();
        dto.setAssetId("RB-ESP32-014");

        when(assetRepository.existsByAssetId("RB-ESP32-014")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> assetService.createAsset(dto, "admin@robovault.edu"));
        verify(assetRepository, never()).save(any(Asset.class));
    }

    @Test
    void testGetAssetById_NotFound_ThrowsException() {
        when(assetRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assetService.getAssetById("non-existent"));
    }
}
