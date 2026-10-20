package com.robovault.service;

import com.robovault.dto.CheckoutRequestDto;
import com.robovault.exception.BadRequestException;
import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.Asset;
import com.robovault.model.AssetStatus;
import com.robovault.model.CheckoutRecord;
import com.robovault.model.CheckoutStatus;
import com.robovault.repository.AssetRepository;
import com.robovault.repository.CheckoutRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CheckoutService {

    private final CheckoutRecordRepository checkoutRecordRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public CheckoutService(CheckoutRecordRepository checkoutRecordRepository,
                           AssetRepository assetRepository,
                           ActivityLogService activityLogService) {
        this.checkoutRecordRepository = checkoutRecordRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    public List<CheckoutRecord> getAllCheckouts() {
        return checkoutRecordRepository.findAll();
    }

    public CheckoutRecord getCheckoutById(String id) {
        return checkoutRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout record not found with ID: " + id));
    }

    public CheckoutRecord requestCheckout(CheckoutRequestDto dto) {
        Asset asset = assetRepository.findByAssetId(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + dto.getAssetId()));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new BadRequestException("Asset " + asset.getAssetId() + " is currently " + asset.getStatus() + " and cannot be checked out");
        }

        CheckoutRecord record = new CheckoutRecord();
        record.setAssetId(asset.getAssetId());
        record.setAssetMongoId(asset.getId());
        record.setAssetName(asset.getName());
        record.setUserId(dto.getUserId());
        record.setUserName(dto.getUserName());
        record.setUserEmail(dto.getUserEmail());
        record.setProjectId(dto.getProjectId());
        record.setProjectName(dto.getProjectName());
        record.setPurpose(dto.getPurpose());
        record.setExpectedReturnDate(dto.getExpectedReturnDate());
        record.setStatus(CheckoutStatus.REQUESTED);
        record.setRequestedAt(LocalDateTime.now());

        // Reserve the asset temporarily
        asset.setStatus(AssetStatus.RESERVED);
        assetRepository.save(asset);

        CheckoutRecord saved = checkoutRecordRepository.save(record);
        activityLogService.log("CHECKOUT_REQUESTED", "CHECKOUT", saved.getId(),
                dto.getUserName() + " requested checkout of " + asset.getName() + " (" + asset.getAssetId() + ")",
                dto.getUserName());
        return saved;
    }

    public CheckoutRecord approveCheckout(String id, String approvedBy) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.REQUESTED) {
            throw new BadRequestException("Cannot approve checkout in status: " + record.getStatus());
        }

        record.setStatus(CheckoutStatus.APPROVED);
        record.setApprovedAt(LocalDateTime.now());
        record.setApprovedBy(approvedBy != null ? approvedBy : "Lab Administrator");

        CheckoutRecord saved = checkoutRecordRepository.save(record);
        activityLogService.log("CHECKOUT_APPROVED", "CHECKOUT", saved.getId(),
                "Checkout approved for " + record.getAssetName() + " by " + record.getApprovedBy(),
                record.getApprovedBy());
        return saved;
    }

    public CheckoutRecord rejectCheckout(String id, String remarks) {
        CheckoutRecord record = getCheckoutById(id);
        record.setStatus(CheckoutStatus.REJECTED);
        record.setRemarks(remarks);

        // Reset asset status back to AVAILABLE
        assetRepository.findByAssetId(record.getAssetId()).ifPresent(asset -> {
            if (asset.getStatus() == AssetStatus.RESERVED) {
                asset.setStatus(AssetStatus.AVAILABLE);
                assetRepository.save(asset);
            }
        });

        CheckoutRecord saved = checkoutRecordRepository.save(record);
        activityLogService.log("CHECKOUT_REJECTED", "CHECKOUT", saved.getId(),
                "Checkout rejected for " + record.getAssetName() + ". Reason: " + remarks, "Lab Administrator");
        return saved;
    }

    public CheckoutRecord issueEquipment(String id, String issuedBy) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.APPROVED && record.getStatus() != CheckoutStatus.REQUESTED) {
            throw new BadRequestException("Checkout record must be approved before issuing");
        }

        record.setStatus(CheckoutStatus.ISSUED);
        record.setIssuedAt(LocalDateTime.now());
        record.setIssuedBy(issuedBy != null ? issuedBy : "Lab Assistant");

        // Mark asset as IN_USE
        assetRepository.findByAssetId(record.getAssetId()).ifPresent(asset -> {
            asset.setStatus(AssetStatus.IN_USE);
            if (record.getProjectId() != null) {
                asset.setAllocatedProjectId(record.getProjectId());
                asset.setAllocatedProjectName(record.getProjectName());
            }
            assetRepository.save(asset);
        });

        CheckoutRecord saved = checkoutRecordRepository.save(record);
        activityLogService.log("EQUIPMENT_ISSUED", "CHECKOUT", saved.getId(),
                "Asset " + record.getAssetName() + " issued to " + record.getUserName(),
                record.getIssuedBy());
        return saved;
    }

    public CheckoutRecord returnEquipment(String id, String returnCondition, String remarks) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.ISSUED) {
            throw new BadRequestException("Asset must be in ISSUED state to return");
        }

        record.setStatus(CheckoutStatus.RETURNED);
        record.setActualReturnDate(LocalDateTime.now());
        record.setReturnCondition(returnCondition != null ? returnCondition : "GOOD");
        if (remarks != null) {
            record.setRemarks(remarks);
        }

        // Return asset back to AVAILABLE or DAMAGED based on condition check
        assetRepository.findByAssetId(record.getAssetId()).ifPresent(asset -> {
            if ("DAMAGED".equalsIgnoreCase(returnCondition)) {
                asset.setStatus(AssetStatus.DAMAGED);
                asset.setCondition("DAMAGED");
            } else {
                asset.setStatus(AssetStatus.AVAILABLE);
                asset.setCondition(returnCondition != null ? returnCondition : "GOOD");
            }
            asset.setAllocatedProjectId(null);
            asset.setAllocatedProjectName(null);
            assetRepository.save(asset);
        });

        CheckoutRecord saved = checkoutRecordRepository.save(record);
        activityLogService.log("EQUIPMENT_RETURNED", "CHECKOUT", saved.getId(),
                "Asset " + record.getAssetName() + " returned. Condition: " + record.getReturnCondition(),
                record.getUserName());
        return saved;
    }
}

