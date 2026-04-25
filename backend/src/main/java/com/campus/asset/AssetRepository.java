package com.campus.asset;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    long countByStatusIgnoreCase(String status);

    List<Asset> findByStatusIgnoreCaseOrderByNameAsc(String status);

    List<Asset> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

    List<Asset> findAllByOrderByNameAsc();

    List<Asset> findTop5ByOrderByCreatedAtDesc();
}
