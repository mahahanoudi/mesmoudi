package com.tetouan.tourism.restaurant.model;

public enum ReservationStatus {
    PENDING, // Reservation created, waiting for confirmation
    CONFIRMED, // Restaurant confirmed the reservation
    CANCELLED, // User or restaurant cancelled
    COMPLETED, // Reservation was fulfilled
    NO_SHOW // User didn't show up
}
