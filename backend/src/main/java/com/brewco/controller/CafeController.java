package com.brewco.controller;

import com.brewco.entity.Cafe;
import com.brewco.entity.CafeTable;
import com.brewco.entity.MenuCategory;
import com.brewco.entity.MenuItem;
import com.brewco.service.CafeService;
import com.brewco.service.MenuService;
import com.brewco.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafes")
public class CafeController {

    @Autowired
    private CafeService cafeService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private TableService tableService;

    /** GET /api/cafes — all verified & active cafes (public) */
    @GetMapping
    public ResponseEntity<List<Cafe>> getAllVerifiedCafes() {
        return ResponseEntity.ok(cafeService.getAllVerifiedCafes());
    }

    /** GET /api/cafes/{id} — single cafe detail (public) */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCafeById(@PathVariable("id") Long id) {
        return cafeService.getCafeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/cafes/{id}/menu — active menu categories for a cafe (public) */
    @GetMapping("/{id}/menu")
    public ResponseEntity<?> getCafeMenu(@PathVariable("id") Long id) {
        return cafeService.getCafeById(id).map(cafe -> {
            List<MenuCategory> categories = menuService.getActiveCategoriesForCafe(cafe);
            return ResponseEntity.ok(categories);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/cafes/{id}/menu/items — menu items, optionally filtered by
     * categoryId
     */
    @GetMapping("/{id}/menu/items")
    public ResponseEntity<?> getCafeMenuItems(@PathVariable("id") Long id,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        return cafeService.getCafeById(id).map(cafe -> {
            if (categoryId != null) {
                return menuService.getCategoryById(categoryId).map(category -> {
                    List<MenuItem> items = menuService.getAvailableItemsForCategory(category);
                    return ResponseEntity.ok(items);
                }).orElse(ResponseEntity.ok(List.of()));
            }
            List<MenuItem> items = menuService.getAllItemsForCafe(cafe);
            return ResponseEntity.ok(items);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/cafes/categories/{categoryId}/items — items in a specific category
     */
    @GetMapping("/categories/{categoryId}/items")
    public ResponseEntity<?> getItemsForCategory(@PathVariable("categoryId") Long categoryId) {
        return menuService.getCategoryById(categoryId).map(category -> {
            List<MenuItem> items = menuService.getAvailableItemsForCategory(category);
            return ResponseEntity.ok(items);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/cafes/{id}/tables — all tables for a cafe (public) */
    @GetMapping("/{id}/tables")
    public ResponseEntity<?> getCafeTables(@PathVariable("id") Long id) {
        return cafeService.getCafeById(id).map(cafe -> {
            List<CafeTable> tables = tableService.getTablesForCafe(cafe);
            return ResponseEntity.ok(tables);
        }).orElse(ResponseEntity.notFound().build());
    }
}
