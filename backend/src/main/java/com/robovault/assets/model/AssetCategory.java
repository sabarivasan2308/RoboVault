package com.robovault.assets.model;

public enum AssetCategory {
    ROBOTS("Robots"),
    MICROCONTROLLERS("Microcontrollers"),
    DEVELOPMENT_BOARDS("Development Boards"),
    SENSORS("Sensors"),
    MOTORS("Motors"),
    MOTOR_DRIVERS("Motor Drivers"),
    COMMUNICATION_MODULES("Communication Modules"),
    POWER_SUPPLIES("Power Supplies"),
    ELECTRONIC_COMPONENTS("Electronic Components"),
    TOOLS("Tools"),
    TEST_EQUIPMENT("Test Equipment"),
    THREE_D_PRINTERS("3D Printers");

    private final String displayName;

    AssetCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

