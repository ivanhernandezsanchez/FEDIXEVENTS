-- ============================================================
--  FedixEvents — Esquema actual de la base de datos PostgreSQL
--  Generado: 2026-05-14
-- ============================================================

DROP TABLE IF EXISTS fichajes CASCADE;
DROP TABLE IF EXISTS ai_plan_submissions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS booking_hotels CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- ------------------------------------------------------------
--  CITIES
-- ------------------------------------------------------------
CREATE TABLE cities (
  id       INTEGER PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  region   VARCHAR(100),
  country  VARCHAR(100) DEFAULT 'España'
);

INSERT INTO cities VALUES (1, 'Ibiza',     'Islas Baleares',        'España');
INSERT INTO cities VALUES (2, 'Barcelona', 'Cataluña',              'España');
INSERT INTO cities VALUES (3, 'Madrid',    'Madrid',                'España');
INSERT INTO cities VALUES (4, 'Valencia',  'Comunidad Valenciana',  'España');
INSERT INTO cities VALUES (5, 'Málaga',    'Andalucía',             'España');

-- ------------------------------------------------------------
--  CUSTOMERS
--  Cambios respecto a la versión anterior:
--    + full_name, username, role
-- ------------------------------------------------------------
CREATE TABLE customers (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(200),
  username      VARCHAR(100),
  role          VARCHAR(20)  DEFAULT 'customer',
  is_active     SMALLINT     DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Usuario admin (contraseña: admin1234)
INSERT INTO customers (first_name, last_name, email, phone, password_hash, full_name, username, role)
VALUES ('Admin', 'FedixEvents', 'admin@fedixevents.com', '600000000',
        '$2b$10$examplehashforadmin111111111111111111111111111111111',
        'Admin FedixEvents', 'admin', 'admin');

-- Clientes de ejemplo
INSERT INTO customers (first_name, last_name, email, phone, password_hash, full_name, username, role)
VALUES ('Juan',  'Pérez', 'juan@email.com',  '600111222', '$2b$10$examplehash1', 'Juan Pérez',  'juanperez',  'customer');
INSERT INTO customers (first_name, last_name, email, phone, password_hash, full_name, username, role)
VALUES ('María', 'López', 'maria@email.com', '600222333', '$2b$10$examplehash2', 'María López', 'marialopez', 'customer');
INSERT INTO customers (first_name, last_name, email, phone, password_hash, full_name, username, role)
VALUES ('David', 'Ruiz',  'david@email.com', '600333444', '$2b$10$examplehash3', 'David Ruiz',  'davidruiz',  'customer');

-- ------------------------------------------------------------
--  PROVIDERS
--  Cambios: company_name → name
-- ------------------------------------------------------------
CREATE TABLE providers (
  id           SERIAL PRIMARY KEY,
  tax_id       VARCHAR(20)  UNIQUE,
  name         VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100),
  email        VARCHAR(150),
  phone        VARCHAR(50),
  city_id      INTEGER REFERENCES cities(id)
);

INSERT INTO providers (tax_id, name, city_id) VALUES ('B12345678', 'Ibiza Ocean Events',   1);
INSERT INTO providers (tax_id, name, city_id) VALUES ('B87654321', 'BCN Urban Adventure',  2);
INSERT INTO providers (tax_id, name, city_id) VALUES ('B11223344', 'Madrid Experiences',   3);
INSERT INTO providers (tax_id, name, city_id) VALUES ('B44332211', 'Valencia Fiesta Club',  4);

-- ------------------------------------------------------------
--  ACTIVITIES
--  Cambios: base_price → price (sin CHECK > 0), + duration_minutes
--  Los planes IA tienen provider_id = NULL y price = 0
-- ------------------------------------------------------------
CREATE TABLE activities (
  id               SERIAL PRIMARY KEY,
  provider_id      INTEGER REFERENCES providers(id),
  city_id          INTEGER REFERENCES cities(id),
  name             VARCHAR(150) NOT NULL,
  description      TEXT,
  category         VARCHAR(100),
  price            NUMERIC(10,2),
  duration_minutes INTEGER,
  max_capacity     INTEGER CHECK (max_capacity > 0),
  is_available     SMALLINT DEFAULT 1 CHECK (is_available IN (0,1))
);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (1, 1, 'Catamarán Private Party',
        'Fiesta exclusiva en catamarán con DJ, bebidas ilimitadas y snorkel al atardecer.',
        'Fiesta', 75.50, 180, 30);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (1, 1, 'Ruta en quad por Ibiza',
        'Recorre los rincones más salvajes de la isla en quad todoterreno. Guía incluido.',
        'Aventura', 60.00, 240, 15);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (2, 2, 'Paintball Pro',
        'Partidas de paintball en campo exterior con equipo profesional y árbitro.',
        'Aventura', 35.00, 120, 20);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (2, 2, 'Ruta gastronómica por el Borne',
        'Tour a pie por los mejores bares de tapas y vermuts del barrio del Borne.',
        'Gastro', 45.00, 180, 12);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (3, 3, 'Karting en Madrid',
        'Sesión de karting indoor en circuito homologado. Incluye casco y equipo.',
        'Aventura', 40.00, 60, 25);

INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
VALUES (4, 4, 'Cena con espectáculo flamenco',
        'Cena de menú degustación con espectáculo de flamenco en directo.',
        'Gastro', 85.00, 150, 50);

-- ------------------------------------------------------------
--  HOTELS
-- ------------------------------------------------------------
CREATE TABLE hotels (
  id                   INTEGER PRIMARY KEY,
  city_id              INTEGER REFERENCES cities(id),
  name                 VARCHAR(150) NOT NULL,
  address              VARCHAR(255),
  stars                INTEGER CHECK (stars BETWEEN 1 AND 5),
  base_price_per_night NUMERIC(10,2) CHECK (base_price_per_night > 0)
);

INSERT INTO hotels VALUES (1, 1, 'Ushuaia Style Hotel',   NULL, 5, 150);
INSERT INTO hotels VALUES (2, 2, 'NH Barcelona Center',   NULL, 4, 85);
INSERT INTO hotels VALUES (3, 3, 'Hotel Meliá Madrid',    NULL, 4, 95);
INSERT INTO hotels VALUES (4, 4, 'Vincci Lys Valencia',   NULL, 4, 70);

-- ------------------------------------------------------------
--  GROUPS
--  Cambios: + budget_per_person
-- ------------------------------------------------------------
CREATE TABLE groups (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(200) NOT NULL,
  organizer_id     INTEGER REFERENCES customers(id),
  city_id          INTEGER REFERENCES cities(id),
  event_date       DATE,
  budget_per_person NUMERIC(10,2) DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
VALUES ('Despedida de Soltero de Marcos', 2, 1, '2025-07-15', 200);

INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
VALUES ('Despedida de soltera de Laura', 3, 2, '2025-09-20', 150);

-- ------------------------------------------------------------
--  GROUP_MEMBERS
-- ------------------------------------------------------------
CREATE TABLE group_members (
  id                       SERIAL PRIMARY KEY,
  group_id                 INTEGER REFERENCES groups(id),
  customer_id              INTEGER REFERENCES customers(id),
  role                     VARCHAR(20) DEFAULT 'member' CHECK (role IN ('organizer','member')),
  has_confirmed_attendance SMALLINT DEFAULT 0 CHECK (has_confirmed_attendance IN (0,1))
);

-- ------------------------------------------------------------
--  BOOKINGS
--  Cambios: total_amount → total_price
-- ------------------------------------------------------------
CREATE TABLE bookings (
  id             SERIAL PRIMARY KEY,
  group_id       INTEGER REFERENCES groups(id),
  reference_code VARCHAR(50) NOT NULL UNIQUE,
  status         VARCHAR(30) DEFAULT 'pending' CHECK (
                   status IN ('pending','confirmed','partially_paid','paid','cancelled','completed')
                 ),
  total_price    NUMERIC(10,2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bookings (group_id, reference_code, status, total_price)
VALUES (1, 'FDX-EJEMPLO-001', 'pending', 450);

-- ------------------------------------------------------------
--  BOOKING_ITEMS
--  Cambios: num_people → quantity, snapshot_price → unit_price
-- ------------------------------------------------------------
CREATE TABLE booking_items (
  id             SERIAL PRIMARY KEY,
  booking_id     INTEGER REFERENCES bookings(id),
  activity_id    INTEGER REFERENCES activities(id),
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2),
  scheduled_time TIMESTAMP
);

INSERT INTO booking_items (booking_id, activity_id, quantity, unit_price)
VALUES (1, 3, 10, 35.00);

-- ------------------------------------------------------------
--  BOOKING_HOTELS
-- ------------------------------------------------------------
CREATE TABLE booking_hotels (
  id                   SERIAL PRIMARY KEY,
  booking_id           INTEGER REFERENCES bookings(id),
  hotel_id             INTEGER REFERENCES hotels(id),
  check_in             DATE,
  check_out            DATE,
  num_rooms            INTEGER DEFAULT 1 CHECK (num_rooms > 0),
  snapshot_price_night NUMERIC(10,2)
);

INSERT INTO booking_hotels (booking_id, hotel_id, check_in, check_out, num_rooms, snapshot_price_night)
VALUES (1, 2, '2025-09-20', '2025-09-22', 1, 85.00);

-- ------------------------------------------------------------
--  PAYMENTS
-- ------------------------------------------------------------
CREATE TABLE payments (
  id             SERIAL PRIMARY KEY,
  booking_id     INTEGER REFERENCES bookings(id),
  customer_id    INTEGER REFERENCES customers(id),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50),
  payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  PAYMENT_TRANSACTIONS
-- ------------------------------------------------------------
CREATE TABLE payment_transactions (
  id              SERIAL PRIMARY KEY,
  payment_id      INTEGER UNIQUE REFERENCES payments(id),
  gateway         VARCHAR(50),
  transaction_ref VARCHAR(100) NOT NULL UNIQUE,
  status          VARCHAR(30),
  processed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  REVIEWS
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id),
  customer_id INTEGER REFERENCES customers(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reviews (activity_id, customer_id, rating, comment)
VALUES (1, 2, 5, 'Increíble experiencia, lo recomendaría a cualquier grupo.');
INSERT INTO reviews (activity_id, customer_id, rating, comment)
VALUES (3, 3, 4, 'Muy divertido, las instalaciones están bien cuidadas.');

-- ------------------------------------------------------------
--  AI_PLAN_SUBMISSIONS
--  Nueva tabla: propuestas de planes generadas por el chat IA
--  Status: pending → admin aprueba → activity creada → catálogo
-- ------------------------------------------------------------
CREATE TABLE ai_plan_submissions (
  id                  SERIAL PRIMARY KEY,
  suggested_name      VARCHAR(150) NOT NULL,
  city_id             INTEGER REFERENCES cities(id),
  description         TEXT NOT NULL,
  category            VARCHAR(100) DEFAULT 'Plan personalizado IA',
  suggested_price     NUMERIC(10,2) DEFAULT 0,
  max_capacity        INTEGER,
  duration_minutes    INTEGER,
  status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_activity_id INTEGER REFERENCES activities(id),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at         TIMESTAMP
);

-- ------------------------------------------------------------
--  FICHAJES
--  Nueva tabla: control de entrada/salida del equipo
-- ------------------------------------------------------------
CREATE TABLE fichajes (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  tipo        VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
