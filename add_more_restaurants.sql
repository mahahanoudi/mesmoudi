-- Script d'ajout de restaurants supplémentaires à Tétouan
-- Exécutez ce script après avoir lancé l'application une première fois

USE tetouan_tourism_restaurant;

-- Restaurant 4: Restinga
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Restinga', 
        'Restaurant de fruits de mer avec une vue magnifique sur la méditerranée. Spécialités de poissons frais du jour.',
        'Marina Smir, Tétouan',
        '+212 539 97 12 34',
        '/images/restaurants/blanco_riad.png',
        35.6897,
        -5.3547);

-- Restaurant 5: Riad El Reducto (Déjà existant en base probablement, mais on l'ajoute si absent)
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Riad El Reducto Annexe',
        'Restaurant gastronomique dans un riad traditionnel, fusion entre cuisine marocaine et méditerranéenne.',
        '38 Rue Zawiya, Médina de Tétouan',
        '+212 539 96 81 20',
        '/images/restaurants/el_reducto.png',
        35.5720,
        -5.3670);

-- Restaurant 6: Café Restaurant Ensemble
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Café Restaurant Ensemble',
        'Ambiance chaleureuse et familiale. Cuisine marocaine authentique avec tajines et couscous traditionnels.',
        'Avenue Mohammed V, Tétouan',
        '+212 661 45 67 89',
        '/images/restaurants/la_union.png',
        35.5689,
        -5.3625);

-- Restaurant 7: Le Kabila
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Le Kabila',
        'Restaurant moderne proposant une cuisine internationale et marocaine. Parfait pour les occasions spéciales.',
        'Boulevard Mohamed VI, Tétouan',
        '+212 539 70 23 45',
        '/images/restaurants/blanco_riad.png',
        35.5745,
        -5.3588);

-- Restaurant 8: Dar Maryam
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Dar Maryam',
        'Petit restaurant familial au cœur de la médina. Plats faits maison avec des recettes ancestrales.',
        'Rue Al Jazira, Médina',
        '+212 662 34 56 78',
        '/images/restaurants/el_reducto.png',
        35.5715,
        -5.3665);

-- Restaurant 9: Le Pirate
INSERT INTO restaurant (nom, description, adresse, telephone, image_url, latitude, longitude)
VALUES ('Le Pirate',
        'Restaurant de fruits de mer situé en bord de mer. Ambiance décontractée et produits ultra-frais.',
        'Corniche de Martil, Tétouan',
        '+212 539 68 90 12',
        '/images/restaurants/la_union.png',
        35.6175,
        -5.2745);

-- Ajout de quelques plats pour ces restaurants

-- Plats pour Restinga
INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Friture de Poisson', 'Assortiment de petits poissons frits croustillants', 75.0, 
        (SELECT id FROM restaurant WHERE nom = 'Restinga'));

INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Paella Marroquina', 'Riz aux fruits de mer fraîchement pêchés', 120.0,
        (SELECT id FROM restaurant WHERE nom = 'Restinga'));

-- Plats pour Café Restaurant Ensemble
INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Couscous Royal', 'Couscous traditionnel avec sept légumes et viandes', 95.0,
        (SELECT id FROM restaurant WHERE nom = 'Café Restaurant Ensemble'));

INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Tajine aux Pruneaux', 'Agneau mijoté avec pruneaux et amandes', 85.0,
        (SELECT id FROM restaurant WHERE nom = 'Café Restaurant Ensemble'));

-- Plats pour Le Kabila
INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Brochettes Mixtes', 'Assortiment de viandes grillées avec légumes', 90.0,
        (SELECT id FROM restaurant WHERE nom = 'Le Kabila'));

-- Plats pour Dar Maryam
INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Rfissa Tétouanaise', 'Plat traditionnel de Tétouan avec msemmen et poulet', 70.0,
        (SELECT id FROM restaurant WHERE nom = 'Dar Maryam'));

INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Bissara Maison', 'Soupe de fèves traditionnelle servie avec pain et huile d''olive', 25.0,
        (SELECT id FROM restaurant WHERE nom = 'Dar Maryam'));

-- Plats pour Le Pirate
INSERT INTO menu (nom_plat, description, prix, restaurant_id)
VALUES ('Dorade Grillée', 'Dorade entière grillée avec légumes de saison', 110.0,
        (SELECT id FROM restaurant WHERE nom = 'Le Pirate'));

SELECT 'Restaurants supplémentaires ajoutés avec succès!' as message;
