package com.brewco.controller;

import com.brewco.entity.*;
import com.brewco.repository.UserRepository;
import com.brewco.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cafe-owner")
@PreAuthorize("hasAnyRole('CAFE_OWNER', 'CHEF', 'WAITER')")
public class CafeOwnerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CafeService cafeService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private TableService tableService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private BookingService bookingService;

    // ==================== Helper ====================

    private User getOwner(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    private Cafe getOwnedCafe(Long cafeId, Authentication auth) throws Exception {
        User user = getOwner(auth);
        
        // If it's the owner, check findByIdAndOwner
        if ("CAFE_OWNER".equals(user.getRole())) {
            return cafeService.getCafeByIdAndOwner(cafeId, user)
                    .orElseThrow(() -> new Exception("Cafe not found or you are not the owner"));
        }
        
        // If it's a staff member (CHEF/WAITER), check their assignment
        StaffAssignment assignment = staffService.getActiveAssignmentForStaff(user)
                .orElseThrow(() -> new Exception("You are not assigned to any cafe"));
        
        if (!assignment.getCafe().getId().equals(cafeId)) {
            throw new Exception("You are not authorized to access this cafe's data");
        }
        
        return assignment.getCafe();
    }

    // ==================== Cafe CRUD ====================

    @GetMapping("/cafes")
    public ResponseEntity<?> getMyCafes(Authentication auth) {
        User owner = getOwner(auth);
        return ResponseEntity.ok(cafeService.getCafesByOwner(owner));
    }

    @PostMapping("/cafes")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createCafe(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            User owner = getOwner(auth);
            
            Cafe cafe = new Cafe();
            cafe.setOwner(owner);
            cafe.setName(payload.get("name") != null ? (String) payload.get("name") : "New Cafe");
            cafe.setDescription((String) payload.get("description"));
            
            // Map address fields from setup wizard
            String street = (String) payload.get("street");
            String city = (String) payload.get("city");
            String state = (String) payload.get("state");
            String pincode = (String) payload.get("pincode");
            
            cafe.setAddress(street != null ? street : "Unknown Street");
            cafe.setCity(city != null ? city : "Unknown City");
            cafe.setState(state);
            cafe.setZipCode(pincode);
            
            cafe.setContactNumber((String) payload.get("contactNumber"));
            cafe.setEmail((String) payload.get("email"));
            
            try {
                if (payload.get("openingTime") != null) {
                    cafe.setOpeningTime(java.time.LocalTime.parse(payload.get("openingTime").toString()));
                } else {
                    cafe.setOpeningTime(java.time.LocalTime.of(9, 0));
                }
                
                if (payload.get("closingTime") != null) {
                    cafe.setClosingTime(java.time.LocalTime.parse(payload.get("closingTime").toString()));
                } else {
                    cafe.setClosingTime(java.time.LocalTime.of(22, 0));
                }
            } catch (Exception e) {
                cafe.setOpeningTime(java.time.LocalTime.of(9, 0));
                cafe.setClosingTime(java.time.LocalTime.of(22, 0));
            }
            
            cafe.setGstNumber((String) payload.get("gstNumber"));
            cafe.setFssaiLicense((String) payload.get("fssaiNumber"));
            cafe.setIsVerified(false);
            cafe.setIsActive(true);

            Cafe saved = cafeService.createCafe(cafe);
            return ResponseEntity.ok(Map.of("message", "Cafe application submitted for verification", "cafe", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}")
    public ResponseEntity<?> updateCafe(@PathVariable("cafeId") Long cafeId, @RequestBody Cafe updatedCafe,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            if (updatedCafe.getName() != null)
                cafe.setName(updatedCafe.getName());
            if (updatedCafe.getDescription() != null)
                cafe.setDescription(updatedCafe.getDescription());
            if (updatedCafe.getAddress() != null)
                cafe.setAddress(updatedCafe.getAddress());
            if (updatedCafe.getCity() != null)
                cafe.setCity(updatedCafe.getCity());
            if (updatedCafe.getState() != null)
                cafe.setState(updatedCafe.getState());
            if (updatedCafe.getZipCode() != null)
                cafe.setZipCode(updatedCafe.getZipCode());
            if (updatedCafe.getContactNumber() != null)
                cafe.setContactNumber(updatedCafe.getContactNumber());
            if (updatedCafe.getEmail() != null)
                cafe.setEmail(updatedCafe.getEmail());
            if (updatedCafe.getOpeningTime() != null)
            cafe.setOpeningTime(updatedCafe.getOpeningTime());
            if (updatedCafe.getClosingTime() != null)
                cafe.setClosingTime(updatedCafe.getClosingTime());
            if (updatedCafe.getGstNumber() != null)
                cafe.setGstNumber(updatedCafe.getGstNumber());
            if (updatedCafe.getFoodLicenseNumber() != null)
                cafe.setFoodLicenseNumber(updatedCafe.getFoodLicenseNumber());
            if (updatedCafe.getFssaiLicense() != null)
                cafe.setFssaiLicense(updatedCafe.getFssaiLicense());
            if (updatedCafe.getProfileImageUrl() != null)
            cafe.setProfileImageUrl(updatedCafe.getProfileImageUrl());

            Cafe saved = cafeService.updateCafe(cafe);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Dashboard ====================

    @GetMapping("/cafes/{cafeId}/dashboard")
    public ResponseEntity<?> getDashboardStats(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            List<Order> allOrders = orderService.getCafeOrders(cafe);
            List<Booking> allBookings = bookingService.getCafeBookings(cafe);
            List<StaffAssignment> allStaff = staffService.getActiveStaffForCafe(cafe);
            List<CafeTable> tables = tableService.getTablesForCafe(cafe);

            BigDecimal totalRevenue = allOrders.stream()
                    .filter(o -> "DELIVERED".equals(o.getStatus()))
                    .map(Order::getGrandTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            java.time.LocalDate today = java.time.LocalDate.now();
            BigDecimal todayRevenue = allOrders.stream()
                    .filter(o -> "DELIVERED".equals(o.getStatus()) && o.getCreatedAt() != null
                            && o.getCreatedAt().toLocalDate().equals(today))
                    .map(Order::getGrandTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long todayOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(today))
                    .count();

            return ResponseEntity.ok(Map.ofEntries(
                    Map.entry("totalOrders", allOrders.size()),
                    Map.entry("pendingOrders", allOrders.stream().filter(o -> "PLACED".equals(o.getStatus())).count()),
                    Map.entry("confirmedOrders",
                            allOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count()),
                    Map.entry("preparingOrders",
                            allOrders.stream()
                                    .filter(o -> "SENT_TO_KITCHEN".equals(o.getStatus())
                                            || "PREPARING".equals(o.getStatus()))
                                    .count()),
                    Map.entry("readyOrders", allOrders.stream().filter(o -> "READY".equals(o.getStatus())).count()),
                    Map.entry("deliveredOrders",
                            allOrders.stream().filter(o -> "DELIVERED".equals(o.getStatus())).count()),
                    Map.entry("totalRevenue", totalRevenue),
                    Map.entry("todayRevenue", todayRevenue),
                    Map.entry("todayOrders", todayOrders),
                    Map.entry("totalBookings", allBookings.size()),
                    Map.entry("totalTables", tables.size()),
                    Map.entry("availableTables",
                            tables.stream().filter(t -> "AVAILABLE".equals(t.getStatus())).count()),
                    Map.entry("totalStaff", allStaff.size()),
                    Map.entry("totalChefs", allStaff.stream().filter(s -> "CHEF".equals(s.getRole())).count()),
                    Map.entry("totalWaiters", allStaff.stream().filter(s -> "WAITER".equals(s.getRole())).count()),
                    Map.entry("totalMenuItems", menuService.getAllItemsForCafe(cafe).size())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Menu Categories ====================

    @GetMapping("/cafes/{cafeId}/menu/categories")
    public ResponseEntity<?> getCategories(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(menuService.getAllCategoriesForCafe(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cafes/{cafeId}/menu/categories")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createCategory(@PathVariable("cafeId") Long cafeId, @RequestBody Map<String, Object> payload,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            MenuCategory category = new MenuCategory();
            category.setCafe(cafe);
            category.setName((String) payload.get("name"));
            category.setDisplayOrder(payload.get("displayOrder") != null ? Integer.parseInt(payload.get("displayOrder").toString()) : 0);
            category.setIsActive(payload.get("isActive") != null ? (Boolean) payload.get("isActive") : true);
            category.setDescription((String) payload.get("description"));
            
            return ResponseEntity.ok(menuService.createCategory(category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/menu/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable("cafeId") Long cafeId,
            @PathVariable("categoryId") Long categoryId,
            @RequestBody MenuCategory updated, Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            MenuCategory category = menuService.getCategoryById(categoryId)
                    .orElseThrow(() -> new Exception("Category not found"));
            if (updated.getName() != null)
                category.setName(updated.getName());
            if (updated.getDisplayOrder() != null)
                category.setDisplayOrder(updated.getDisplayOrder());
            if (updated.getIsActive() != null)
                category.setIsActive(updated.getIsActive());
            return ResponseEntity.ok(menuService.updateCategory(category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cafes/{cafeId}/menu/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable("cafeId") Long cafeId,
            @PathVariable("categoryId") Long categoryId,
            Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            menuService.deleteCategory(categoryId);
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Menu Items ====================

    @GetMapping("/cafes/{cafeId}/menu/items")
    public ResponseEntity<?> getMenuItems(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(menuService.getAllItemsForCafe(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cafes/{cafeId}/menu/items")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createMenuItem(@PathVariable("cafeId") Long cafeId, @RequestBody Map<String, Object> payload,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            
            MenuItem item = new MenuItem();
            item.setCafe(cafe);
            item.setName((String) payload.get("name"));
            item.setDescription((String) payload.get("description"));
            item.setType((String) payload.get("type"));
            
            if (payload.get("price") != null) {
                item.setPrice(new BigDecimal(payload.get("price").toString()));
            } else {
                throw new Exception("Price is required");
            }

            if (payload.get("categoryId") != null) {
                Long catId = Long.valueOf(payload.get("categoryId").toString());
                item.setCategory(menuService.getCategoryById(catId).orElseThrow(() -> new Exception("Category not found")));
            } else if (payload.get("category") != null && ((Map)payload.get("category")).get("id") != null) {
                Long catId = Long.valueOf(((Map)payload.get("category")).get("id").toString());
                item.setCategory(menuService.getCategoryById(catId).orElseThrow(() -> new Exception("Category not found")));
            }

            item.setIsAvailable(payload.get("isAvailable") != null ? (Boolean) payload.get("isAvailable") : true);
            item.setIsAddon(payload.get("isAddon") != null ? (Boolean) payload.get("isAddon") : false);
            item.setAvgRating(BigDecimal.ZERO);
            item.setImageUrl((String) payload.get("imageUrl"));

            return ResponseEntity.ok(menuService.createItem(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/menu/items/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable("cafeId") Long cafeId, @PathVariable("itemId") Long itemId,
            @RequestBody MenuItem updated, Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            MenuItem item = menuService.getItemById(itemId)
                    .orElseThrow(() -> new Exception("Menu item not found"));
            if (updated.getName() != null)
                item.setName(updated.getName());
            if (updated.getDescription() != null)
                item.setDescription(updated.getDescription());
            if (updated.getPrice() != null)
                item.setPrice(updated.getPrice());
            if (updated.getType() != null)
                item.setType(updated.getType());
            if (updated.getIsAvailable() != null)
                item.setIsAvailable(updated.getIsAvailable());
            if (updated.getIsAddon() != null)
                item.setIsAddon(updated.getIsAddon());
            if (updated.getImageUrl() != null)
                item.setImageUrl(updated.getImageUrl());
            return ResponseEntity.ok(menuService.updateItem(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cafes/{cafeId}/menu/items/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable("cafeId") Long cafeId, @PathVariable("itemId") Long itemId,
            Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            menuService.deleteItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Menu item deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Tables ====================

    @GetMapping("/cafes/{cafeId}/tables")
    public ResponseEntity<?> getTables(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(tableService.getTablesForCafe(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cafes/{cafeId}/tables")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createTable(@PathVariable("cafeId") Long cafeId, @RequestBody CafeTable table,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            table.setCafe(cafe);
            if (table.getTableType() == null)
                table.setTableType("STANDARD");
            if (table.getStatus() == null)
                table.setStatus("AVAILABLE");
            return ResponseEntity.ok(tableService.createTable(table));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/tables/{tableId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateTable(@PathVariable("cafeId") Long cafeId, @PathVariable("tableId") Long tableId,
            @RequestBody CafeTable updated, Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            CafeTable table = tableService.getTableById(tableId)
                    .orElseThrow(() -> new Exception("Table not found"));
            if (updated.getTableNumber() != null)
                table.setTableNumber(updated.getTableNumber());
            if (updated.getTableType() != null)
                table.setTableType(updated.getTableType());
            if (updated.getCapacity() != null)
                table.setCapacity(updated.getCapacity());
            if (updated.getDescription() != null)
                table.setDescription(updated.getDescription());
            if (updated.getStatus() != null)
                table.setStatus(updated.getStatus());
            return ResponseEntity.ok(tableService.updateTable(table));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cafes/{cafeId}/tables/{tableId}")
    public ResponseEntity<?> deleteTable(@PathVariable("cafeId") Long cafeId, @PathVariable("tableId") Long tableId,
            Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            tableService.deleteTable(tableId);
            return ResponseEntity.ok(Map.of("message", "Table deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Staff Management ====================

    @GetMapping("/cafes/{cafeId}/staff")
    public ResponseEntity<?> getStaff(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(staffService.getActiveStaffForCafe(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cafes/{cafeId}/staff")
    public ResponseEntity<?> addStaff(@PathVariable("cafeId") Long cafeId, @RequestBody Map<String, String> payload,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            User owner = getOwner(auth);

            String firstName = payload.get("firstName");
            String lastName = payload.get("lastName");
            String email = payload.get("email");
            String role = payload.get("role"); // CHEF or WAITER

            if (firstName == null || email == null || role == null) {
                throw new Exception("firstName, email, and role are required");
            }

            StaffAssignment assignment = staffService.createAndAssignStaff(
                    firstName, lastName != null ? lastName : "", email, null, role, cafe, owner);

            return ResponseEntity.ok(Map.of(
                    "message", "Staff member added! Login credentials have been sent to " + email,
                    "assignment", assignment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cafes/{cafeId}/staff/{assignmentId}")
    public ResponseEntity<?> removeStaff(@PathVariable("cafeId") Long cafeId,
            @PathVariable("assignmentId") Long assignmentId,
            Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            StaffAssignment assignment = staffService.getAssignmentById(assignmentId)
                    .orElseThrow(() -> new Exception("Staff assignment not found"));
            staffService.deactivateAssignment(assignment);
            return ResponseEntity.ok(Map.of("message", "Staff member removed from cafe"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Orders ====================

    @GetMapping("/cafes/{cafeId}/orders")
    public ResponseEntity<?> getOrders(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(orderService.getCafeOrders(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/cafes/{cafeId}/orders/pending")
    public ResponseEntity<?> getPendingOrders(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            List<Order> pending = orderService.getCafeOrdersByStatus(cafe, "PLACED");
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/orders/{orderId}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable("cafeId") Long cafeId, @PathVariable("orderId") Long orderId,
            Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            User owner = getOwner(auth);
            Order order = orderService.getOrderById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));
            if (!order.getCafe().getId().equals(cafe.getId())) {
                throw new Exception("Order does not belong to this cafe");
            }
            Order updated = orderService.updateOrderStatus(order, "CONFIRMED", owner, "Confirmed by owner");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/orders/{orderId}/assign")
    public ResponseEntity<?> assignOrderStaff(@PathVariable("cafeId") Long cafeId,
            @PathVariable("orderId") Long orderId,
            @RequestBody Map<String, Long> payload, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            Order order = orderService.getOrderById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));
            if (!order.getCafe().getId().equals(cafe.getId())) {
                throw new Exception("Order does not belong to this cafe");
            }

            Long chefId = payload.get("chefId");
            Long waiterId = payload.get("waiterId");

            if (chefId != null) {
                User chef = userRepository.findById(chefId)
                        .orElseThrow(() -> new Exception("Chef not found"));
                order.setAssignedChef(chef);
            }
            if (waiterId != null) {
                User waiter = userRepository.findById(waiterId)
                        .orElseThrow(() -> new Exception("Waiter not found"));
                order.setAssignedWaiter(waiter);
            }

            User owner = getOwner(auth);
            Order updated = orderService.updateOrderStatus(order, "CONFIRMED", owner, "Staff assigned by owner");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Bookings ====================

    @GetMapping("/cafes/{cafeId}/bookings")
    public ResponseEntity<?> getBookings(@PathVariable("cafeId") Long cafeId, Authentication auth) {
        try {
            Cafe cafe = getOwnedCafe(cafeId, auth);
            return ResponseEntity.ok(bookingService.getCafeBookings(cafe));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cafes/{cafeId}/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable("cafeId") Long cafeId,
            @PathVariable("bookingId") Long bookingId,
            @RequestBody Map<String, String> payload, Authentication auth) {
        try {
            getOwnedCafe(cafeId, auth);
            Booking booking = bookingService.getBookingById(bookingId)
                    .orElseThrow(() -> new Exception("Booking not found"));
            String newStatus = payload.get("status");
            if (newStatus == null)
                throw new Exception("Status is required");
            Booking updated = bookingService.updateBookingStatus(booking, newStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
