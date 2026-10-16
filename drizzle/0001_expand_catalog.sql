DROP TRIGGER reserve_stock;
--> statement-breakpoint
DROP TRIGGER release_cancelled_stock;
--> statement-breakpoint
CREATE TABLE variants_expanded (
 product_id INTEGER NOT NULL CHECK(product_id >= 0),
 size TEXT NOT NULL CHECK(size IN ('P','M','G','GG')),
 stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
 PRIMARY KEY(product_id,size)
);
--> statement-breakpoint
INSERT INTO variants_expanded SELECT product_id,size,stock FROM variants;
--> statement-breakpoint
CREATE TABLE order_items_expanded (
 order_id TEXT NOT NULL REFERENCES orders(id),
 product_id INTEGER NOT NULL,
 size TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10),
 unit_cents INTEGER NOT NULL CHECK(unit_cents > 0),
 PRIMARY KEY(order_id,product_id,size),
 FOREIGN KEY(product_id,size) REFERENCES variants_expanded(product_id,size)
);
--> statement-breakpoint
INSERT INTO order_items_expanded SELECT order_id,product_id,size,quantity,unit_cents FROM order_items;
--> statement-breakpoint
DROP TABLE order_items;
--> statement-breakpoint
DROP TABLE variants;
--> statement-breakpoint
ALTER TABLE variants_expanded RENAME TO variants;
--> statement-breakpoint
ALTER TABLE order_items_expanded RENAME TO order_items;
--> statement-breakpoint
CREATE TRIGGER reserve_stock BEFORE INSERT ON order_items BEGIN
 SELECT CASE WHEN COALESCE((SELECT stock FROM variants WHERE product_id=NEW.product_id AND size=NEW.size),0)<NEW.quantity THEN RAISE(ABORT,'insufficient_stock') END;
 UPDATE variants SET stock=stock-NEW.quantity WHERE product_id=NEW.product_id AND size=NEW.size;
END;
--> statement-breakpoint
CREATE TRIGGER release_cancelled_stock AFTER UPDATE OF status ON orders WHEN NEW.status='cancelled' AND OLD.status IN ('awaiting_confirmation','awaiting_payment') AND OLD.preference_id IS NULL BEGIN
 UPDATE variants SET stock=stock+COALESCE((SELECT quantity FROM order_items WHERE order_id=NEW.id AND product_id=variants.product_id AND size=variants.size),0) WHERE EXISTS (SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=variants.product_id AND size=variants.size);
END;
