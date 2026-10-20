package com.robovault.users.controller;

import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.users.dto.UserCreateDto;
import com.robovault.users.dto.UserDto;
import com.robovault.users.dto.UserUpdateDto;
import com.robovault.users.model.UserRole;
import com.robovault.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UserRole role) {
        PaginatedResponse<UserDto> response = userService.getUsersPaginated(page, size, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserCreateDto dto) {
        UserDto created = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(id, dto)));
    }

    @PATCH("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(ApiResponse.success("User status updated", userService.toggleUserStatus(id, active)));
    }
}

