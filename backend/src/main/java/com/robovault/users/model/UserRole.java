package com.robovault.users.model;

public enum UserRole {
    ADMIN,
    LAB_ASSISTANT,
    FACULTY,
    STUDENT;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}

