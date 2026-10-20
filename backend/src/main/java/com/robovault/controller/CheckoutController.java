package com.robovault.controller;

import com.robovault.dto.CheckoutRequestDto;
import com.robovault.model.CheckoutRecord;
import com.robovault.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkouts")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping
    public ResponseEntity<List<CheckoutRecord>> getAllCheckouts() {
        return ResponseEntity.ok(checkoutService.getAllCheckouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckoutRecord> getCheckoutById(@PathVariable String id) {
        return ResponseEntity.ok(checkoutService.getCheckoutById(id));
    }

    @PostMapping
    public ResponseEntity<CheckoutRecord> requestCheckout(@Valid @RequestBody CheckoutRequestDto dto) {
        CheckoutRecord record = checkoutService.requestCheckout(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<CheckoutRecord> approveCheckout(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String approvedBy = body != null ? body.get("approvedBy") : null;
        return ResponseEntity.ok(checkoutService.approveCheckout(id, approvedBy));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CheckoutRecord> rejectCheckout(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : "Rejected by Administrator";
        return ResponseEntity.ok(checkoutService.rejectCheckout(id, remarks));
    }

    @PutMapping("/{id}/issue")
    public ResponseEntity<CheckoutRecord> issueEquipment(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String issuedBy = body != null ? body.get("issuedBy") : null;
        return ResponseEntity.ok(checkoutService.issueEquipment(id, issuedBy));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<CheckoutRecord> returnEquipment(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String condition = body != null ? body.get("returnCondition") : "GOOD";
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(checkoutService.returnEquipment(id, condition, remarks));
    }
}

