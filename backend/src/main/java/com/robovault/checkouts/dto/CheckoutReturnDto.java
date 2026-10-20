package com.robovault.checkouts.dto;

import com.robovault.assets.model.PhysicalCondition;
import jakarta.validation.constraints.NotNull;

public class CheckoutReturnDto {

    @NotNull(message = "Return condition is required")
    private PhysicalCondition returnCondition = PhysicalCondition.GOOD;

    private String remarks;

    public CheckoutReturnDto() {
    }

    public PhysicalCondition getReturnCondition() {
        return returnCondition;
    }

    public void setReturnCondition(PhysicalCondition returnCondition) {
        this.returnCondition = returnCondition;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
