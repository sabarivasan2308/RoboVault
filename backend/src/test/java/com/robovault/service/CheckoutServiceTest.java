package com.robovault.service;

import com.robovault.dto.CheckoutRequestDto;
import com.robovault.exception.BadRequestException;
import com.robovault.model.Asset;
import com.robovault.model.AssetCategory;
import com.robovault.model.AssetStatus;
import com.robovault.model.CheckoutRecord;
import com.robovault.model.CheckoutStatus;
import com.robovault.repository.AssetRepository;
import com.robovault.repository.CheckoutRecordRepository;
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
class CheckoutServiceTest {

    @Mock
    private CheckoutRecordRepository checkoutRecordRepository;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private CheckoutService checkoutService;

    private Asset availableAsset;
    private CheckoutRecord activeCheckout;

    @BeforeEach
    void setUp() {
        availableAsset = new Asset("RB-STM32-001", "STM32 Nucleo", AssetCategory.DEVELOPMENT_BOARDS,
                "ST", "F401", "SN999", 5, "Rack A1", AssetStatus.AVAILABLE, "GOOD", "Test");
        availableAsset.setId("mongo-asset-1");

        activeCheckout = new CheckoutRecord();
        activeCheckout.setId("chk-1");
        activeCheckout.setAssetId("RB-STM32-001");
        activeCheckout.setUserName("John Doe");
        activeCheckout.setStatus(CheckoutStatus.REQUESTED);
    }

    @Test
    void testRequestCheckout_AvailableAsset_Succeeds() {
        CheckoutRequestDto dto = new CheckoutRequestDto();
        dto.setAssetId("RB-STM32-001");
        dto.setUserName("John Doe");

        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));
        when(checkoutRecordRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));

        CheckoutRecord record = checkoutService.requestCheckout(dto);

        assertNotNull(record);
        assertEquals(CheckoutStatus.REQUESTED, record.getStatus());
        assertEquals(AssetStatus.RESERVED, availableAsset.getStatus());
        verify(assetRepository, times(1)).save(availableAsset);
    }

    @Test
    void testRequestCheckout_UnavailableAsset_ThrowsException() {
        availableAsset.setStatus(AssetStatus.IN_USE);
        CheckoutRequestDto dto = new CheckoutRequestDto();
        dto.setAssetId("RB-STM32-001");

        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));

        assertThrows(BadRequestException.class, () -> checkoutService.requestCheckout(dto));
        verify(checkoutRecordRepository, never()).save(any());
    }

    @Test
    void testIssueEquipment_Success() {
        activeCheckout.setStatus(CheckoutStatus.APPROVED);
        when(checkoutRecordRepository.findById("chk-1")).thenReturn(Optional.of(activeCheckout));
        when(checkoutRecordRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));
        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));

        CheckoutRecord issued = checkoutService.issueEquipment("chk-1", "Lab Assistant");

        assertEquals(CheckoutStatus.ISSUED, issued.getStatus());
        assertEquals(AssetStatus.IN_USE, availableAsset.getStatus());
        verify(assetRepository, times(1)).save(availableAsset);
    }

    @Test
    void testReturnEquipment_GoodCondition_RestoresAvailable() {
        activeCheckout.setStatus(CheckoutStatus.ISSUED);
        when(checkoutRecordRepository.findById("chk-1")).thenReturn(Optional.of(activeCheckout));
        when(checkoutRecordRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));
        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));

        CheckoutRecord returned = checkoutService.returnEquipment("chk-1", "GOOD", "All OK");

        assertEquals(CheckoutStatus.RETURNED, returned.getStatus());
        assertEquals(AssetStatus.AVAILABLE, availableAsset.getStatus());
        verify(assetRepository, times(1)).save(availableAsset);
    }

    @Test
    void testReturnEquipment_DamagedCondition_SetsDamaged() {
        activeCheckout.setStatus(CheckoutStatus.ISSUED);
        when(checkoutRecordRepository.findById("chk-1")).thenReturn(Optional.of(activeCheckout));
        when(checkoutRecordRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));
        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));

        CheckoutRecord returned = checkoutService.returnEquipment("chk-1", "DAMAGED", "Burnt pin");

        assertEquals(CheckoutStatus.RETURNED, returned.getStatus());
        assertEquals(AssetStatus.DAMAGED, availableAsset.getStatus());
        verify(assetRepository, times(1)).save(availableAsset);
    }
}
