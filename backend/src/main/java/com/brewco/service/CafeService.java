package com.brewco.service;

import com.brewco.entity.Cafe;
import com.brewco.entity.User;
import com.brewco.repository.CafeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CafeService {

    @Autowired
    private CafeRepository cafeRepository;

    public Cafe createCafe(Cafe cafe) {
        cafe.setIsVerified(false);
        cafe.setIsActive(true);
        return cafeRepository.save(cafe);
    }

    public Cafe updateCafe(Cafe cafe) {
        return cafeRepository.save(cafe);
    }

    public List<Cafe> getAllVerifiedCafes() {
        return cafeRepository.findByIsVerifiedTrueAndIsActiveTrue();
    }

    public List<Cafe> getCafesByOwner(User owner) {
        return cafeRepository.findByOwner(owner);
    }

    public Optional<Cafe> getCafeById(Long id) {
        return cafeRepository.findById(id);
    }

    public Optional<Cafe> getCafeByIdAndOwner(Long id, User owner) {
        return cafeRepository.findByIdAndOwner(id, owner);
    }
}
