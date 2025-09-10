import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendanceRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get teacher's classes
  app.get("/api/teacher/:teacherId/classes", async (req, res) => {
    try {
      const { teacherId } = req.params;
      const classes = await storage.getClassesByTeacher(teacherId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  // Get dashboard stats for a class
  app.get("/api/class/:classId/dashboard-stats", async (req, res) => {
    try {
      const { classId } = req.params;
      const stats = await storage.getDashboardStats(classId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get weekly attendance data for a class
  app.get("/api/class/:classId/weekly-attendance", async (req, res) => {
    try {
      const { classId } = req.params;
      const weeklyData = await storage.getWeeklyAttendance(classId);
      res.json(weeklyData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly attendance" });
    }
  });

  // Get students with stats for a class
  app.get("/api/class/:classId/students", async (req, res) => {
    try {
      const { classId } = req.params;
      const students = await storage.getStudentsWithStats(classId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get low attendance students
  app.get("/api/class/:classId/low-attendance", async (req, res) => {
    try {
      const { classId } = req.params;
      const threshold = req.query.threshold ? Number(req.query.threshold) : 75;
      const students = await storage.getLowAttendanceStudents(classId, threshold);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low attendance students" });
    }
  });

  // Mark attendance for students
  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.markAttendance(attendanceData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid attendance data" });
    }
  });

  // Get attendance for a specific date
  app.get("/api/class/:classId/attendance/:date", async (req, res) => {
    try {
      const { classId, date } = req.params;
      const attendance = await storage.getAttendanceByDate(classId, date);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  // Get attendance history for a student
  app.get("/api/student/:studentId/attendance-history", async (req, res) => {
    try {
      const { studentId } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 30;
      const history = await storage.getAttendanceHistory(studentId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance history" });
    }
  });

  // Get current user (mock for now)
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Return the first teacher for demo purposes  
      const teacher = await storage.getUserByUsername("anita.sharma");
      res.json(teacher);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // RFID Attendance Endpoints

  // Mark attendance using RFID card
  app.post("/api/rfid/attendance", async (req, res) => {
    try {
      const { rfidCardId, classId, markedBy, date } = req.body;
      
      if (!rfidCardId || !classId || !markedBy) {
        return res.status(400).json({ error: "Missing required fields: rfidCardId, classId, markedBy" });
      }

      // Find student by RFID card
      const student = await storage.getStudentByRfidCard(rfidCardId);
      if (!student) {
        return res.status(404).json({ error: "Student not found for RFID card" });
      }

      // Check if student belongs to the class
      if (student.classId !== classId) {
        return res.status(400).json({ error: "Student does not belong to this class" });
      }

      // Mark attendance
      const attendanceData = {
        studentId: student.id,
        classId,
        date: date || new Date().toISOString().split('T')[0],
        isPresent: true,
        markedBy,
        method: "rfid" as const,
      };

      const record = await storage.markAttendance(attendanceData);
      res.json({ 
        success: true, 
        student: {
          id: student.id,
          fullName: student.fullName,
          rollNo: student.rollNo
        },
        attendance: record 
      });
    } catch (error) {
      console.error("RFID attendance error:", error);
      res.status(500).json({ error: "Failed to mark RFID attendance" });
    }
  });

  // Bulk RFID attendance processing
  app.post("/api/rfid/bulk-attendance", async (req, res) => {
    try {
      const { scans, classId, markedBy, date } = req.body;
      
      if (!scans || !Array.isArray(scans) || !classId || !markedBy) {
        return res.status(400).json({ error: "Missing required fields: scans (array), classId, markedBy" });
      }

      const results: {
        successful: Array<{
          rfidCardId: string;
          student: { id: string; fullName: string; rollNo: string };
          attendance: any;
        }>;
        failed: Array<{
          rfidCardId: string;
          student?: string;
          error: string;
        }>;
        total: number;
      } = {
        successful: [],
        failed: [],
        total: scans.length
      };

      const currentDate = date || new Date().toISOString().split('T')[0];

      // Process each RFID scan
      for (const rfidCardId of scans) {
        try {
          const student = await storage.getStudentByRfidCard(rfidCardId);
          
          if (!student) {
            results.failed.push({ rfidCardId, error: "Student not found" });
            continue;
          }

          if (student.classId !== classId) {
            results.failed.push({ rfidCardId, student: student.fullName, error: "Wrong class" });
            continue;
          }

          // Check if already marked for today
          const existingAttendance = await storage.getAttendanceByDate(classId, currentDate);
          const alreadyMarked = existingAttendance.find(record => record.studentId === student.id);
          
          if (alreadyMarked) {
            results.failed.push({ rfidCardId, student: student.fullName, error: "Already marked" });
            continue;
          }

          const attendanceData = {
            studentId: student.id,
            classId,
            date: currentDate,
            isPresent: true,
            markedBy,
            method: "rfid" as const,
          };

          const record = await storage.markAttendance(attendanceData);
          results.successful.push({
            rfidCardId,
            student: {
              id: student.id,
              fullName: student.fullName,
              rollNo: student.rollNo
            },
            attendance: record
          });

        } catch (error) {
          results.failed.push({ rfidCardId, error: "Processing error" });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Bulk RFID attendance error:", error);
      res.status(500).json({ error: "Failed to process bulk RFID attendance" });
    }
  });

  // Assign RFID card to student
  app.put("/api/student/:studentId/rfid", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { rfidCardId } = req.body;

      if (!rfidCardId) {
        return res.status(400).json({ error: "RFID card ID is required" });
      }

      // Check if RFID card is already assigned
      const existingStudent = await storage.getStudentByRfidCard(rfidCardId);
      if (existingStudent && existingStudent.id !== studentId) {
        return res.status(400).json({ error: "RFID card already assigned to another student" });
      }

      const updated = await storage.updateStudent(studentId, { rfidCardId });
      if (!updated) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("RFID assignment error:", error);
      res.status(500).json({ error: "Failed to assign RFID card" });
    }
  });

  // Assign RFID card to teacher/user
  app.put("/api/user/:userId/rfid", async (req, res) => {
    try {
      const { userId } = req.params;
      const { rfidCardId } = req.body;

      if (!rfidCardId) {
        return res.status(400).json({ error: "RFID card ID is required" });
      }

      // Check if RFID card is already assigned
      const existingUser = await storage.getUserByRfidCard(rfidCardId);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "RFID card already assigned to another user" });
      }

      const updated = await storage.updateUser(userId, { rfidCardId });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("User RFID assignment error:", error);
      res.status(500).json({ error: "Failed to assign RFID card to user" });
    }
  });

  // Get student by RFID card
  app.get("/api/rfid/student/:rfidCardId", async (req, res) => {
    try {
      const { rfidCardId } = req.params;
      const student = await storage.getStudentByRfidCard(rfidCardId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found for RFID card" });
      }

      res.json(student);
    } catch (error) {
      console.error("RFID lookup error:", error);
      res.status(500).json({ error: "Failed to lookup student by RFID" });
    }
  });

  // Get user by RFID card
  app.get("/api/rfid/user/:rfidCardId", async (req, res) => {
    try {
      const { rfidCardId } = req.params;
      const user = await storage.getUserByRfidCard(rfidCardId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found for RFID card" });
      }

      res.json(user);
    } catch (error) {
      console.error("RFID user lookup error:", error);
      res.status(500).json({ error: "Failed to lookup user by RFID" });
    }
  });

  // Get all classes for teacher (for My Classes page)
  app.get("/api/teacher/classes", async (req, res) => {
    try {
      // For demo, return teacher's classes with calculated stats
      const classes = await storage.getTeacherClasses();
      res.json(classes);
    } catch (error) {
      console.error("Teacher classes error:", error);
      res.status(500).json({ error: "Failed to fetch teacher classes" });
    }
  });

  // Create new class
  app.post("/api/classes", async (req, res) => {
    try {
      const { name, subject, teacherId } = req.body;
      if (!name || !subject) {
        return res.status(400).json({ error: "Class name and subject are required" });
      }
      
      const newClass = await storage.createClass({ 
        name, 
        subject, 
        teacherId: teacherId || "teacher-demo",
        schoolId: "demo-school"
      });
      res.json(newClass);
    } catch (error) {
      console.error("Create class error:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  // Generate and export reports
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { type, classId, startDate, endDate } = req.body;
      const report = await storage.generateReport(type, classId, startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Get user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo, return current teacher profile
      const profile = await storage.getUserProfile("teacher-demo");
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    try {
      const profileData = req.body;
      const updated = await storage.updateUserProfile("teacher-demo", profileData);
      res.json(updated);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get system settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update system settings
  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = req.body;
      const updated = await storage.updateSystemSettings(settingsData);
      res.json(updated);
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Sync data with external systems
  app.post("/api/sync", async (req, res) => {
    try {
      const { target, options } = req.body;
      const result = await storage.syncData(target, options);
      res.json(result);
    } catch (error) {
      console.error("Sync data error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
