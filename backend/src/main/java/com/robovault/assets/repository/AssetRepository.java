package com.robovault.assets.repository;

import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends MongoRepository<Asset, String> {

    Optional<Asset> findByAssetId(String assetId);

    boolean existsByAssetId(String assetId);

    Page<Asset> findByCategory(AssetCategory category, Pageable pageable);

    Page<Asset> findByStatus(AssetStatus status, Pageable pageable);

    List<Asset> findByAllocatedProjectId(String projectId);

    long countByStatus(AssetStatus status);

    long countByCategory(AssetCategory category);

    @Query("{ '$or': [ " +
           "{ 'assetId': { $regex: ?0, $options: 'i' } }, " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'brand': { $regex: ?0, $options: 'i' } }, " +
           "{ 'model': { $regex: ?0, $options: 'i' } }, " +
           "{ 'serialNumber': { $regex: ?0, $options: 'i' } }, " +
           "{ 'location': { $regex: ?0, $options: 'i' } } " +
           "] }")
    List<Asset> searchByGeneralQuery(String query);

    @Query("{ '$or': [ " +
           "{ 'assetId': { $regex: ?0, $options: 'i' } }, " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'brand': { $regex: ?0, $options: 'i' } }, " +
           "{ 'model': { $regex: ?0, $options: 'i' } }, " +
           "{ 'serialNumber': { $regex: ?0, $options: 'i' } }, " +
           "{ 'location': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Asset> searchByGeneralQueryPaged(String query, Pageable pageable);
}

