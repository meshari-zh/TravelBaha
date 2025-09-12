import {
  users,
  places,
  guides,
  bookings,
  messages,
  reviews,
  type User,
  type UpsertUser,
  type Place,
  type InsertPlace,
  type Guide,
  type InsertGuide,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Places operations
  getAllPlaces(): Promise<Place[]>;
  getPlace(id: string): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: string, updates: Partial<InsertPlace>): Promise<Place>;
  deletePlace(id: string): Promise<void>;
  
  // Guides operations
  getAllGuides(): Promise<Guide[]>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuideByUserId(userId: string): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide>;
  deleteGuide(id: string): Promise<void>;
  
  // Bookings operations
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByTourist(touristId: string): Promise<Booking[]>;
  getBookingsByGuide(guideId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking>;
  
  // Messages operations
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]>;
  
  // Reviews operations
  getReviewsByGuide(guideId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Places operations
  async getAllPlaces(): Promise<Place[]> {
    return await db.select().from(places).orderBy(asc(places.name));
  }

  async getPlace(id: string): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }

  async createPlace(place: InsertPlace): Promise<Place> {
    const [newPlace] = await db.insert(places).values(place).returning();
    return newPlace;
  }

  async updatePlace(id: string, updates: Partial<InsertPlace>): Promise<Place> {
    const [updatedPlace] = await db
      .update(places)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(places.id, id))
      .returning();
    return updatedPlace;
  }

  async deletePlace(id: string): Promise<void> {
    await db.delete(places).where(eq(places.id, id));
  }

  // Guides operations
  async getAllGuides(): Promise<Guide[]> {
    return await db
      .select()
      .from(guides)
      .leftJoin(users, eq(guides.userId, users.id))
      .where(eq(guides.isActive, true))
      .then(rows => 
        rows.map(row => ({
          ...row.guides,
          user: row.users || undefined,
        }))
      );
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    const [result] = await db
      .select()
      .from(guides)
      .leftJoin(users, eq(guides.userId, users.id))
      .where(eq(guides.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.guides,
      user: result.users || undefined,
    };
  }

  async getGuideByUserId(userId: string): Promise<Guide | undefined> {
    const [result] = await db
      .select()
      .from(guides)
      .leftJoin(users, eq(guides.userId, users.id))
      .where(eq(guides.userId, userId));
    
    if (!result) return undefined;
    
    return {
      ...result.guides,
      user: result.users || undefined,
    };
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide).returning();
    return newGuide;
  }

  async updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide> {
    const [updatedGuide] = await db
      .update(guides)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(guides.id, id))
      .returning();
    return updatedGuide;
  }

  async deleteGuide(id: string): Promise<void> {
    await db.update(guides).set({ isActive: false }).where(eq(guides.id, id));
  }

  // Bookings operations
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByTourist(touristId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.touristId, touristId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByGuide(guideId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.guideId, guideId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Messages operations
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt))
      .then(rows =>
        rows.map(row => ({
          ...row.messages,
          sender: row.users || undefined,
        }))
      );
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]> {
    // This is a complex query that would require raw SQL or multiple queries
    // For now, returning empty array - would need to implement properly
    return [];
  }

  // Reviews operations
  async getReviewsByGuide(guideId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.guideId, guideId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
}

export const storage = new DatabaseStorage();
