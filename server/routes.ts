import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
import { insertPlaceSchema, insertGuideSchema, insertBookingSchema, insertMessageSchema, insertReviewSchema, insertInviteSchema, insertSiteContentSchema, insertTeamMemberSchema, insertQuickQuestionSchema, insertNavigationItemSchema, insertDynamicPageSchema, type Booking, type User } from "@shared/schema";
import session from "express-session";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";
import type { SessionData } from "express-session";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'attached_assets/');
    },
    filename: (req, file, cb) => {
      // Sanitize filename and add timestamp for uniqueness
      const ext = path.extname(file.originalname);
      const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9\u0600-\u06FF\u0750-\u077F_-]/g, '_');
      const uniqueId = nanoid(8);
      const timestamp = Date.now();
      cb(null, `${name}_${timestamp}_${uniqueId}${ext}`);
    }
  });

  // File filter for security
  const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع صور بصيغة JPG, PNG, WEBP أو GIF فقط.'), false);
    }
  };

  const upload = multer({
    storage: storage_multer,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1 // Single file upload
    }
  });

  // Upload endpoint - allow all authenticated users to upload images
  app.post('/api/uploads', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const fileUrl = `/assets/${req.file.filename}`;
      
      res.json({
        message: "تم رفع الصورة بنجاح",
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });

  // List uploaded files endpoint
  app.get('/api/uploads', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const files = await fs.readdir('attached_assets/');
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
      });

      const filesWithInfo = await Promise.all(
        imageFiles.map(async (filename) => {
          try {
            const stats = await fs.stat(path.join('attached_assets/', filename));
            return {
              filename,
              url: `/assets/${filename}`,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime
            };
          } catch (error) {
            console.error(`Error getting stats for ${filename}:`, error);
            return null;
          }
        })
      );

      // Filter out null entries and sort by creation date (newest first)
      const validFiles = filesWithInfo
        .filter(file => file !== null)
        .sort((a, b) => b!.created.getTime() - a!.created.getTime());

      res.json(validFiles);
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ message: "فشل في جلب قائمة الصور" });
    }
  });

  // Delete file endpoint
  app.delete('/api/uploads/:filename', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filename = req.params.filename;
      
      // Security check: ensure filename doesn't contain path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "اسم ملف غير صحيح" });
      }

      // Check if file exists and is an image
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const ext = path.extname(filename).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({ message: "نوع الملف غير مدعوم للحذف" });
      }

      const filePath = path.join('attached_assets/', filename);
      
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        res.json({ message: "تم حذف الصورة بنجاح" });
      } catch (error) {
        res.status(404).json({ message: "الملف غير موجود" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "فشل في حذف الصورة" });
    }
  });

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

  // Development/Testing - Create admin user endpoint (only for development)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/dev/create-admin', async (req: any, res) => {
      try {
        const { id, email, firstName, lastName } = req.body;
        
        // Only allow specific test user IDs for security
        const allowedTestAdmins = ['admin123', 'newadmin456', 'testadmin789'];
        if (!allowedTestAdmins.includes(id)) {
          return res.status(400).json({ message: "Invalid admin ID for testing" });
        }

        await storage.upsertUser({
          id,
          email: email || `${id}@test.com`,
          firstName: firstName || 'Test',
          lastName: lastName || 'Admin',
          role: 'admin',
        });

        res.json({ message: "Test admin user created successfully" });
      } catch (error) {
        console.error("Error creating test admin:", error);
        res.status(500).json({ message: "Failed to create test admin" });
      }
    });
  }

  // Seed tourist attractions endpoint
  app.post('/api/places/seed', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const touristAttractions = [
        {
          name: "ذي عين",
          description: "قرية تراثية عريقة تتميز بالبيوت الحجرية القديمة والمعمار الأصيل، وتعتبر من أهم المواقع التراثية في منطقة الباحة",
          imageUrl: "@assets/ذي عين_1757793151104.jpg",
          location: "الباحة",
          category: "تراث"
        },
        {
          name: "رغدان",
          description: "منطقة طبيعية ساحرة تتميز بالجبال الخضراء والطبيعة الخلابة، مكان مثالي للاستجمام والتنزه",
          imageUrl: "@assets/رغدان_1757793151105.jpg",
          location: "الباحة",
          category: "طبيعة"
        },
        {
          name: "شلال الحمدة",
          description: "شلال طبيعي خلاب يتدفق من ارتفاعات شاهقة، يوفر مناظر طبيعية رائعة ومياه عذبة منعشة",
          imageUrl: "@assets/شلال الحمده_1757793151105.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال خيرة",
          description: "من أجمل الشلالات في المنطقة، يقع وسط الغابات الكثيفة ويوفر أجواء هادئة ومنعشة",
          imageUrl: "@assets/شلال خيره_1757793151106.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال عين الجمل",
          description: "شلال جميل يقع في منطقة جبلية خلابة، محاط بالأشجار والصخور الطبيعية",
          imageUrl: "@assets/شلال عين الجمل_1757793151106.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "غابة خيرة",
          description: "غابة طبيعية كثيفة تضم أنواعاً متنوعة من الأشجار، مكان مثالي للمشي والاستمتاع بالطبيعة",
          imageUrl: "@assets/غابة خيره_1757793151107.jpg",
          location: "الباحة",
          category: "غابات"
        },
        {
          name: "قلعة بخروش",
          description: "قلعة تاريخية أثرية تحكي تاريخ المنطقة العريق، تتميز بالعمارة التقليدية والموقع الاستراتيجي",
          imageUrl: "@assets/قلعه بخروش_1757793151107.jpg",
          location: "الباحة",
          category: "تراث"
        },
        {
          name: "منتزه الأمير حسام",
          description: "منتزه عائلي جميل يوفر مرافق ترفيهية متنوعة ومساحات خضراء واسعة للعائلات",
          imageUrl: "@assets/منتزه الامير حسام_1757793151107.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "حديقة الافندر",
          description: "حديقة عطرية جميلة تضم زراعات الافندر الأرجواني، توفر أجواءً رومانسية ومناظر خلابة",
          imageUrl: "@assets/حديقة الافندر_1757970030008.jpg",
          location: "الباحة",
          category: "حدائق"
        },
        {
          name: "حديقة الأمير سلطان",
          description: "حديقة حديثة ومجهزة بمرافق متطورة، تشمل ألعاب الأطفال ومسارات المشي والمطاعم",
          imageUrl: "@assets/حديقة الامير سلطان_1757970030009.jpg",
          location: "الباحة",
          category: "حدائق"
        },
        {
          name: "سد وادي العقيق",
          description: "سد جميل يجمع مياه الأمطار، يوفر مناظر طبيعية ساحرة ومكاناً هادئاً للاستجمام",
          imageUrl: "@assets/سد وادي العقيق_1757970030010.jpg",
          location: "الباحة",
          category: "سدود"
        },
        {
          name: "شلال الشراشير",
          description: "شلال مذهل يتميز بتدفقه القوي والمناظر الطبيعية المحيطة به، مكان مثالي للتصوير",
          imageUrl: "@assets/شلال الشراشير_1757970030010.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال الشولة",
          description: "شلال طبيعي رائع يقع في منطقة جبلية عالية، يوفر مناظر بانورامية خلابة",
          imageUrl: "@assets/شلال الشوله11_1757970030011.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال الغدير",
          description: "شلال هادئ وجميل محاط بالصخور الطبيعية والنباتات الخضراء، مكان مثالي للهدوء والتأمل",
          imageUrl: "@assets/شلال الغدير_1757970030012.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال أم الدقيق",
          description: "شلال صغير وساحر يقع في منطقة نائية، يوفر أجواءً هادئة بعيداً عن الضوضاء",
          imageUrl: "@assets/شلال ام الدقيق_1757970030013.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "شلال صفا البراق",
          description: "شلال مميز يتميز بصخوره اللامعة والمياه الصافية، يخلق منظراً طبيعياً رائعاً",
          imageUrl: "@assets/شلال صفا البراق_1757970030013.jpg",
          location: "الباحة",
          category: "شلالات"
        },
        {
          name: "عين الجمل",
          description: "عين مائية طبيعية تتدفق من الجبال، توفر مياهاً عذبة ومكاناً هادئاً للاستجمام",
          imageUrl: "@assets/عين الجمل_1757970030013.jpg",
          location: "الباحة",
          category: "عيون مائية"
        },
        {
          name: "متحف الأخوين",
          description: "متحف تراثي يعرض تاريخ وثقافة المنطقة، يضم مجموعات نادرة من الآثار والمقتنيات التراثية",
          imageUrl: "@assets/متحف الاخوين_1757970030014.jpg",
          location: "الباحة",
          category: "متاحف"
        },
        {
          name: "منتزه الخلب",
          description: "منتزه طبيعي جميل يقع في منطقة جبلية، يوفر إطلالات رائعة ومرافق ترفيهية للعائلات",
          imageUrl: "@assets/منتزه الخلب_1757970030014.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "منتزه الدانة",
          description: "منتزه عائلي مجهز بمرافق حديثة، يضم مناطق للألعاب والشواء ومسارات للمشي",
          imageUrl: "@assets/منتزه الدانه_1757970030015.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "منتزه الشروق",
          description: "منتزه يوفر مناظر رائعة لشروق الشمس، مكان مثالي للاستيقاظ المبكر والاستمتاع بالطبيعة",
          imageUrl: "@assets/منتزه الشروق_1757970030015.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "منتزه الشلال",
          description: "منتزه يحيط بشلال طبيعي جميل، يوفر مرافق للزوار ومناطق للجلوس والاسترخاء",
          imageUrl: "@assets/منتزه الشلال_1757970030015.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "منتزه سد الجنابين",
          description: "منتزه يقع بجانب سد جميل، يوفر مناظر مائية ساحرة ومرافق ترفيهية متنوعة",
          imageUrl: "@assets/منتزه سد الجنابين_1757970030016.jpg",
          location: "الباحة",
          category: "منتزهات"
        },
        {
          name: "نزل العائد التراثي",
          description: "نزل تراثي أصيل يوفر تجربة الإقامة التقليدية، مبني بالطراز المعماري القديم",
          imageUrl: "@assets/نزل العائد التراثي_1757970030016.jpg",
          location: "الباحة",
          category: "فنادق تراثية"
        },
        {
          name: "وادي القدحة",
          description: "وادي طبيعي خلاب يتميز بالمناظر الجبلية والنباتات البرية، مكان رائع للمغامرات والاستكشاف",
          imageUrl: "@assets/وادي القدحة_1757970030017.jpg",
          location: "الباحة",
          category: "أودية"
        },
        {
          name: "وادي القدحة - مسير",
          description: "مسار طبيعي في وادي القدحة يوفر تجربة مشي رائعة وسط الطبيعة الخلابة",
          imageUrl: "@assets/وادي القدحه بمسير_1757970030017.jpg",
          location: "الباحة",
          category: "أودية"
        },
        {
          name: "وادي تربة زهران",
          description: "وادي جميل يتميز بالتضاريس المتنوعة والنباتات الطبيعية، مكان مثالي للرحلات الاستكشافية",
          imageUrl: "@assets/وادي تربه زهران_1757970030017.jpg",
          location: "الباحة",
          category: "أودية"
        },
        {
          name: "وادي ثراد",
          description: "وادي خلاب يوفر مناظر طبيعية ساحرة ومسارات للمشي، مكان هادئ للاسترخاء والتأمل",
          imageUrl: "@assets/وادي ثراد_1757970030018.jpg",
          location: "الباحة",
          category: "أودية"
        }
      ];

      const createdPlaces = [];
      for (const attraction of touristAttractions) {
        try {
          const place = await storage.createPlace(attraction);
          createdPlaces.push(place);
        } catch (error) {
          console.error(`Error creating place ${attraction.name}:`, error);
        }
      }

      res.json({ 
        message: `Successfully seeded ${createdPlaces.length} tourist attractions`,
        places: createdPlaces
      });
    } catch (error) {
      console.error("Error seeding places:", error);
      res.status(500).json({ message: "Failed to seed places" });
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

      let bookings: (Booking & { tourist?: User })[];
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

      // Only tourists can create bookings
      if (user.role !== 'tourist') {
        return res.status(403).json({ message: "Only tourists can create bookings" });
      }

      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const timeSlot = req.body.timeSlot || 'morning';
      const guideId = req.body.guideId;

      // Check if guide already has a booking for this date and time slot
      const existingBookings = await storage.getBookingsByGuide(guideId);
      const conflictingBooking = existingBookings.find((booking: Booking) => {
        if (booking.status === 'cancelled') return false;
        
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        
        // Check if dates overlap and same time slot
        const datesOverlap = startDate <= bookingEnd && endDate >= bookingStart;
        const sameTimeSlot = booking.timeSlot === timeSlot;
        
        return datesOverlap && sameTimeSlot;
      });

      if (conflictingBooking) {
        const timeSlotText = timeSlot === 'morning' ? 'صباحاً' : 'مساءً';
        return res.status(409).json({ 
          message: `المرشد لديه حجز بالفعل في هذا الوقت (${timeSlotText}). يرجى اختيار وقت أو تاريخ آخر.`,
          messageEn: `This guide already has a booking at this time (${timeSlot === 'morning' ? 'Morning' : 'Evening'}). Please choose a different time or date.`
        });
      }

      // Convert date strings to Date objects
      const bookingData = {
        ...req.body,
        touristId: user.id,
        startDate: startDate,
        endDate: endDate,
        timeSlot: timeSlot,
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      
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
      console.log("Review request body:", req.body);
      console.log("User ID:", req.user.claims.sub);
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        touristId: req.user.claims.sub,
      });
      
      console.log("Validated review data:", validatedData);
      
      const review = await storage.createReview(validatedData);
      
      // Update guide rating after creating review
      if (review) {
        try {
          const allReviews = await storage.getReviewsByGuide(validatedData.guideId);
          const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await storage.updateGuide(validatedData.guideId, { 
            rating: avgRating.toFixed(2),
            reviewCount: allReviews.length 
          });
        } catch (updateError) {
          console.error("Error updating guide rating:", updateError);
        }
      }
      
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid review data", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message || "Failed to create review" });
      }
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

  // Quick Questions routes - visible to all, answerable by admins only
  app.get('/api/quick-questions', async (req, res) => {
    try {
      const questions = await storage.getAllQuickQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quick questions:", error);
      res.status(500).json({ message: "Failed to fetch quick questions" });
    }
  });

  app.get('/api/quick-questions/unanswered', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const questions = await storage.getUnansweredQuickQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching unanswered questions:", error);
      res.status(500).json({ message: "Failed to fetch unanswered questions" });
    }
  });

  app.get('/api/quick-questions/answered', async (req, res) => {
    try {
      const questions = await storage.getAnsweredQuickQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching answered questions:", error);
      res.status(500).json({ message: "Failed to fetch answered questions" });
    }
  });

  app.post('/api/quick-questions', async (req: any, res) => {
    try {
      let userId = null;
      if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
      const { question, questionEn, askerName, askerEmail } = req.body;
      
      if ((!question || question.trim() === '') && (!questionEn || questionEn.trim() === '')) {
        return res.status(400).json({ message: "Question is required in Arabic or English" });
      }
      
      const validatedData = insertQuickQuestionSchema.parse({
        question: question?.trim() || '',
        questionEn: questionEn?.trim() || null,
        askerName: askerName?.trim() || null,
        askerEmail: askerEmail?.trim() || null,
        userId,
        isAnswered: false,
      });
      const createdQuestion = await storage.createQuickQuestion(validatedData);
      res.status(201).json(createdQuestion);
    } catch (error) {
      console.error("Error creating quick question:", error);
      res.status(500).json({ message: "Failed to create quick question" });
    }
  });

  app.put('/api/quick-questions/:id/answer', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { answer, answerEn } = req.body;
      if (!answer || answer.trim() === '') {
        return res.status(400).json({ message: "Answer is required" });
      }

      const question = await storage.answerQuickQuestion(req.params.id, answer, answerEn || null, user.id);
      res.json(question);
    } catch (error) {
      console.error("Error answering quick question:", error);
      res.status(500).json({ message: "Failed to answer quick question" });
    }
  });

  app.put('/api/quick-questions/:id/translation', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { questionEn } = req.body;
      const question = await storage.updateQuickQuestionTranslation(req.params.id, questionEn || '');
      res.json(question);
    } catch (error) {
      console.error("Error updating question translation:", error);
      res.status(500).json({ message: "Failed to update translation" });
    }
  });

  app.put('/api/quick-questions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { question, questionEn, answer, answerEn } = req.body;
      
      if (!question && !questionEn && !answer && !answerEn) {
        return res.status(400).json({ message: "At least one field is required for update" });
      }

      const updates: { question?: string; questionEn?: string; answer?: string; answerEn?: string } = {};
      
      if (question !== undefined && typeof question === 'string') updates.question = question;
      if (questionEn !== undefined && typeof questionEn === 'string') updates.questionEn = questionEn;
      if (answer !== undefined && typeof answer === 'string') updates.answer = answer;
      if (answerEn !== undefined && typeof answerEn === 'string') updates.answerEn = answerEn;

      const updatedQuestion = await storage.updateQuickQuestion(req.params.id, updates);
      res.json(updatedQuestion);
    } catch (error: any) {
      console.error("Error updating quick question:", error);
      if (error.message === 'Question not found') {
        return res.status(404).json({ message: "Question not found" });
      }
      res.status(500).json({ message: "Failed to update quick question" });
    }
  });

  app.delete('/api/quick-questions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteQuickQuestion(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quick question:", error);
      res.status(500).json({ message: "Failed to delete quick question" });
    }
  });

  // Navigation items routes - visible to all (for navbar), manageable by admins
  app.get('/api/navigation', async (req, res) => {
    try {
      const items = await storage.getAllNavigationItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
      res.status(500).json({ message: "Failed to fetch navigation items" });
    }
  });

  app.get('/api/navigation/:id', async (req, res) => {
    try {
      const item = await storage.getNavigationItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Navigation item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching navigation item:", error);
      res.status(500).json({ message: "Failed to fetch navigation item" });
    }
  });

  app.post('/api/navigation', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertNavigationItemSchema.parse(req.body);
      const item = await storage.createNavigationItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating navigation item:", error);
      res.status(500).json({ message: "Failed to create navigation item" });
    }
  });

  app.put('/api/navigation/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertNavigationItemSchema.partial().parse(req.body);
      const item = await storage.updateNavigationItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating navigation item:", error);
      res.status(500).json({ message: "Failed to update navigation item" });
    }
  });

  app.delete('/api/navigation/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteDynamicPagesByNavigationItemId(req.params.id);
      await storage.deleteNavigationItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting navigation item:", error);
      res.status(500).json({ message: "Failed to delete navigation item" });
    }
  });

  app.put('/api/navigation/reorder', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items array is required" });
      }

      await storage.reorderNavigationItems(items);
      res.json({ message: "Navigation items reordered successfully" });
    } catch (error) {
      console.error("Error reordering navigation items:", error);
      res.status(500).json({ message: "Failed to reorder navigation items" });
    }
  });

  // Dynamic pages routes
  app.get('/api/pages', async (req, res) => {
    try {
      const pages = await storage.getAllDynamicPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching dynamic pages:", error);
      res.status(500).json({ message: "Failed to fetch dynamic pages" });
    }
  });

  app.get('/api/pages/:slug', async (req, res) => {
    try {
      const page = await storage.getDynamicPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching dynamic page:", error);
      res.status(500).json({ message: "Failed to fetch dynamic page" });
    }
  });

  app.post('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertDynamicPageSchema.parse(req.body);
      const page = await storage.createDynamicPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating dynamic page:", error);
      res.status(500).json({ message: "Failed to create dynamic page" });
    }
  });

  app.put('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertDynamicPageSchema.partial().parse(req.body);
      const page = await storage.updateDynamicPage(req.params.id, validatedData);
      res.json(page);
    } catch (error) {
      console.error("Error updating dynamic page:", error);
      res.status(500).json({ message: "Failed to update dynamic page" });
    }
  });

  app.delete('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteDynamicPage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dynamic page:", error);
      res.status(500).json({ message: "Failed to delete dynamic page" });
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
