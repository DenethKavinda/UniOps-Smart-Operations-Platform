package com.campus.asset;

import java.util.List;

import com.campus.asset.dto.AssetRequest;
import com.campus.asset.dto.AssetResponse;

public interface AssetService {

	AssetResponse createAsset(AssetRequest request);

	AssetResponse updateAsset(Long assetId, AssetRequest request);

	void deleteAsset(Long assetId);

	AssetResponse getAsset(Long assetId);

	List<AssetResponse> searchAssets(String q, String type, Integer minCapacity, String location, String status);
}
