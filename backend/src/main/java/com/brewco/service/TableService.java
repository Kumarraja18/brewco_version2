package com.brewco.service;

import com.brewco.entity.Cafe;
import com.brewco.entity.CafeTable;
import com.brewco.repository.CafeTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TableService {

    @Autowired
    private CafeTableRepository cafeTableRepository;

    public List<CafeTable> getTablesForCafe(Cafe cafe) {
        return cafeTableRepository.findByCafe(cafe);
    }

    public Optional<CafeTable> getTableById(Long id) {
        return cafeTableRepository.findById(id);
    }

    public CafeTable createTable(CafeTable table) {
        return cafeTableRepository.save(table);
    }

    public CafeTable updateTable(CafeTable table) {
        return cafeTableRepository.save(table);
    }

    public void deleteTable(Long id) {
        cafeTableRepository.deleteById(id);
    }
}
