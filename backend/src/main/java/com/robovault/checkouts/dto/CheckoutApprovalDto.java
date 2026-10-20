package com.robovault.checkouts.dto;

import com.robovault.assets.model.PhysicalCondition;

public class CheckoutApprovalDto {
    private boolean approved;
    private String rejectionReason;

    public CheckoutApprovalDto() {
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
