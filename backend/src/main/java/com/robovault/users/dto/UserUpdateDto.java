package com.robovault.users.dto;

import com.robovault.users.model.UserRole;

public class UserUpdateDto {
    private String fullName;
    private String department;
    private String studentOrEmployeeId;
    private UserRole role;

    public UserUpdateDto() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStudentOrEmployeeId() {
        return studentOrEmployeeId;
    }

    public void setStudentOrEmployeeId(String studentOrEmployeeId) {
        this.studentOrEmployeeId = studentOrEmployeeId;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
