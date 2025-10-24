ALTER TABLE `orders` ADD `order_number` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `contact_name` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `contact_email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `contact_phone` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `street_address` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `city` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `postal_code` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `country` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_method` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_cost` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `subtotal` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `image_url` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `is_admin` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`);