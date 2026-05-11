package com.ssunen.backend.model;

public class Customer {
    private Integer id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String username;
    private String role;

    // Campos extra para el JSON del frontend
    private String name; // Para compatibilidad con el front

    public Customer() {}

    public Customer(Integer id, String email, String fullName, String username, String role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.username = username;
        this.role = role;
        this.name = fullName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; this.name = fullName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
}
