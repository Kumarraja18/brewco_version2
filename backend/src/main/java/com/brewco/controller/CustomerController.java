package com.brewco.controller;

import com.brewco.entity.Booking;
import com.brewco.entity.Order;
import com.brewco.entity.OrderItem;
import com.brewco.entity.User;
import com.brewco.entity.Cafe;
import com.brewco.entity.MenuItem;
import com.brewco.entity.CafeTable;
import com.brewco.repository.UserRepository;
import com.brewco.service.BookingService;
import com.brewco.service.CafeService;
import com.brewco.service.MenuService;
import com.brewco.service.OrderService;
import com.brewco.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CafeService cafeService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private TableService tableService;

    // ==================== Bookings ====================

    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(Authentication authentication) {
        User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<Booking> bookings = bookingService.getCustomerBookings(customer);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();

            Long cafeId = Long.valueOf(payload.get("cafeId").toString());
            Cafe cafe = cafeService.getCafeById(cafeId)
                    .orElseThrow(() -> new Exception("Cafe not found"));

            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setCafe(cafe);
            booking.setBookingDate(java.time.LocalDate.parse(payload.get("bookingDate").toString()));
            booking.setStartTime(java.time.LocalTime.parse(payload.get("startTime").toString()));
            booking.setNumberOfGuests(Integer.parseInt(payload.get("numberOfGuests").toString()));

            if (payload.get("specialRequests") != null) {
                booking.setSpecialRequests(payload.get("specialRequests").toString());
            }

            if (payload.get("tableId") != null) {
                Long tableId = Long.valueOf(payload.get("tableId").toString());
                CafeTable table = tableService.getTableById(tableId)
                        .orElseThrow(() -> new Exception("Table not found"));
                booking.setTable(table);
            }

            Booking saved = bookingService.makeBooking(booking);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Orders ====================

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<Order> orders = orderService.getCustomerOrders(customer);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
            Order order = orderService.getOrderById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));
            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to view this order"));
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();

            Long cafeId = Long.valueOf(payload.get("cafeId").toString());
            String orderType = (String) payload.get("orderType");
            Long tableId = payload.get("tableId") != null ? Long.valueOf(payload.get("tableId").toString()) : null;
            String specialInstructions = (String) payload.get("specialInstructions");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsPayload = (List<Map<String, Object>>) payload.get("items");

            if (cafeId == null || orderType == null || itemsPayload == null || itemsPayload.isEmpty()) {
                throw new Exception("cafeId, orderType, and items are required");
            }

            Cafe cafe = cafeService.getCafeById(cafeId)
                    .orElseThrow(() -> new Exception("Cafe not found"));

            Order order = new Order();
            order.setCustomer(customer);
            order.setCafe(cafe);
            order.setOrderType(orderType.toUpperCase());
            order.setSpecialInstructions(specialInstructions);
            order.setPaymentStatus("PENDING");
            order.setTaxAmount(BigDecimal.ZERO);
            order.setDiscountAmount(BigDecimal.ZERO);

            if ("DINE_IN".equals(orderType.toUpperCase()) && tableId != null) {
                CafeTable table = tableService.getTableById(tableId)
                        .orElseThrow(() -> new Exception("Table not found"));
                order.setTable(table);
            }

            List<OrderItem> orderItems = new ArrayList<>();
            for (Map<String, Object> itemData : itemsPayload) {
                Long menuItemId = Long.valueOf(itemData.get("menuItemId").toString());
                int quantity = Integer.parseInt(itemData.get("quantity").toString());
                String notes = (String) itemData.get("notes");

                MenuItem menuItem = menuService.getItemById(menuItemId)
                        .orElseThrow(() -> new Exception("Menu item " + menuItemId + " not found"));

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(quantity);
                orderItem.setUnitPrice(menuItem.getPrice());
                orderItem.setNotes(notes);
                orderItems.add(orderItem);
            }

            Order savedOrder = orderService.placeOrder(order, orderItems, customer);
            return ResponseEntity.ok(Map.of("message", "Order placed successfully", "order", savedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
            Order order = orderService.getOrderById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));
            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to cancel this order"));
            }
            if (!"PLACED".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
                throw new Exception("Cannot cancel an order that is already " + order.getStatus());
            }
            Order updated = orderService.updateOrderStatus(order, "CANCELLED", customer, "Cancelled by customer");
            return ResponseEntity.ok(Map.of("message", "Order cancelled", "order", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
