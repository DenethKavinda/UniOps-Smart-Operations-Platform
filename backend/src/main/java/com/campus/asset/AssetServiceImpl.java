package com.campus.asset;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campus.asset.dto.AssetAvailabilityWindowRequest;
import com.campus.asset.dto.AssetAvailabilityWindowResponse;
import com.campus.asset.dto.AssetRequest;
import com.campus.asset.dto.AssetResponse;
import com.campus.common.exception.ResourceNotFoundException;

import jakarta.persistence.criteria.Predicate;

@Service
public class AssetServiceImpl implements AssetService {

	private final AssetRepository assetRepository;

	public AssetServiceImpl(AssetRepository assetRepository) {
		this.assetRepository = assetRepository;
	}

	@Override
	@Transactional
	public AssetResponse createAsset(AssetRequest request) {
		validateAssetRequest(request);

		Asset asset = new Asset();
		applyRequest(asset, request);
		Asset saved = assetRepository.save(asset);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public AssetResponse updateAsset(Long assetId, AssetRequest request) {
		if (assetId == null) {
			throw new IllegalArgumentException("Asset id is required.");
		}
		validateAssetRequest(request);

		Asset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new ResourceNotFoundException("Asset not found."));

		applyRequest(asset, request);
		Asset saved = assetRepository.save(asset);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteAsset(Long assetId) {
		if (assetId == null) {
			throw new IllegalArgumentException("Asset id is required.");
		}
		Asset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new ResourceNotFoundException("Asset not found."));
		assetRepository.delete(asset);
	}

	@Override
	@Transactional(readOnly = true)
	public AssetResponse getAsset(Long assetId) {
		if (assetId == null) {
			throw new IllegalArgumentException("Asset id is required.");
		}
		Asset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new ResourceNotFoundException("Asset not found."));
		return toResponse(asset);
	}

	@Override
	@Transactional(readOnly = true)
	public List<AssetResponse> searchAssets(String q, String type, Integer minCapacity, String location,
			String status) {
		Specification<Asset> spec = buildSpec(q, type, minCapacity, location, status);

		return assetRepository.findAll(spec).stream()
				.sorted(Comparator.comparing(Asset::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	private void validateAssetRequest(AssetRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Request body is required.");
		}
		if (request.getName() == null || request.getName().isBlank()) {
			throw new IllegalArgumentException("Name is required.");
		}
		if (request.getType() == null || request.getType().isBlank()) {
			throw new IllegalArgumentException("Type is required.");
		}
		if (request.getCapacity() == null || request.getCapacity() < 0) {
			throw new IllegalArgumentException("Capacity must be 0 or greater.");
		}
		if (request.getLocation() == null || request.getLocation().isBlank()) {
			throw new IllegalArgumentException("Location is required.");
		}
		normalizeAndValidateStatus(request.getStatus());

		if (request.getAvailabilityWindows() != null) {
			for (AssetAvailabilityWindowRequest window : request.getAvailabilityWindows()) {
				validateWindow(window);
			}
		}
	}

	private AssetStatus normalizeAndValidateStatus(String raw) {
		String value = raw;
		if (value == null || value.isBlank()) {
			return AssetStatus.ACTIVE;
		}
		try {
			return AssetStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException ex) {
			throw new IllegalArgumentException("Status must be ACTIVE or OUT_OF_SERVICE.");
		}
	}

	private void validateWindow(AssetAvailabilityWindowRequest window) {
		if (window == null) {
			throw new IllegalArgumentException("Availability window is required.");
		}
		if (window.getStartAt() == null || window.getEndAt() == null) {
			throw new IllegalArgumentException("Availability window startAt and endAt are required.");
		}
		if (!window.getStartAt().isBefore(window.getEndAt())) {
			throw new IllegalArgumentException("Availability window startAt must be before endAt.");
		}
	}

	private void applyRequest(Asset asset, AssetRequest request) {
		asset.setName(request.getName().trim());
		asset.setType(request.getType().trim());
		asset.setCapacity(request.getCapacity());
		asset.setLocation(request.getLocation().trim());
		asset.setStatus(normalizeAndValidateStatus(request.getStatus()).name());

		if (request.getAvailabilityWindows() != null) {
			replaceAvailabilityWindows(asset, request.getAvailabilityWindows());
		}
	}

	private void replaceAvailabilityWindows(Asset asset, List<AssetAvailabilityWindowRequest> windows) {
		if (asset.getAvailabilityWindows() == null) {
			asset.setAvailabilityWindows(new ArrayList<>());
		}

		asset.getAvailabilityWindows().clear();

		for (AssetAvailabilityWindowRequest window : windows) {
			if (window == null) {
				continue;
			}
			validateWindow(window);

			AssetAvailabilityWindow entity = new AssetAvailabilityWindow();
			entity.setAsset(asset);
			entity.setStartAt(window.getStartAt());
			entity.setEndAt(window.getEndAt());
			asset.getAvailabilityWindows().add(entity);
		}
	}

	private Specification<Asset> buildSpec(String q, String type, Integer minCapacity, String location,
			String status) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (q != null && !q.isBlank()) {
				String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
				predicates.add(cb.like(cb.lower(root.get("name")), pattern));
			}
			if (type != null && !type.isBlank()) {
				predicates.add(cb.equal(cb.lower(root.get("type")), type.trim().toLowerCase(Locale.ROOT)));
			}
			if (minCapacity != null) {
				predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
			}
			if (location != null && !location.isBlank()) {
				String pattern = "%" + location.trim().toLowerCase(Locale.ROOT) + "%";
				predicates.add(cb.like(cb.lower(root.get("location")), pattern));
			}
			if (status != null && !status.isBlank()) {
				predicates.add(cb.equal(cb.upper(root.get("status")), normalizeAndValidateStatus(status).name()));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}

	private AssetResponse toResponse(Asset asset) {
		LocalDateTime now = LocalDateTime.now();
		boolean availableNow = isAvailableNow(asset, now);

		List<AssetAvailabilityWindowResponse> windows = null;
		if (asset.getAvailabilityWindows() != null) {
			windows = asset.getAvailabilityWindows().stream()
					.filter(Objects::nonNull)
					.map(w -> new AssetAvailabilityWindowResponse(w.getId(), w.getStartAt(), w.getEndAt()))
					.collect(Collectors.toList());
		}

		return new AssetResponse(asset.getId(), asset.getName(), asset.getType(), asset.getCapacity(),
				asset.getLocation(), asset.getStatus(), availableNow, asset.getCreatedAt(), windows);
	}

	private boolean isAvailableNow(Asset asset, LocalDateTime now) {
		if (asset == null) {
			return false;
		}
		if (!AssetStatus.ACTIVE.name().equalsIgnoreCase(asset.getStatus())) {
			return false;
		}

		List<AssetAvailabilityWindow> windows = asset.getAvailabilityWindows();
		if (windows == null || windows.isEmpty()) {
			return true;
		}

		for (AssetAvailabilityWindow window : windows) {
			if (window == null || window.getStartAt() == null || window.getEndAt() == null) {
				continue;
			}
			boolean within = !now.isBefore(window.getStartAt()) && now.isBefore(window.getEndAt());
			if (within) {
				return true;
			}
		}

		return false;
	}
}
