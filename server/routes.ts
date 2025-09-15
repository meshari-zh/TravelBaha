import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
import { insertPlaceSchema, insertGuideSchema, insertBookingSchema, insertMessageSchema, insertReviewSchema, insertInviteSchema, insertSiteContentSchema, insertTeamMemberSchema, type Booking } from "@shared/schema";
import session from "express-session";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";
import type { SessionData } from "express-session";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Users routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const allUsers = await storage.getAllUsers();
      // Filter out the current user from the results
      const users = allUsers.filter(user => user.id !== currentUserId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Places routes
  app.get('/api/places', async (req, res) => {
    try {
      const places = await storage.getAllPlaces();
      res.json(places);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });

  app.get('/api/places/:id', async (req, res) => {
    try {
      const place = await storage.getPlace(req.params.id);
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      res.json(place);
    } catch (error) {
      console.error("Error fetching place:", error);
      res.status(500).json({ message: "Failed to fetch place" });
    }
  });

  app.post('/api/places', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertPlaceSchema.parse(req.body);
      const place = await storage.createPlace(validatedData);
      res.status(201).json(place);
    } catch (error) {
      console.error("Error creating place:", error);
      res.status(500).json({ message: "Failed to create place" });
    }
  });

  app.put('/api/places/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertPlaceSchema.partial().parse(req.body);
      const place = await storage.updatePlace(req.params.id, validatedData);
      res.json(place);
    } catch (error) {
      console.error("Error updating place:", error);
      res.status(500).json({ message: "Failed to update place" });
    }
  });

  app.delete('/api/places/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deletePlace(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting place:", error);
      res.status(500).json({ message: "Failed to delete place" });
    }
  });

  // Guides routes
  app.get('/api/guides', async (req, res) => {
    try {
      const guides = await storage.getAllGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get('/api/guides/:id', async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.get('/api/guides/user/:userId', async (req, res) => {
    try {
      const guide = await storage.getGuideByUserId(req.params.userId);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.post('/api/guides', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only admins can create guide profiles or users can create their own
      if (user.role !== 'admin' && req.body.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(validatedData);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  app.put('/api/guides/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const guide = await storage.getGuide(req.params.id);
      
      if (!user || !guide) {
        return res.status(404).json({ message: "User or guide not found" });
      }

      // Only the guide owner or admin can update
      if (user.role !== 'admin' && guide.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertGuideSchema.partial().parse(req.body);
      const updatedGuide = await storage.updateGuide(req.params.id, validatedData);
      res.json(updatedGuide);
    } catch (error) {
      console.error("Error updating guide:", error);
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  // Bookings routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let bookings: Booking[];
      if (user.role === 'admin') {
        bookings = await storage.getAllBookings();
      } else if (user.role === 'guide') {
        const guide = await storage.getGuideByUserId(user.id);
        if (guide) {
          bookings = await storage.getBookingsByGuide(guide.id);
        } else {
          bookings = [];
        }
      } else {
        bookings = await storage.getBookingsByTourist(user.id);
      }

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertBookingSchema.parse({
        ...req.body,
        touristId: user.id,
      });
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const booking = await storage.getBooking(req.params.id);
      
      if (!user || !booking) {
        return res.status(404).json({ message: "User or booking not found" });
      }

      // Only the tourist, guide, or admin can update
      const guide = await storage.getGuideByUserId(user.id);
      const canUpdate = user.role === 'admin' || 
                       booking.touristId === user.id || 
                       (guide && booking.guideId === guide.id);

      if (!canUpdate) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertBookingSchema.partial().parse(req.body);
      const updatedBooking = await storage.updateBooking(req.params.id, validatedData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Messages routes
  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessagesBetweenUsers(userId, req.params.otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.claims.sub,
      });
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.put('/api/messages/read/:senderId', isAuthenticated, async (req: any, res) => {
    try {
      const receiverId = req.user.claims.sub;
      await storage.markMessagesAsRead(req.params.senderId, receiverId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Reviews routes
  app.get('/api/reviews/guide/:guideId', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByGuide(req.params.guideId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        touristId: req.user.claims.sub,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Invites routes
  app.get('/api/invites', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const invites = await storage.getAllInvites();
      res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  app.post('/api/invites', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertInviteSchema.parse(req.body);
      const invite = await storage.createInvite(validatedData);
      res.status(201).json(invite);
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  app.post('/api/invites/use', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.claims.sub;
      
      console.log(`Attempting to redeem invite code: ${code} for user: ${userId}`);
      
      if (!code) {
        return res.status(400).json({ message: "Invite code is required" });
      }

      // Get the invite
      const invite = await storage.getInvite(code);
      if (!invite) {
        console.log(`Invalid invite code attempted: ${code}`);
        return res.status(404).json({ message: "Invalid invite code" });
      }

      console.log(`Found invite: ${JSON.stringify(invite)}`);

      if (invite.isUsed) {
        console.log(`Invite already used: ${code} by ${invite.usedBy}`);
        return res.status(400).json({ message: "Invite code already used" });
      }

      // Get current user to verify they exist
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        console.log(`User not found: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`Current user before role update: ${JSON.stringify(currentUser)}`);

      // Use the invite and update user role in sequence with proper error handling
      console.log(`Marking invite as used: ${code}`);
      const usedInvite = await storage.useInvite(code, userId);
      console.log(`Invite marked as used: ${JSON.stringify(usedInvite)}`);

      console.log(`Updating user role to: ${invite.role}`);
      const updatedUser = await storage.updateUserRole(userId, invite.role as "guide" | "admin");
      console.log(`User role updated: ${JSON.stringify(updatedUser)}`);

      // If the role is 'guide', automatically create a guide profile if one doesn't exist
      if (invite.role === 'guide') {
        console.log(`Checking if guide profile exists for user: ${userId}`);
        const existingGuide = await storage.getGuideByUserId(userId);
        
        if (!existingGuide) {
          console.log(`Creating default guide profile for user: ${userId}`);
          const defaultGuideData = {
            userId: userId,
            bio: "",
            specialties: [],
            languages: ["العربية"],
            dailyRate: "0",
            isActive: true,
          };
          
          const newGuide = await storage.createGuide(defaultGuideData);
          console.log(`Guide profile created: ${JSON.stringify(newGuide)}`);
        } else {
          console.log(`Guide profile already exists: ${JSON.stringify(existingGuide)}`);
        }
      }

      res.json({ message: `Role updated to ${invite.role}`, user: updatedUser });
    } catch (error: any) {
      console.error("Error using invite - Full error:", error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: "Failed to use invite", error: error?.message || "Unknown error" });
    }
  });

  app.delete('/api/invites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      await storage.deleteInvite(id);
      res.status(200).json({ message: "Invite deleted successfully" });
    } catch (error) {
      console.error("Error deleting invite:", error);
      res.status(500).json({ message: "Failed to delete invite" });
    }
  });

  // User profile routes
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, profileImageUrl } = req.body;

      // Validate input
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        profileImageUrl,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // User role management routes  
  app.put('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role } = req.body;
      const userId = req.params.id;

      if (!role || !['tourist', 'guide', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'tourist', 'guide', or 'admin'" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      
      // Prevent admin from deleting themselves
      if (userId === user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error.message === "User not found") {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Site content routes
  app.get('/api/site-content', async (req, res) => {
    try {
      const contents = await storage.getAllSiteContent();
      res.json(contents);
    } catch (error) {
      console.error("Error fetching site content:", error);
      res.status(500).json({ message: "Failed to fetch site content" });
    }
  });

  app.get('/api/site-content/:key', async (req, res) => {
    try {
      const content = await storage.getSiteContent(req.params.key);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching site content:", error);
      res.status(500).json({ message: "Failed to fetch site content" });
    }
  });

  app.post('/api/site-content', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertSiteContentSchema.parse({
        ...req.body,
        updatedBy: user.id,
      });
      
      const content = await storage.createOrUpdateSiteContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating/updating site content:", error);
      res.status(500).json({ message: "Failed to create/update site content" });
    }
  });

  // Team members routes
  app.get('/api/team-members', async (req, res) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get('/api/team-members/:id', async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.post('/api/team-members', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put('/api/team-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(req.params.id, validatedData);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete('/api/team-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTeamMember(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  const httpServer = createServer(app);

  // Map to track authenticated WebSocket connections with user IDs
  const authenticatedConnections = new Map<WebSocket, string>();

  // Helper function to validate session and get user ID
  async function validateSessionAndGetUserId(req: any): Promise<string | null> {
    try {
      const cookieHeader = req.headers.cookie;
      if (!cookieHeader) return null;

      const cookies = parseCookie(cookieHeader);
      const sessionCookie = cookies['connect.sid'];
      if (!sessionCookie) return null;

      // Parse signed session cookie
      let sessionId: string;
      if (sessionCookie.startsWith('s:')) {
        // Signed cookie - verify signature
        const unsigned = unsign(sessionCookie.slice(2), process.env.SESSION_SECRET!);
        if (unsigned === false) {
          console.log('Invalid session cookie signature');
          return null;
        }
        sessionId = unsigned;
      } else {
        // Unsigned cookie
        sessionId = sessionCookie;
      }

      // Query session from database
      const [sessionRecord] = await db.select().from(sessions).where(eq(sessions.sid, sessionId));
      if (!sessionRecord) {
        console.log('Session not found in database');
        return null;
      }

      // Check if session is expired
      if (sessionRecord.expire < new Date()) {
        console.log('Session expired');
        return null;
      }

      // Extract user from session data
      const sessionData = sessionRecord.sess as any;
      if (!sessionData.passport || !sessionData.passport.user) {
        console.log('No user data in session');
        return null;
      }

      const user = sessionData.passport.user;
      if (!user.claims || !user.claims.sub) {
        console.log('Invalid user claims in session');
        return null;
      }

      // Verify token hasn't expired
      const now = Math.floor(Date.now() / 1000);
      if (user.expires_at && now > user.expires_at) {
        console.log('User token expired');
        return null;
      }

      return user.claims.sub;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });
  
  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('New WebSocket connection attempt');
    
    // Authenticate connection immediately using session validation
    const authenticatedUserId = await validateSessionAndGetUserId(req);
    
    if (!authenticatedUserId) {
      console.log('WebSocket connection rejected: Invalid or missing authentication');
      ws.close(1008, 'Unauthorized'); // 1008 = Policy Violation
      return;
    }
    
    // Connection is authenticated - add to mapping
    authenticatedConnections.set(ws, authenticatedUserId);
    console.log(`WebSocket authenticated for user: ${authenticatedUserId}`);
    
    // Send authentication confirmation
    ws.send(JSON.stringify({ type: 'authenticated', success: true, userId: authenticatedUserId }));
    
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        
        // All connections are pre-authenticated, so we can process messages directly
        if (message.type === 'send_message') {
          const senderId = authenticatedUserId; // Use server-verified user ID
          const receiverId = message.receiverId;
          const content = message.content;
          
          if (!receiverId || !content) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing receiverId or content' }));
            return;
          }
          
          // Validate that receiver exists and is a valid user
          const receiverUser = await storage.getUser(receiverId);
          if (!receiverUser) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid receiver' }));
            return;
          }
          
          // Store message in database
          const newMessage = await storage.createMessage({
            senderId,
            receiverId,
            content,
          });
          
          // Send to sender and receiver only (private messaging)
          authenticatedConnections.forEach((userId, client) => {
            if (client.readyState === WebSocket.OPEN && 
                (userId === senderId || userId === receiverId)) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: newMessage,
              }));
            }
          });
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      console.log(`WebSocket connection closed for user: ${authenticatedUserId}`);
      authenticatedConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      authenticatedConnections.delete(ws);
    });
  });

  return httpServer;
}
