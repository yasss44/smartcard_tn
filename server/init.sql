-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    background VARCHAR(255),
    contact_info JSON,
    social_links JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    card_id CHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSON NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_card_id ON orders(card_id);

-- Trigger for UUID generation on users table
DELIMITER //
CREATE TRIGGER before_insert_users
    BEFORE INSERT ON users
    FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END//

-- Trigger for UUID generation on cards table
CREATE TRIGGER before_insert_cards
    BEFORE INSERT ON cards
    FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END//

-- Trigger for UUID generation on orders table
CREATE TRIGGER before_insert_orders
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END//
DELIMITER ;