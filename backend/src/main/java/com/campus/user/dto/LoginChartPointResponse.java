package com.campus.user.dto;

public class LoginChartPointResponse {

    private Long id;
    private String name;
    private String email;
    private int loginCount;

    public LoginChartPointResponse() {
    }

    public LoginChartPointResponse(Long id, String name, String email, int loginCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.loginCount = loginCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(int loginCount) {
        this.loginCount = loginCount;
    }
}
