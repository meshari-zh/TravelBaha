import {
  users,
  places,
  guides,
  bookings,
  messages,
  reviews,
  invites,
  siteContent,
  teamMembers,
  quickQuestions,
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
  type Invite,
  type InsertInvite,
  type SiteContent,
  type InsertSiteContent,
  type TeamMember,
  type InsertTeamMember,
  type QuickQuestion,
  type InsertQuickQuestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
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
  getBookingsByGuide(guideId: string): Promise<(Booking & { tourist?: User })[]>;
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
  
  // Invites operations
  getAllInvites(): Promise<Invite[]>;
  getInvite(code: string): Promise<Invite | undefined>;
  createInvite(invite: InsertInvite): Promise<Invite>;
  useInvite(code: string, userId: string): Promise<Invite>;
  deleteInvite(id: string): Promise<void>;
  
  // User role operations
  updateUserRole(userId: string, role: "tourist" | "guide" | "admin"): Promise<User>;
  updateUserProfile(userId: string, profileData: { firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User>;
  
  // Site content operations
  getAllSiteContent(): Promise<SiteContent[]>;
  getSiteContent(key: string): Promise<SiteContent | undefined>;
  createOrUpdateSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  
  // Team members operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<void>;
  
  // Quick questions operations
  getAllQuickQuestions(): Promise<QuickQuestion[]>;
  getUnansweredQuickQuestions(): Promise<QuickQuestion[]>;
  getAnsweredQuickQuestions(): Promise<QuickQuestion[]>;
  createQuickQuestion(question: InsertQuickQuestion): Promise<QuickQuestion>;
  answerQuickQuestion(id: string, answer: string, answerEn: string | null, answeredBy: string): Promise<QuickQuestion>;
  updateQuickQuestionTranslation(id: string, questionEn: string): Promise<QuickQuestion>;
  updateQuickQuestion(id: string, updates: { question?: string; questionEn?: string; answer?: string; answerEn?: string }): Promise<QuickQuestion>;
  deleteQuickQuestion(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName), asc(users.lastName));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // If email is provided, check if a user with this email already exists
    if (userData.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingUser) {
        // User with this email exists, update only safe fields (never the ID)
        const safeUpdates = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          updatedAt: new Date(),
        };
        
        const [updatedUser] = await db
          .update(users)
          .set(safeUpdates)
          .where(eq(users.email, userData.email))
          .returning();
        return updatedUser;
      }
    }
    
    // No existing user found, try to insert new user
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            // Only update safe fields, never the primary key
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            role: userData.role,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error: any) {
      // This should not happen due to our pre-check, but handle gracefully
      console.error('Unexpected error in upsertUser:', error);
      throw new Error('Failed to create or update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    // Use transaction to ensure data integrity
    await db.transaction(async (tx) => {
      // First check if user exists
      const [targetUser] = await tx.select().from(users).where(eq(users.id, id));
      if (!targetUser) {
        throw new Error("User not found");
      }

      // Find guide profile if user is a guide
      const [guideProfile] = await tx.select().from(guides).where(eq(guides.userId, id));
      
      // Delete reviews first (depend on bookings)
      // Delete reviews by user (as tourist)
      await tx.delete(reviews).where(eq(reviews.touristId, id));
      
      // If user is a guide, delete reviews for their guide profile
      if (guideProfile) {
        await tx.delete(reviews).where(eq(reviews.guideId, guideProfile.id));
      }
      
      // Now delete bookings (after reviews are deleted)
      // Delete bookings where user is tourist
      await tx.delete(bookings).where(eq(bookings.touristId, id));
      
      // If user is a guide, delete bookings for their guide profile
      if (guideProfile) {
        await tx.delete(bookings).where(eq(bookings.guideId, guideProfile.id));
      }
      
      // Delete messages sent or received by user
      await tx.delete(messages).where(
        or(
          eq(messages.senderId, id),
          eq(messages.receiverId, id)
        )
      );
      
      // Delete invites used by user
      await tx.delete(invites).where(eq(invites.usedBy, id));
      
      // Update site content to remove reference to this user
      await tx.update(siteContent)
        .set({ updatedBy: null })
        .where(eq(siteContent.updatedBy, id));
      
      // Delete guide profile if exists
      if (guideProfile) {
        await tx.delete(guides).where(eq(guides.id, guideProfile.id));
      }
      
      // Finally delete the user
      await tx.delete(users).where(eq(users.id, id));
    });
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

  async getBookingsByGuide(guideId: string): Promise<(Booking & { tourist?: User })[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(users, eq(bookings.touristId, users.id))
      .where(eq(bookings.guideId, guideId))
      .orderBy(desc(bookings.createdAt));
    
    return results.map(row => ({
      ...row.bookings,
      tourist: row.users || undefined,
    }));
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

  // Invites operations
  async getAllInvites(): Promise<Invite[]> {
    return await db.select().from(invites).orderBy(desc(invites.createdAt));
  }

  async getInvite(code: string): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.code, code));
    return invite;
  }

  async createInvite(invite: InsertInvite): Promise<Invite> {
    const [newInvite] = await db.insert(invites).values(invite).returning();
    return newInvite;
  }

  async useInvite(code: string, userId: string): Promise<Invite> {
    const [updatedInvite] = await db
      .update(invites)
      .set({ 
        isUsed: true, 
        usedBy: userId, 
        usedAt: new Date() 
      })
      .where(eq(invites.code, code))
      .returning();
    return updatedInvite;
  }

  async deleteInvite(id: string): Promise<void> {
    await db.delete(invites).where(eq(invites.id, id));
  }

  // User role operations
  async updateUserRole(userId: string, role: "tourist" | "guide" | "admin"): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // User profile operations
  async updateUserProfile(userId: string, profileData: { firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User> {
    const updateData: any = { updatedAt: new Date() };
    
    if (profileData.firstName !== undefined) {
      updateData.firstName = profileData.firstName;
    }
    if (profileData.lastName !== undefined) {
      updateData.lastName = profileData.lastName;
    }
    if (profileData.profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileData.profileImageUrl;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Site content operations
  async getAllSiteContent(): Promise<SiteContent[]> {
    return await db.select().from(siteContent).orderBy(asc(siteContent.key));
  }

  async getSiteContent(key: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    return content;
  }

  async createOrUpdateSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const [result] = await db
      .insert(siteContent)
      .values({ ...content, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: {
          title: content.title,
          titleEn: content.titleEn,
          content: content.content,
          contentEn: content.contentEn,
          updatedBy: content.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Team members operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.orderIndex), asc(teamMembers.name));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [result] = await db
      .insert(teamMembers)
      .values({ ...member, updatedAt: new Date() })
      .returning();
    return result;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [result] = await db
      .update(teamMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return result;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // Quick questions operations
  async getAllQuickQuestions(): Promise<QuickQuestion[]> {
    return await db.select().from(quickQuestions).orderBy(desc(quickQuestions.createdAt));
  }

  async getUnansweredQuickQuestions(): Promise<QuickQuestion[]> {
    return await db.select().from(quickQuestions)
      .where(eq(quickQuestions.isAnswered, false))
      .orderBy(desc(quickQuestions.createdAt));
  }

  async getAnsweredQuickQuestions(): Promise<QuickQuestion[]> {
    return await db.select().from(quickQuestions)
      .where(eq(quickQuestions.isAnswered, true))
      .orderBy(desc(quickQuestions.answeredAt));
  }

  async createQuickQuestion(question: InsertQuickQuestion): Promise<QuickQuestion> {
    const [result] = await db
      .insert(quickQuestions)
      .values(question)
      .returning();
    return result;
  }

  async answerQuickQuestion(id: string, answer: string, answerEn: string | null, answeredBy: string): Promise<QuickQuestion> {
    const [result] = await db
      .update(quickQuestions)
      .set({
        answer,
        answerEn,
        answeredBy,
        isAnswered: true,
        answeredAt: new Date(),
      })
      .where(eq(quickQuestions.id, id))
      .returning();
    return result;
  }

  async updateQuickQuestionTranslation(id: string, questionEn: string): Promise<QuickQuestion> {
    const [result] = await db
      .update(quickQuestions)
      .set({ questionEn })
      .where(eq(quickQuestions.id, id))
      .returning();
    return result;
  }

  async updateQuickQuestion(id: string, updates: { question?: string; questionEn?: string; answer?: string; answerEn?: string }): Promise<QuickQuestion> {
    const [result] = await db
      .update(quickQuestions)
      .set(updates)
      .where(eq(quickQuestions.id, id))
      .returning();
    return result;
  }

  async deleteQuickQuestion(id: string): Promise<void> {
    await db.delete(quickQuestions).where(eq(quickQuestions.id, id));
  }
}

export const storage = new DatabaseStorage();
