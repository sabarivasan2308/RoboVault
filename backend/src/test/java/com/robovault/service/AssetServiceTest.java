package com.robovault.service;

import com.robovault.exception.BadRequestException;
import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.Asset;
import com.robovault.model.AssetCategory;
import com.robovault.model.AssetStatus;
import com.robovault.repository.AssetRepository;
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
                "Espressif", "WROOM", "SN123", 10, "Rack B2", AssetStatus.AVAILABLE, "GOOD", "Test desc");
        sampleAsset.setId("mongo-id-1");
    }

    @Test
    void testCreateAsset_Success() {
        when(assetRepository.findByAssetId("RB-ESP32-014")).thenReturn(Optional.empty());
        when(assetRepository.save(any(Asset.class))).thenReturn(sampleAsset);

        Asset created = assetService.createAsset(sampleAsset);

        assertNotNull(created);
        assertEquals("RB-ESP32-014", created.getAssetId());
        verify(assetRepository, times(1)).save(sampleAsset);
        verify(activityLogService, times(1)).log(eq("ASSET_CREATED"), eq("ASSET"), anyString(), anyString(), anyString());
    }

    @Test
    void testCreateAsset_DuplicateId_ThrowsException() {
        when(assetRepository.findByAssetId("RB-ESP32-014")).thenReturn(Optional.of(sampleAsset));

        assertThrows(BadRequestException.class, () -> assetService.createAsset(sampleAsset));
        verify(assetRepository, never()).save(any(Asset.class));
    }

    @Test
    void testGetAssetById_NotFound_ThrowsException() {
        when(assetRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assetService.getAssetById("non-existent"));
    }

    @Test
    void testUpdateStatus_Success() {
        when(assetRepository.findByAssetId("RB-ESP32-014")).thenReturn(Optional.of(sampleAsset));
        when(assetRepository.save(any(Asset.class))).thenReturn(sampleAsset);

        Asset updated = assetService.updateStatus("RB-ESP32-014", AssetStatus.IN_USE);

        assertEquals(AssetStatus.IN_USE, updated.getStatus());
        verify(assetRepository, times(1)).save(sampleAsset);
    }
}
