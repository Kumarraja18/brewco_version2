package com.brewco.dto;

import com.brewco.entity.Cafe;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class CafeAdminResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String contactNumber;
    private String email;
    private String gstNumber;
    private String fssaiLicense;
    private String foodLicenseNumber;
    private BigDecimal avgRating;
    private Integer totalReviews;
    private String profileImageUrl;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean isVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Owner info
    private OwnerInfo owner;

    @Data
    public static class OwnerInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String mobileNumber;
    }

    public static CafeAdminResponse from(Cafe cafe) {
        CafeAdminResponse dto = new CafeAdminResponse();
        dto.setId(cafe.getId());
        dto.setName(cafe.getName());
        dto.setDescription(cafe.getDescription());
        dto.setAddress(cafe.getAddress());
        dto.setCity(cafe.getCity());
        dto.setState(cafe.getState());
        dto.setZipCode(cafe.getZipCode());
        dto.setContactNumber(cafe.getContactNumber());
        dto.setEmail(cafe.getEmail());
        dto.setGstNumber(cafe.getGstNumber());
        dto.setFssaiLicense(cafe.getFssaiLicense());
        dto.setFoodLicenseNumber(cafe.getFoodLicenseNumber());
        dto.setAvgRating(cafe.getAvgRating());
        dto.setTotalReviews(cafe.getTotalReviews());
        dto.setProfileImageUrl(cafe.getProfileImageUrl());
        dto.setOpeningTime(cafe.getOpeningTime());
        dto.setClosingTime(cafe.getClosingTime());
        dto.setIsVerified(cafe.getIsVerified());
        dto.setIsActive(cafe.getIsActive());
        dto.setCreatedAt(cafe.getCreatedAt());
        dto.setUpdatedAt(cafe.getUpdatedAt());

        if (cafe.getOwner() != null) {
            OwnerInfo ownerInfo = new OwnerInfo();
            ownerInfo.setId(cafe.getOwner().getId());
            ownerInfo.setFirstName(cafe.getOwner().getFirstName());
            ownerInfo.setLastName(cafe.getOwner().getLastName());
            ownerInfo.setEmail(cafe.getOwner().getEmail());
            ownerInfo.setMobileNumber(cafe.getOwner().getMobileNumber());
            dto.setOwner(ownerInfo);
        }

        return dto;
    }
}
