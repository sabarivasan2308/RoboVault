package com.robovault.checkouts.model;

import com.robovault.assets.model.PhysicalCondition;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "checkout_records")
public class CheckoutRecord {

    @Id
    private String id;

    @Indexed
    private String requestId; // e.g. "REQ-2026-001"

    @Indexed
    private String userId;

    private String userName;

    @Indexed
    private String userEmail;

    @Indexed
    private String assetId; // e.g. "RB-ESP32-014"

    private String assetName;
    private int requestedQuantity = 1;

    private String projectId;
    private String projectName;

    private LocalDateTime requestDate;
    private String intendedIssueDate;
    private String dueDate;

    @Indexed
    private CheckoutStatus status = CheckoutStatus.PENDING;

    private String approver;
    private LocalDateTime approvalTimestamp;

    private String issuer;
    private LocalDateTime issueTimestamp;

    private LocalDateTime actualReturnTimestamp;

    private PhysicalCondition issueCondition = PhysicalCondition.GOOD;
    private PhysicalCondition returnCondition;

    private String notes;
    private String rejectionReason;

    private boolean overdue = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public CheckoutRecord() {
        this.requestDate = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public int getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(int requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public String getIntendedIssueDate() {
        return intendedIssueDate;
    }

    public void setIntendedIssueDate(String intendedIssueDate) {
        this.intendedIssueDate = intendedIssueDate;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public CheckoutStatus getStatus() {
        return status;
    }

    public void setStatus(CheckoutStatus status) {
        this.status = status;
    }

    public String getApprover() {
        return approver;
    }

    public void setApprover(String approver) {
        this.approver = approver;
    }

    public LocalDateTime getApprovalTimestamp() {
        return approvalTimestamp;
    }

    public void setApprovalTimestamp(LocalDateTime approvalTimestamp) {
        this.approvalTimestamp = approvalTimestamp;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public LocalDateTime getIssueTimestamp() {
        return issueTimestamp;
    }

    public void setIssueTimestamp(LocalDateTime issueTimestamp) {
        this.issueTimestamp = issueTimestamp;
    }

    public LocalDateTime getActualReturnTimestamp() {
        return actualReturnTimestamp;
    }

    public void setActualReturnTimestamp(LocalDateTime actualReturnTimestamp) {
        this.actualReturnTimestamp = actualReturnTimestamp;
    }

    public PhysicalCondition getIssueCondition() {
        return issueCondition;
    }

    public void setIssueCondition(PhysicalCondition issueCondition) {
        this.issueCondition = issueCondition;
    }

    public PhysicalCondition getReturnCondition() {
        return returnCondition;
    }

    public void setReturnCondition(PhysicalCondition returnCondition) {
        this.returnCondition = returnCondition;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
