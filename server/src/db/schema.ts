import { mysqlTable, serial, varchar, text, timestamp, decimal, int, bigint, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  // Delivery information fields
  fullName: varchar('full_name', { length: 200 }),
  phone: varchar('phone', { length: 20 }),
  streetAddress: varchar('street_address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  isFirstPurchase: boolean('is_first_purchase').default(true),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Categories table
export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Products table
export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  categoryId: bigint('category_id', { mode: 'bigint', unsigned: true }).references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Orders table
export const orders = mysqlTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: bigint('user_id', { mode: 'bigint', unsigned: true }).references(() => users.id),
  
  // Contact information
  contactName: varchar('contact_name', { length: 200 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 20 }).notNull(),
  
  // Delivery address
  streetAddress: varchar('street_address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  
  // Delivery and payment
  deliveryMethod: varchar('delivery_method', { length: 50 }).notNull(),
  deliveryCost: decimal('delivery_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  
  // Totals
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Order items table
export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: bigint('order_id', { mode: 'bigint', unsigned: true }).references(() => orders.id),
  productId: bigint('product_id', { mode: 'bigint', unsigned: true }).references(() => products.id),
  quantity: int('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));