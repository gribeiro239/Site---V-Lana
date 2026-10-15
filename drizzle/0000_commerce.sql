CREATE TABLE variants (
 product_id INTEGER NOT NULL CHECK(product_id BETWEEN 0 AND 5),
 size TEXT NOT NULL CHECK(size IN ('P','M','G','GG')),
 stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
 PRIMARY KEY(product_id,size)
);
--> statement-breakpoint
CREATE TABLE orders (
 id TEXT PRIMARY KEY,
 token_hash TEXT NOT NULL,
 request_key TEXT NOT NULL UNIQUE,
 customer_name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT NOT NULL,
 fulfillment TEXT NOT NULL CHECK(fulfillment IN ('pickup','delivery')),
 address_json TEXT,
 subtotal_cents INTEGER NOT NULL CHECK(subtotal_cents > 0),
 shipping_cents INTEGER CHECK(shipping_cents >= 0),
 status TEXT NOT NULL DEFAULT 'awaiting_confirmation' CHECK(status IN ('awaiting_confirmation','awaiting_payment','payment_started','paid','ready','completed','cancelled','payment_review','refunded','charged_back')),
 payment_id TEXT,
 preference_id TEXT,
 checkout_url TEXT,
 payment_updated TEXT,
 note TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE order_items (
 order_id TEXT NOT NULL REFERENCES orders(id),
 product_id INTEGER NOT NULL,
 size TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10),
 unit_cents INTEGER NOT NULL CHECK(unit_cents > 0),
 PRIMARY KEY(order_id,product_id,size),
 FOREIGN KEY(product_id,size) REFERENCES variants(product_id,size)
);
--> statement-breakpoint
CREATE TRIGGER reserve_stock BEFORE INSERT ON order_items BEGIN
 SELECT CASE WHEN COALESCE((SELECT stock FROM variants WHERE product_id=NEW.product_id AND size=NEW.size),0)<NEW.quantity THEN RAISE(ABORT,'insufficient_stock') END;
 UPDATE variants SET stock=stock-NEW.quantity WHERE product_id=NEW.product_id AND size=NEW.size;
END;
--> statement-breakpoint
CREATE TRIGGER release_cancelled_stock AFTER UPDATE OF status ON orders WHEN NEW.status='cancelled' AND OLD.status IN ('awaiting_confirmation','awaiting_payment') AND OLD.preference_id IS NULL BEGIN
 UPDATE variants SET stock=stock+COALESCE((SELECT quantity FROM order_items WHERE order_id=NEW.id AND product_id=variants.product_id AND size=variants.size),0) WHERE EXISTS (SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=variants.product_id AND size=variants.size);
END;
--> statement-breakpoint
CREATE INDEX orders_created_idx ON orders(created_at);
