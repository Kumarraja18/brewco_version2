package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.MenuCategory;
import com.brewco.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryAndIsAvailableTrue(MenuCategory category);

    List<MenuItem> findByCafe(Cafe cafe);

    List<MenuItem> findByCategory(MenuCategory category);

    List<MenuItem> findByCafeAndCategory(Cafe cafe, MenuCategory category);
}
