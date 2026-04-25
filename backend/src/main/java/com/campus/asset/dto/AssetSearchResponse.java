package com.campus.asset.dto;

import java.util.List;

public class AssetSearchResponse {

    private List<AssetResponse> items;

    public AssetSearchResponse() {
    }

    public AssetSearchResponse(List<AssetResponse> items) {
        this.items = items;
    }

    public List<AssetResponse> getItems() {
        return items;
    }

    public void setItems(List<AssetResponse> items) {
        this.items = items;
    }
}
