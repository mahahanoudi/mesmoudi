-- Données de fallback pour Tétouan Smart City
-- Ces données seront utilisées si AviationStack n'est pas disponible

INSERT IGNORE INTO flights (
    id, flight_number, airline, departure_city, departure_airport,
    departure_code, departure_time, arrival_city, arrival_airport,
    arrival_code, arrival_time, price, currency, available_seats,
    status, duration, aircraft_type, data_source, last_updated
) VALUES
-- Vols depuis Paris
('fallback-001', 'AT800', 'Royal Air Maroc', 'Paris', 'Charles de Gaulle',
 'CDG', DATE_ADD(NOW(), INTERVAL 1 DAY), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 1 DAY + INTERVAL 3 HOUR), 1250.00, 'MAD', 42,
 'SCHEDULED', 180, 'B737-800', 'FALLBACK', NOW()),

('fallback-002', 'AF456', 'Air France', 'Paris', 'Charles de Gaulle',
 'CDG', DATE_ADD(NOW(), INTERVAL 2 DAY), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 2 DAY + INTERVAL 3 HOUR 30 MINUTE), 1350.00, 'MAD', 35,
 'SCHEDULED', 210, 'A320', 'FALLBACK', NOW()),

-- Vols depuis Casablanca
('fallback-003', 'AT201', 'Royal Air Maroc', 'Casablanca', 'Mohammed V',
 'CMN', DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 3 HOUR 45 MINUTE), 480.00, 'MAD', 58,
 'SCHEDULED', 45, 'ATR 72', 'FALLBACK', NOW()),

('fallback-004', '3O220', 'Air Arabia Maroc', 'Casablanca', 'Mohammed V',
 'CMN', DATE_ADD(NOW(), INTERVAL 6 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 6 HOUR 50 MINUTE), 420.00, 'MAD', 40,
 'SCHEDULED', 50, 'A320', 'FALLBACK', NOW()),

-- Vols depuis Madrid
('fallback-005', 'IB3450', 'Iberia', 'Madrid', 'Adolfo Suárez',
 'MAD', DATE_ADD(NOW(), INTERVAL 1 DAY + INTERVAL 2 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 1 DAY + INTERVAL 3 HOUR 15 MINUTE), 890.00, 'MAD', 28,
 'SCHEDULED', 75, 'A320', 'FALLBACK', NOW()),

('fallback-006', 'FR1234', 'Ryanair', 'Madrid', 'Adolfo Suárez',
 'MAD', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 3 DAY + INTERVAL 1 HOUR 30 MINUTE), 650.00, 'MAD', 18,
 'SCHEDULED', 90, 'B737-800', 'FALLBACK', NOW()),

-- Vols depuis Barcelone
('fallback-007', 'VY5678', 'Vueling', 'Barcelone', 'El Prat',
 'BCN', DATE_ADD(NOW(), INTERVAL 4 DAY), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 4 DAY + INTERVAL 1 HOUR 45 MINUTE), 920.00, 'MAD', 32,
 'SCHEDULED', 105, 'A320', 'FALLBACK', NOW()),

-- Vols depuis Lisbonne
('fallback-008', 'TP789', 'TAP Air Portugal', 'Lisbonne', 'Humberto Delgado',
 'LIS', DATE_ADD(NOW(), INTERVAL 2 DAY + INTERVAL 5 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 2 DAY + INTERVAL 6 HOUR 20 MINUTE), 820.00, 'MAD', 45,
 'SCHEDULED', 80, 'A321', 'FALLBACK', NOW()),

-- Vols depuis Rabat
('fallback-009', 'AT150', 'Royal Air Maroc', 'Rabat', 'Rabat-Salé',
 'RBA', DATE_ADD(NOW(), INTERVAL 8 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 8 HOUR 40 MINUTE), 410.00, 'MAD', 52,
 'SCHEDULED', 40, 'ATR 72', 'FALLBACK', NOW()),

-- Vols depuis Tanger
('fallback-010', 'AT100', 'Royal Air Maroc', 'Tanger', 'Ibn Batouta',
 'TNG', DATE_ADD(NOW(), INTERVAL 12 HOUR), 'Tétouan', 'Aéroport Sania Ramel',
 'TTU', DATE_ADD(NOW(), INTERVAL 12 HOUR 30 MINUTE), 320.00, 'MAD', 60,
 'SCHEDULED', 30, 'ATR 42', 'FALLBACK', NOW());