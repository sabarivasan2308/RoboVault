package com.robovault.checkouts;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.checkouts.dto.CheckoutApprovalDto;
import com.robovault.checkouts.dto.CheckoutReturnDto;
import com.robovault.checkouts.dto.CheckoutSubmitDto;
import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import com.robovault.checkouts.repository.CheckoutRecordRepository;
import com.robovault.checkouts.service.CheckoutService;
import com.robovault.common.exception.BadRequestException;
import com.robovault.users.model.User;
import com.robovault.users.model.UserRole;
import com.robovault.users.repository.UserRepository;
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
    private CheckoutRecordRepository checkoutRepository;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private CheckoutService checkoutService;

    private Asset availableAsset;
    private CheckoutRecord activeCheckout;
    private User testStudent;

    @BeforeEach
    void setUp() {
        availableAsset = new Asset("RB-STM32-001", "STM32 Nucleo", AssetCategory.DEVELOPMENT_BOARDS,
                "ST", "F401", "SN999", 5, "Rack A1", AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Test");
        availableAsset.setAvailableQuantity(5);
        availableAsset.setId("mongo-asset-1");

        testStudent = new User("student@robovault.edu", "hash", "John Doe", "Robotics", "STU-01", UserRole.STUDENT);
        testStudent.setId("user-1");

        activeCheckout = new CheckoutRecord();
        activeCheckout.setId("chk-1");
        activeCheckout.setRequestId("REQ-001");
        activeCheckout.setAssetId("RB-STM32-001");
        activeCheckout.setUserName("John Doe");
        activeCheckout.setRequestedQuantity(2);
        activeCheckout.setStatus(CheckoutStatus.PENDING);
    }

    @Test
    void testRequestCheckout_AvailableStock_Succeeds() {
        CheckoutSubmitDto dto = new CheckoutSubmitDto();
        dto.setAssetId("RB-STM32-001");
        dto.setQuantity(2);
        dto.setDueDate("2026-11-20");

        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));
        when(userRepository.findByEmail("student@robovault.edu")).thenReturn(Optional.of(testStudent));
        when(checkoutRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));

        CheckoutRecord record = checkoutService.requestCheckout(dto, "student@robovault.edu");

        assertNotNull(record);
        assertEquals(CheckoutStatus.PENDING, record.getStatus());
        assertEquals(2, record.getRequestedQuantity());
    }

    @Test
    void testRequestCheckout_ExceedsAvailableStock_ThrowsException() {
        CheckoutSubmitDto dto = new CheckoutSubmitDto();
        dto.setAssetId("RB-STM32-001");
        dto.setQuantity(10); // available is 5

        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));

        assertThrows(BadRequestException.class, () -> checkoutService.requestCheckout(dto, "student@robovault.edu"));
        verify(checkoutRepository, never()).save(any());
    }

    @Test
    void testApproveCheckout_ReservesStock() {
        CheckoutApprovalDto dto = new CheckoutApprovalDto();
        dto.setApproved(true);

        when(checkoutRepository.findById("chk-1")).thenReturn(Optional.of(activeCheckout));
        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));
        when(checkoutRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));

        CheckoutRecord approved = checkoutService.approveCheckout("chk-1", dto, "admin@robovault.edu");

        assertEquals(CheckoutStatus.APPROVED, approved.getStatus());
        assertEquals(3, availableAsset.getAvailableQuantity()); // 5 - 2 = 3
        verify(assetRepository, times(1)).save(availableAsset);
    }

    @Test
    void testReturnEquipment_Damaged_SetsAssetDamaged() {
        activeCheckout.setStatus(CheckoutStatus.ISSUED);
        CheckoutReturnDto returnDto = new CheckoutReturnDto();
        returnDto.setReturnCondition(PhysicalCondition.DAMAGED);
        returnDto.setRemarks("Pin header cracked");

        when(checkoutRepository.findById("chk-1")).thenReturn(Optional.of(activeCheckout));
        when(assetRepository.findByAssetId("RB-STM32-001")).thenReturn(Optional.of(availableAsset));
        when(checkoutRepository.save(any(CheckoutRecord.class))).thenAnswer(i -> i.getArgument(0));

        CheckoutRecord returned = checkoutService.returnEquipment("chk-1", returnDto, "assistant@robovault.edu");

        assertEquals(CheckoutStatus.RETURNED, returned.getStatus());
        assertEquals(AssetStatus.DAMAGED, availableAsset.getStatus());
        verify(assetRepository, times(1)).save(availableAsset);
    }
}
