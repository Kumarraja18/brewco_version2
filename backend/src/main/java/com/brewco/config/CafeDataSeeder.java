package com.brewco.config;

import com.brewco.entity.*;
import com.brewco.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

// @Component
public class CafeDataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CafeRepository cafeRepository;

    @Autowired
    private CafeTableRepository cafeTableRepository;

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (cafeRepository.count() > 0) {
            System.out.println("✓ Cafes already exist. Skipping sample data seeder.");
            return;
        }

        System.out.println("Seeding 2 sample cafes for testing customer flows...");

        // 1. Create a sample Cafe Owner
        User owner = userRepository.findByEmail("owner@brewco.com").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Sample");
            u.setLastName("Owner");
            u.setEmail("owner@brewco.com");
            u.setPassword("owner123");
            u.setPasswordHash(passwordEncoder.encode("owner123"));
            u.setRole("CAFE_OWNER");
            u.setGender("MALE");
            u.setIsActive(true);
            u.setIsEmailVerified(true);
            u.setCreatedAt(LocalDateTime.now());
            return userRepository.save(u);
        });

        // 2. Sample Cafe 1: "The Java Bean"
        Cafe cafe1 = new Cafe();
        cafe1.setOwner(owner);
        cafe1.setName("The Java Bean");
        cafe1.setDescription("Premium coffee and quiet study spaces.");
        cafe1.setAddress("123 Tech Park");
        cafe1.setCity("Seattle");
        cafe1.setState("WA");
        cafe1.setZipCode("98101");
        cafe1.setContactNumber("555-0101");
        cafe1.setEmail("javabean@example.com");
        cafe1.setGstNumber("22AAAAA0000A1Z5");
        cafe1.setFssaiLicense("12345678901234");
        cafe1.setOpeningTime(LocalTime.of(7, 0));
        cafe1.setClosingTime(LocalTime.of(20, 0));
        cafe1.setIsVerified(true);
        cafeRepository.save(cafe1);

        // Cafe 1 Tables (with tableType)
        createTable(cafe1, 1, 2, "STANDARD", "Window seat for two");
        createTable(cafe1, 2, 4, "PREMIUM", "Corner booth with cushions");
        createTable(cafe1, 3, 4, "PREMIUM", "Center table");
        createTable(cafe1, 4, 6, "EXCLUSIVE", "Private dining area");

        // Cafe 1 Menu
        MenuCategory c1Beverages = createCategory(cafe1, "Beverages", 1);
        MenuCategory c1Snacks = createCategory(cafe1, "Snacks", 2);

        createMenuItem(cafe1, c1Beverages, "Espresso", "Strong black coffee", new BigDecimal("3.50"), "VEG",
                "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                false);
        createMenuItem(cafe1, c1Beverages, "Cappuccino", "Classic espresso with foamed milk", new BigDecimal("4.50"),
                "VEG",
                "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                false);
        createMenuItem(cafe1, c1Snacks, "Blueberry Muffin", "Freshly baked daily", new BigDecimal("3.00"), "EGG",
                "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                false);
        createMenuItem(cafe1, c1Beverages, "Extra Shot", "Add an extra espresso shot", new BigDecimal("1.00"), "VEG",
                null, true); // addon item

        // 3. Sample Cafe 2: "Byte & Bite"
        Cafe cafe2 = new Cafe();
        cafe2.setOwner(owner);
        cafe2.setName("Byte & Bite");
        cafe2.setDescription("Fast food and energy drinks for coders.");
        cafe2.setAddress("404 Server Lane");
        cafe2.setCity("San Francisco");
        cafe2.setState("CA");
        cafe2.setZipCode("94107");
        cafe2.setContactNumber("555-0202");
        cafe2.setEmail("bytebite@example.com");
        cafe2.setOpeningTime(LocalTime.of(10, 0));
        cafe2.setClosingTime(LocalTime.of(23, 59));
        cafe2.setIsVerified(true);
        cafeRepository.save(cafe2);

        // Cafe 2 Tables
        createTable(cafe2, 1, 2, "STANDARD", "Counter seat");
        createTable(cafe2, 2, 8, "EXCLUSIVE", "Large group table");

        // Cafe 2 Menu
        MenuCategory c2Mains = createCategory(cafe2, "Burgers", 1);
        MenuCategory c2Drinks = createCategory(cafe2, "Energy Drinks", 2);

        createMenuItem(cafe2, c2Mains, "Chicken Burger", "Spicy crispy chicken", new BigDecimal("8.50"), "NON_VEG",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                false);
        createMenuItem(cafe2, c2Drinks, "Red Bull", "Gives you wings", new BigDecimal("4.00"), "VEG",
                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                false);

        System.out.println("✓ Sample cafes seeded successfully!");
    }

    private void createTable(Cafe cafe, int number, int capacity, String tableType, String description) {
        CafeTable table = new CafeTable();
        table.setCafe(cafe);
        table.setTableNumber(number);
        table.setCapacity(capacity);
        table.setTableType(tableType);
        table.setDescription(description);
        table.setStatus("AVAILABLE");
        table.setIsAvailable(true);
        cafeTableRepository.save(table);
    }

    private MenuCategory createCategory(Cafe cafe, String name, int order) {
        MenuCategory category = new MenuCategory();
        category.setCafe(cafe);
        category.setName(name);
        category.setDisplayOrder(order);
        category.setIsActive(true);
        return menuCategoryRepository.save(category);
    }

    private void createMenuItem(Cafe cafe, MenuCategory category, String name, String desc, BigDecimal price,
            String type, String img, boolean isAddon) {
        MenuItem item = new MenuItem();
        item.setCafe(cafe);
        item.setCategory(category);
        item.setName(name);
        item.setDescription(desc);
        item.setPrice(price);
        item.setType(type);
        item.setIsAvailable(true);
        item.setIsAddon(isAddon);
        item.setAvgRating(BigDecimal.ZERO);
        item.setImageUrl(img);
        menuItemRepository.save(item);
    }
}
