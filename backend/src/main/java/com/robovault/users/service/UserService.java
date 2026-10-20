package com.robovault.users.service;

import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.users.dto.UserCreateDto;
import com.robovault.users.dto.UserDto;
import com.robovault.users.dto.UserUpdateDto;
import com.robovault.users.model.User;
import com.robovault.users.model.UserRole;
import com.robovault.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PaginatedResponse<UserDto> getUsersPaginated(int page, int size, UserRole role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        Page<User> usersPage = (role != null) 
                ? userRepository.findByRole(role, pageable)
                : userRepository.findAll(pageable);

        List<UserDto> dtoList = usersPage.getContent().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isLast()
        );
    }

    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserDto.fromEntity(user);
    }

    public UserDto createUser(UserCreateDto dto) {
        String cleanEmail = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("User with email '" + cleanEmail + "' already exists");
        }

        User user = new User();
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName().trim());
        user.setDepartment(dto.getDepartment());
        user.setStudentOrEmployeeId(dto.getStudentOrEmployeeId());
        user.setRole(dto.getRole() != null ? dto.getRole() : UserRole.STUDENT);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    public UserDto updateUser(String id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName().trim());
        if (dto.getDepartment() != null) user.setDepartment(dto.getDepartment());
        if (dto.getStudentOrEmployeeId() != null) user.setStudentOrEmployeeId(dto.getStudentOrEmployeeId());
        
        // Prevent removing the last active ADMIN
        if (dto.getRole() != null && dto.getRole() != user.getRole()) {
            if (user.getRole() == UserRole.ADMIN && userRepository.countByRoleAndActiveTrue(UserRole.ADMIN) <= 1) {
                throw new BadRequestException("Cannot change role: At least one active ADMIN must remain in the system");
            }
            user.setRole(dto.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return UserDto.fromEntity(userRepository.save(user));
    }

    public UserDto toggleUserStatus(String id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        // Prevent deactivating the last active ADMIN
        if (!active && user.getRole() == UserRole.ADMIN && userRepository.countByRoleAndActiveTrue(UserRole.ADMIN) <= 1) {
            throw new BadRequestException("Cannot deactivate the only active Administrator account");
        }

        user.setActive(active);
        user.setUpdatedAt(LocalDateTime.now());
        return UserDto.fromEntity(userRepository.save(user));
    }
}
