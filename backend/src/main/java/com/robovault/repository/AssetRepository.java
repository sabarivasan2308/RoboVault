package com.robovault.repository;

import com.robovault.model.Asset;
import com.robovault.model.AssetCategory;
import com.robovault.model.AssetStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends MongoRepository<Asset, String> {

    Optional<Asset> findByAssetId(String assetId);

    Optional<Asset> findBySerialNumber(String serialNumber);

    List<Asset> findByCategory(AssetCategory category);

    List<Asset> findByStatus(AssetStatus status);

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
}

