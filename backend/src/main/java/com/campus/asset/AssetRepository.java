package com.campus.asset;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    long countByStatusIgnoreCase(String status);

    List<Asset> findTop5ByOrderByCreatedAtDesc();
}
