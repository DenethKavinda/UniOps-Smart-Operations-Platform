package com.campus.asset;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.asset.dto.AssetResponse;
import com.campus.common.exception.ResourceNotFoundException;
import com.campus.common.response.ApiResponse;

@RestController
@RequestMapping("/api")
public class AssetController {

    private final AssetRepository assetRepository;

    public AssetController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAssets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query) {
        List<Asset> assets;
        if (query != null && !query.trim().isEmpty()) {
            assets = assetRepository.findByNameContainingIgnoreCaseOrderByNameAsc(query.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            assets = assetRepository.findByStatusIgnoreCaseOrderByNameAsc(status.trim());
        } else {
            assets = assetRepository.findAllByOrderByNameAsc();
        }
        return ResponseEntity.ok(ApiResponse.success("Assets loaded successfully.", assets.stream().map(this::toResponse).toList()));
    }

    @GetMapping("/assets/{assetId}")
    public ResponseEntity<ApiResponse<AssetResponse>> getAsset(@PathVariable Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found."));
        return ResponseEntity.ok(ApiResponse.success("Asset loaded successfully.", toResponse(asset)));
    }

    private AssetResponse toResponse(Asset asset) {
        return new AssetResponse(asset.getId(), asset.getName(), asset.getStatus(), asset.getCreatedAt());
    }
}
