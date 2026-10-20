package com.robovault.checkouts.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.checkouts.dto.CheckoutApprovalDto;
import com.robovault.checkouts.dto.CheckoutReturnDto;
import com.robovault.checkouts.dto.CheckoutSubmitDto;
import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import com.robovault.checkouts.repository.CheckoutRecordRepository;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.users.model.User;
import com.robovault.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CheckoutService {

    private final CheckoutRecordRepository checkoutRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public CheckoutService(CheckoutRecordRepository checkoutRepository,
                           AssetRepository assetRepository,
                           UserRepository userRepository,
                           ActivityLogService activityLogService) {
        this.checkoutRepository = checkoutRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    public List<CheckoutRecord> getAllCheckouts() {
        return checkoutRepository.findAll();
    }

    public PaginatedResponse<CheckoutRecord> getCheckoutsPaginated(int page, int size, CheckoutStatus status, String userEmail) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestDate").descending());
        Page<CheckoutRecord> pageResult;

        if (status != null) {
            pageResult = checkoutRepository.findByStatus(status, pageable);
        } else if (userEmail != null && !userEmail.isEmpty()) {
            pageResult = checkoutRepository.findByUserEmail(userEmail, pageable);
        } else {
            pageResult = checkoutRepository.findAll(pageable);
        }

        // Evaluate overdue dynamically
        LocalDate today = LocalDate.now();
        pageResult.getContent().forEach(rec -> {
            if (rec.getStatus() == CheckoutStatus.ISSUED && rec.getDueDate() != null) {
                try {
                    LocalDate due = LocalDate.parse(rec.getDueDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                    rec.setOverdue(due.isBefore(today));
                } catch (Exception ignored) {
                }
            }
        });

        return new PaginatedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public CheckoutRecord getCheckoutById(String id) {
        return checkoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout record not found with ID: " + id));
    }

    public synchronized CheckoutRecord requestCheckout(CheckoutSubmitDto dto, String userEmail) {
        Asset asset = assetRepository.findByAssetId(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + dto.getAssetId()));

        if (asset.getStatus() == AssetStatus.RETIRED || asset.getStatus() == AssetStatus.LOST) {
            throw new BadRequestException("Asset " + asset.getAssetId() + " is " + asset.getStatus() + " and cannot be borrowed");
        }
        if (asset.getStatus() == AssetStatus.MAINTENANCE || asset.getStatus() == AssetStatus.DAMAGED) {
            throw new BadRequestException("Asset " + asset.getAssetId() + " is under " + asset.getStatus() + " and unavailable");
        }
        if (asset.getAvailableQuantity() < dto.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + dto.getQuantity() + ") exceeds available stock (" + asset.getAvailableQuantity() + ")");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        CheckoutRecord record = new CheckoutRecord();
        record.setRequestId("REQ-" + System.currentTimeMillis() % 1000000);
        record.setUserId(user.getId());
        record.setUserEmail(user.getEmail());
        record.setUserName(user.getFullName());
        record.setAssetId(asset.getAssetId());
        record.setAssetName(asset.getName());
        record.setRequestedQuantity(dto.getQuantity());
        record.setProjectId(dto.getProjectId());
        record.setProjectName(dto.getProjectName());
        record.setIntendedIssueDate(dto.getIntendedIssueDate());
        record.setDueDate(dto.getDueDate());
        record.setNotes(dto.getNotes());
        record.setStatus(CheckoutStatus.PENDING);
        record.setRequestDate(LocalDateTime.now());
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());

        CheckoutRecord saved = checkoutRepository.save(record);
        activityLogService.log(userEmail, "CHECKOUT_REQUESTED", "CHECKOUT", saved.getRequestId(),
                user.getFullName() + " requested " + dto.getQuantity() + "x " + asset.getName() + " (" + asset.getAssetId() + ")");
        return saved;
    }

    public synchronized CheckoutRecord approveCheckout(String id, CheckoutApprovalDto dto, String approverEmail) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved/rejected. Current status: " + record.getStatus());
        }

        if (dto.isApproved()) {
            record.setStatus(CheckoutStatus.APPROVED);
            record.setApprover(approverEmail);
            record.setApprovalTimestamp(LocalDateTime.now());

            // Reserve the stock
            Asset asset = assetRepository.findByAssetId(record.getAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            if (asset.getAvailableQuantity() < record.getRequestedQuantity()) {
                throw new BadRequestException("Stock no longer available to approve this request");
            }
            asset.setAvailableQuantity(asset.getAvailableQuantity() - record.getRequestedQuantity());
            if (asset.getAvailableQuantity() == 0) {
                asset.setStatus(AssetStatus.RESERVED);
            }
            assetRepository.save(asset);

            activityLogService.log(approverEmail, "CHECKOUT_APPROVED", "CHECKOUT", record.getRequestId(),
                    "Approved checkout for " + record.getAssetName() + " to " + record.getUserName());
        } else {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
                throw new BadRequestException("A rejection reason is mandatory when declining checkout");
            }
            record.setStatus(CheckoutStatus.REJECTED);
            record.setApprover(approverEmail);
            record.setRejectionReason(dto.getRejectionReason().trim());
            record.setApprovalTimestamp(LocalDateTime.now());

            activityLogService.log(approverEmail, "CHECKOUT_REJECTED", "CHECKOUT", record.getRequestId(),
                    "Rejected checkout for " + record.getAssetName() + ". Reason: " + record.getRejectionReason());
        }

        record.setUpdatedAt(LocalDateTime.now());
        return checkoutRepository.save(record);
    }

    public synchronized CheckoutRecord issueEquipment(String id, String issuerEmail) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.APPROVED) {
            throw new BadRequestException("Cannot issue equipment without prior approval. Current status: " + record.getStatus());
        }

        record.setStatus(CheckoutStatus.ISSUED);
        record.setIssuer(issuerEmail);
        record.setIssueTimestamp(LocalDateTime.now());

        Asset asset = assetRepository.findByAssetId(record.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        asset.setStatus(AssetStatus.IN_USE);
        if (record.getProjectId() != null) {
            asset.setAllocatedProjectId(record.getProjectId());
            asset.setAllocatedProjectName(record.getProjectName());
        }
        assetRepository.save(asset);

        record.setUpdatedAt(LocalDateTime.now());
        CheckoutRecord saved = checkoutRepository.save(record);
        activityLogService.log(issuerEmail, "EQUIPMENT_ISSUED", "CHECKOUT", record.getRequestId(),
                "Issued " + record.getRequestedQuantity() + "x " + record.getAssetName() + " to " + record.getUserName());
        return saved;
    }

    public synchronized CheckoutRecord returnEquipment(String id, CheckoutReturnDto dto, String returnInspectorEmail) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.ISSUED) {
            throw new BadRequestException("Equipment must be in ISSUED state to process return. Current status: " + record.getStatus());
        }

        record.setStatus(CheckoutStatus.RETURNED);
        record.setActualReturnTimestamp(LocalDateTime.now());
        record.setReturnCondition(dto.getReturnCondition());
        if (dto.getRemarks() != null) {
            record.setNotes((record.getNotes() != null ? record.getNotes() + " | Return: " : "") + dto.getRemarks());
        }

        Asset asset = assetRepository.findByAssetId(record.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        if (dto.getReturnCondition() == PhysicalCondition.DAMAGED || dto.getReturnCondition() == PhysicalCondition.POOR) {
            asset.setStatus(AssetStatus.DAMAGED);
            asset.setCondition(dto.getReturnCondition());
            // Do not restore available quantity to safe pool until inspected/repaired
        } else {
            asset.setCondition(dto.getReturnCondition());
            asset.setAvailableQuantity(asset.getAvailableQuantity() + record.getRequestedQuantity());
            if (asset.getAvailableQuantity() > 0) {
                asset.setStatus(AssetStatus.AVAILABLE);
            }
        }
        asset.setAllocatedProjectId(null);
        asset.setAllocatedProjectName(null);
        assetRepository.save(asset);

        record.setUpdatedAt(LocalDateTime.now());
        CheckoutRecord saved = checkoutRepository.save(record);
        activityLogService.log(returnInspectorEmail, "EQUIPMENT_RETURNED", "CHECKOUT", record.getRequestId(),
                "Returned " + record.getAssetName() + " from " + record.getUserName() + ". Inspection Condition: " + dto.getReturnCondition());
        return saved;
    }

    public synchronized CheckoutRecord cancelCheckout(String id, String userEmail) {
        CheckoutRecord record = getCheckoutById(id);
        if (record.getStatus() != CheckoutStatus.PENDING && record.getStatus() != CheckoutStatus.APPROVED) {
            throw new BadRequestException("Cannot cancel checkout in status: " + record.getStatus());
        }

        // If it was already approved, release the reserved stock
        if (record.getStatus() == CheckoutStatus.APPROVED) {
            Asset asset = assetRepository.findByAssetId(record.getAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            asset.setAvailableQuantity(asset.getAvailableQuantity() + record.getRequestedQuantity());
            asset.setStatus(AssetStatus.AVAILABLE);
            assetRepository.save(asset);
        }

        record.setStatus(CheckoutStatus.CANCELLED);
        record.setUpdatedAt(LocalDateTime.now());
        CheckoutRecord saved = checkoutRepository.save(record);
        activityLogService.log(userEmail, "CHECKOUT_CANCELLED", "CHECKOUT", record.getRequestId(),
                "Cancelled checkout request for " + record.getAssetName());
        return saved;
    }
}
