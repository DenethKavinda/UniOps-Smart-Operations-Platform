package com.campus.asset;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.asset.dto.AssetRequest;
import com.campus.asset.dto.AssetResponse;
import com.campus.common.response.ApiResponse;

@RestController
@RequestMapping("/api")
public class AssetController {

	private final AssetService assetService;

	public AssetController(AssetService assetService) {
		this.assetService = assetService;
	}

	// Admin endpoints
	@PostMapping("/admin/assets")
	public ResponseEntity<ApiResponse<AssetResponse>> create(@RequestBody AssetRequest request) {
		return ResponseEntity.ok(ApiResponse.success("Asset created successfully.", assetService.createAsset(request)));
	}

	@GetMapping("/admin/assets")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> adminList(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) Integer minCapacity,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) String status) {
		return ResponseEntity.ok(ApiResponse.success("Assets loaded successfully.",
				assetService.searchAssets(q, type, minCapacity, location, status)));
	}

	@GetMapping("/admin/assets/{id}")
	public ResponseEntity<ApiResponse<AssetResponse>> adminGet(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success("Asset loaded successfully.", assetService.getAsset(id)));
	}

	@PutMapping("/admin/assets/{id}")
	public ResponseEntity<ApiResponse<AssetResponse>> update(@PathVariable Long id, @RequestBody AssetRequest request) {
		return ResponseEntity.ok(ApiResponse.success("Asset updated successfully.", assetService.updateAsset(id, request)));
	}

	@DeleteMapping("/admin/assets/{id}")
	public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
		assetService.deleteAsset(id);
		return ResponseEntity.ok(ApiResponse.success("Asset deleted successfully.", null));
	}

	// User endpoints
	@GetMapping("/assets")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> browse(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) Integer minCapacity,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) String status) {
		return ResponseEntity.ok(ApiResponse.success("Assets loaded successfully.",
				assetService.searchAssets(q, type, minCapacity, location, status)));
	}

	@GetMapping("/assets/{id}")
	public ResponseEntity<ApiResponse<AssetResponse>> details(@PathVariable Long id) {
		return ResponseEntity.ok(ApiResponse.success("Asset loaded successfully.", assetService.getAsset(id)));
	}
}
