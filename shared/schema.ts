import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["tourist", "guide", "admin"] }).notNull().default("tourist"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const places = pgTable("places", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url"),
  location: text("location"),
  locationEn: text("location_en"),
  category: varchar("category"),
  categoryEn: varchar("category_en"),
  websiteUrl: text("website_url"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name"),
  nameEn: text("name_en"),
  bio: text("bio"),
  bioEn: text("bio_en"),
  specialties: text("specialties").array(),
  languages: text("languages").array(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  touristId: varchar("tourist_id").notNull().references(() => users.id),
  guideId: varchar("guide_id").notNull().references(() => guides.id),
  placeId: varchar("place_id").references(() => places.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  timeSlot: text("time_slot").default("morning"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { enum: ["cash", "bank_transfer"] }).default("cash"),
  status: varchar("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  touristId: varchar("tourist_id").notNull().references(() => users.id),
  guideId: varchar("guide_id").notNull().references(() => guides.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invites = pgTable("invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  role: varchar("role", { enum: ["guide", "admin"] }).notNull(),
  isUsed: boolean("is_used").default(false),
  usedBy: varchar("used_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull(),
  sectionKey: varchar("section_key", { length: 100 }),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  content: text("content").notNull(),
  contentEn: text("content_en"),
  imageUrl: text("image_url"),
  buttonLink: text("button_link"),
  buttonText: text("button_text"),
  buttonTextEn: text("button_text_en"),
  position: varchar("position", { enum: ["grid", "bottom"] }).default("grid"),
  orderIndex: integer("order_index").default(0),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  role: text("role").notNull(),
  roleEn: text("role_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quickQuestions = pgTable("quick_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  questionEn: text("question_en"),
  askerName: text("asker_name"),
  askerEmail: text("asker_email"),
  userId: varchar("user_id").references(() => users.id),
  answer: text("answer"),
  answerEn: text("answer_en"),
  answeredBy: varchar("answered_by").references(() => users.id),
  isAnswered: boolean("is_answered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
});

export const navigationItems = pgTable("navigation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en").notNull(),
  path: text("path"),
  externalUrl: text("external_url"),
  icon: text("icon"),
  type: varchar("type", { enum: ["link", "dropdown"] }).notNull().default("link"),
  parentId: varchar("parent_id"),
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const navigationItemsRelations = relations(navigationItems, ({ one, many }) => ({
  parent: one(navigationItems, {
    fields: [navigationItems.parentId],
    references: [navigationItems.id],
    relationName: "parentChild",
  }),
  children: many(navigationItems, { relationName: "parentChild" }),
}));

export const dynamicPages = pgTable("dynamic_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  isPublished: boolean("is_published").default(true),
  navigationItemId: varchar("navigation_item_id").references(() => navigationItems.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dynamicPagesRelations = relations(dynamicPages, ({ one }) => ({
  navigationItem: one(navigationItems, {
    fields: [dynamicPages.navigationItemId],
    references: [navigationItems.id],
  }),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  guide: one(guides, {
    fields: [users.id],
    references: [guides.userId],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  bookingsAsTourist: many(bookings, { relationName: "tourist" }),
  reviews: many(reviews),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
  user: one(users, {
    fields: [guides.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const placesRelations = relations(places, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  tourist: one(users, {
    fields: [bookings.touristId],
    references: [users.id],
    relationName: "tourist",
  }),
  guide: one(guides, {
    fields: [bookings.guideId],
    references: [guides.id],
  }),
  place: one(places, {
    fields: [bookings.placeId],
    references: [places.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  tourist: one(users, {
    fields: [reviews.touristId],
    references: [users.id],
  }),
  guide: one(guides, {
    fields: [reviews.guideId],
    references: [guides.id],
  }),
}));

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPlaceSchema = createInsertSchema(places).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGuideSchema = createInsertSchema(guides).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertInviteSchema = createInsertSchema(invites).omit({ id: true, createdAt: true, usedAt: true });
export const insertSiteContentSchema = createInsertSchema(siteContent).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuickQuestionSchema = createInsertSchema(quickQuestions).omit({ id: true, createdAt: true, answeredAt: true });
export const insertNavigationItemSchema = createInsertSchema(navigationItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDynamicPageSchema = createInsertSchema(dynamicPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect & { user?: User };
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect & { sender?: User; receiver?: User };
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type Invite = typeof invites.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertQuickQuestion = z.infer<typeof insertQuickQuestionSchema>;
export type QuickQuestion = typeof quickQuestions.$inferSelect;
export type InsertNavigationItem = z.infer<typeof insertNavigationItemSchema>;
export type NavigationItem = typeof navigationItems.$inferSelect;
export type InsertDynamicPage = z.infer<typeof insertDynamicPageSchema>;
export type DynamicPage = typeof dynamicPages.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
