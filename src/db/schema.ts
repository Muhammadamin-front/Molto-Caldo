import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ---------------------------------------------------------------- enums */

export const orderStatus = pgEnum("order_status", [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const paymentMethod = pgEnum("payment_method", [
  "click",
  "payme",
  "cash",
]);

/* ----------------------------------------------------------- categories */

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    nameUz: text("name_uz").notNull(),
    nameRu: text("name_ru").notNull(),
    nameEn: text("name_en").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------- products */

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    nameUz: text("name_uz").notNull(),
    nameRu: text("name_ru").notNull(),
    nameEn: text("name_en").notNull(),

    descriptionUz: text("description_uz").notNull().default(""),
    descriptionRu: text("description_ru").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),

    materialUz: text("material_uz").notNull().default(""),
    materialRu: text("material_ru").notNull().default(""),
    materialEn: text("material_en").notNull().default(""),

    // Prices are stored in tiyin (1 so'm = 100 tiyin) to avoid float rounding.
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),

    images: jsonb("images").$type<string[]>().notNull().default([]),

    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
  ],
);

/* ------------------------------------------------------------- variants */

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex").notNull(),
    sku: text("sku").notNull(),
    stock: integer("stock").notNull().default(0),
  },
  (t) => [
    uniqueIndex("variants_sku_idx").on(t.sku),
    index("variants_product_idx").on(t.productId),
  ],
);

/* --------------------------------------------------------------- orders */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: text("order_number").notNull(),

    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    address: text("address").notNull(),
    note: text("note").notNull().default(""),

    // Totals in tiyin, captured at order time so later price edits don't
    // rewrite history.
    subtotal: integer("subtotal").notNull(),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    total: integer("total").notNull(),

    status: orderStatus("status").notNull().default("new"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    paymentRef: text("payment_ref"),

    locale: text("locale").notNull().default("uz"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    // Denormalised on purpose: an order line must stay readable even if the
    // product is renamed or deleted later.
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    size: text("size").notNull(),
    colorName: text("color_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/* ---------------------------------------------------------- admin users */

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("admin_email_idx").on(t.email)],
);

/* ------------------------------------------------------------ relations */

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
