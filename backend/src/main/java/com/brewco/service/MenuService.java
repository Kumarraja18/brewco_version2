package com.brewco.service;

import com.brewco.entity.Cafe;
import com.brewco.entity.MenuCategory;
import com.brewco.entity.MenuItem;
import com.brewco.repository.MenuCategoryRepository;
import com.brewco.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    // --- Categories ---

    public List<MenuCategory> getActiveCategoriesForCafe(Cafe cafe) {
        return menuCategoryRepository.findByCafeAndIsActiveTrueOrderByDisplayOrder(cafe);
    }

    public List<MenuCategory> getAllCategoriesForCafe(Cafe cafe) {
        return menuCategoryRepository.findByCafeOrderByDisplayOrder(cafe);
    }

    @Transactional
    public MenuCategory createCategory(MenuCategory category) {
        return menuCategoryRepository.save(category);
    }

    @Transactional
    public MenuCategory updateCategory(MenuCategory category) {
        return menuCategoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        menuCategoryRepository.deleteById(id);
    }

    public Optional<MenuCategory> getCategoryById(Long id) {
        return menuCategoryRepository.findById(id);
    }

    // --- Items ---

    public List<MenuItem> getAvailableItemsForCategory(MenuCategory category) {
        return menuItemRepository.findByCategoryAndIsAvailableTrue(category);
    }

    public List<MenuItem> getAllItemsForCafe(Cafe cafe) {
        return menuItemRepository.findByCafe(cafe);
    }

    @Transactional
    public MenuItem createItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    @Transactional
    public MenuItem updateItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public Optional<MenuItem> getItemById(Long itemId) {
        return menuItemRepository.findById(itemId);
    }

    /**
     * Returns all add-on items for a cafe (e.g. extra shot, whipped cream,
     * biscuits).
     * Used in "Would you like to add more items?" upsell section.
     */
    public List<MenuItem> getAddonsForCafe(Cafe cafe) {
        return menuItemRepository.findByCafe(cafe).stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsAddon()) && Boolean.TRUE.equals(item.getIsAvailable()))
                .toList();
    }

    /**
     * Returns top-rated available items for suggestions/upselling.
     * Shows relatable items the customer might also want.
     */
    public List<MenuItem> getSuggestedItems(Cafe cafe, int limit) {
        return menuItemRepository.findByCafe(cafe).stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsAvailable()) && !Boolean.TRUE.equals(item.getIsAddon()))
                .sorted((a, b) -> b.getAvgRating().compareTo(a.getAvgRating()))
                .limit(limit)
                .toList();
    }
}
