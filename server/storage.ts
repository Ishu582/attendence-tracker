import { 
  type User, 
  type InsertUser, 
  type Class, 
  type InsertClass,
  type Student, 
  type InsertStudent,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type AttendanceStats,
  type InsertAttendanceStats,
  type DashboardStats,
  type WeeklyAttendance,
  type StudentWithStats,
  users,
  classes,
  students,
  attendanceRecords,
  attendanceStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByRfidCard(rfidCardId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Class operations
  getClass(id: string): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;

  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByClass(classId: string): Promise<Student[]>;
  getStudentByRfidCard(rfidCardId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined>;

  // Attendance operations
  markAttendance(attendance: InsertAttendanceRecord): Promise<AttendanceRecord>;
  getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]>;
  getAttendanceHistory(studentId: string, limit?: number): Promise<AttendanceRecord[]>;
  updateAttendanceStats(studentId: string, classId: string): Promise<void>;

  // Dashboard operations
  getDashboardStats(classId: string): Promise<DashboardStats>;
  getWeeklyAttendance(classId: string): Promise<WeeklyAttendance[]>;
  getStudentsWithStats(classId: string): Promise<StudentWithStats[]>;
  getLowAttendanceStudents(classId: string, threshold?: number): Promise<StudentWithStats[]>;
  
  // New methods for additional functionality
  getTeacherClasses(): Promise<any[]>;
  generateReport(type: string, classId: string, startDate?: string, endDate?: string): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, profileData: any): Promise<any>;
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settingsData: any): Promise<any>;
  syncData(target: string, options: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      // Check if data already exists
      const existingTeacher = await db.select().from(users).where(eq(users.username, "anita.sharma")).limit(1);
      if (existingTeacher.length > 0) {
        this.initialized = true;
        return;
      }

      // Create a sample teacher
      const teacherId = randomUUID();
      await db.insert(users).values({
        id: teacherId,
        username: "anita.sharma", 
        password: "password123",
        fullName: "Anita Sharma",
        role: "teacher",
      }).onConflictDoNothing();

      // Create a sample class
      await db.insert(classes).values({
        id: "demo",
        name: "Class 5A",
        subject: "Mathematics",
        teacherId: teacherId,
        schoolId: randomUUID(),
      }).onConflictDoNothing();

      // Create sample students
      const studentNames = [
        "Aarav Kumar", "Priya Sharma", "Rohan Singh", "Sneha Patel", "Arjun Reddy",
        "Kavya Nair", "Vikram Gupta", "Ananya Joshi", "Rahul Verma", "Divya Rao",
        "Karthik Iyer", "Meera Agarwal", "Siddharth Shah", "Pooja Mishra", "Aryan Das",
        "Tanya Malhotra", "Varun Khanna", "Ishita Bansal", "Nikhil Sinha", "Ritika Jain",
        "Aditya Pandey", "Shreya Saxena", "Manish Kumar", "Neha Singh", "Raj Patel",
        "Swati Gupta", "Akash Sharma", "Riya Agarwal", "Deepak Yadav", "Sakshi Tiwari",
        "Rohit Chandra", "Nisha Kapoor"
      ];

      const studentInserts = [];
      const statsInserts = [];
      const attendanceInserts = [];
      const today = new Date().toISOString().split('T')[0];

      for (let index = 0; index < studentNames.length; index++) {
        const studentId = randomUUID();
        
        studentInserts.push({
          id: studentId,
          rollNo: (101 + index).toString(),
          fullName: studentNames[index],
          classId: "demo",
          photoUrl: null,
          rfidCardId: null,
        });

        // Create attendance stats for each student
        const presentDays = Math.floor(Math.random() * 20) + 10; // 10-30 days
        const totalDays = 30;
        const attendanceRate = (presentDays / totalDays) * 100;

        statsInserts.push({
          id: randomUUID(),
          studentId: studentId,
          classId: "demo",
          totalDays: totalDays,
          presentDays: presentDays,
          attendanceRate: attendanceRate,
        });

        // Generate today's attendance
        const isPresent = Math.random() > 0.15; // 85% present rate
        attendanceInserts.push({
          id: randomUUID(),
          studentId: studentId,
          classId: "demo",
          date: today,
          isPresent: isPresent,
          markedBy: teacherId,
          method: "manual",
        });
      }

      await db.insert(students).values(studentInserts).onConflictDoNothing();
      await db.insert(attendanceStats).values(statsInserts).onConflictDoNothing();  
      await db.insert(attendanceRecords).values(attendanceInserts).onConflictDoNothing();

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.initializeData();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.initializeData();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getClass(id: string): Promise<Class | undefined> {
    await this.initializeData();
    const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
    return classItem || undefined;
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    await this.initializeData();
    return db.select().from(classes).where(eq(classes.teacherId, teacherId));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [classItem] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return classItem;
  }

  async getStudent(id: string): Promise<Student | undefined> {
    await this.initializeData();
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    await this.initializeData();
    return db.select().from(students).where(eq(students.classId, classId));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const [updated] = await db
      .update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return updated || undefined;
  }

  async markAttendance(attendance: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db
      .insert(attendanceRecords)
      .values(attendance)
      .returning();
    
    // Update stats
    await this.updateAttendanceStats(attendance.studentId, attendance.classId);
    
    return record;
  }

  async getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    await this.initializeData();
    return db
      .select()
      .from(attendanceRecords)
      .where(and(eq(attendanceRecords.classId, classId), eq(attendanceRecords.date, date)));
  }

  async getAttendanceHistory(studentId: string, limit = 30): Promise<AttendanceRecord[]> {
    await this.initializeData();
    return db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId))
      .orderBy(desc(attendanceRecords.date))
      .limit(limit);
  }

  async updateAttendanceStats(studentId: string, classId: string): Promise<void> {
    const records = await db
      .select()
      .from(attendanceRecords)
      .where(and(eq(attendanceRecords.studentId, studentId), eq(attendanceRecords.classId, classId)));
    
    const totalDays = records.length;
    const presentDays = records.filter(record => record.isPresent).length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Upsert attendance stats
    const existingStats = await db
      .select()
      .from(attendanceStats)
      .where(eq(attendanceStats.studentId, studentId));

    if (existingStats.length > 0) {
      await db
        .update(attendanceStats)
        .set({
          totalDays,
          presentDays,
          attendanceRate,
        })
        .where(eq(attendanceStats.studentId, studentId));
    } else {
      await db
        .insert(attendanceStats)
        .values({
          studentId,
          classId,
          totalDays,
          presentDays,
          attendanceRate,
        });
    }
  }

  async getDashboardStats(classId: string): Promise<DashboardStats> {
    const students = await this.getStudentsByClass(classId);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await this.getAttendanceByDate(classId, today);
    
    const totalStudents = students.length;
    const presentToday = todayAttendance.filter(record => record.isPresent).length;
    const absentToday = todayAttendance.filter(record => !record.isPresent).length;
    const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    return {
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
    };
  }

  async getWeeklyAttendance(classId: string): Promise<WeeklyAttendance[]> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData: WeeklyAttendance[] = [];

    // Generate mock weekly data based on current patterns
    const students = await this.getStudentsByClass(classId);
    const totalStudents = students.length;

    days.forEach(day => {
      // Simulate varying attendance patterns
      const baseAttendance = 0.85; // 85% base attendance
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const attendanceRate = Math.max(0.5, Math.min(0.95, baseAttendance + variation));
      
      const present = Math.round(totalStudents * attendanceRate);
      const absent = totalStudents - present;

      weeklyData.push({
        day,
        present,
        absent,
        percentage: Math.round(attendanceRate * 100),
      });
    });

    return weeklyData;
  }

  async getStudentsWithStats(classId: string): Promise<StudentWithStats[]> {
    await this.initializeData();
    const students = await this.getStudentsByClass(classId);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await this.getAttendanceByDate(classId, today);
    
    const results: StudentWithStats[] = [];
    
    for (const student of students) {
      // Get attendance stats for this student
      const [stats] = await db
        .select()
        .from(attendanceStats)
        .where(eq(attendanceStats.studentId, student.id));
        
      const todayRecord = todayAttendance.find(record => record.studentId === student.id);
      
      const attendanceRate = stats?.attendanceRate || 0;
      let status: "excellent" | "good" | "warning" | "critical";
      
      if (attendanceRate >= 95) status = "excellent";
      else if (attendanceRate >= 85) status = "good";
      else if (attendanceRate >= 75) status = "warning";
      else status = "critical";

      results.push({
        id: student.id,
        rollNo: student.rollNo,
        fullName: student.fullName,
        photoUrl: student.photoUrl,
        attendanceRate: Math.round(attendanceRate),
        isPresent: todayRecord?.isPresent || false,
        status,
      });
    }
    
    return results;
  }

  async getLowAttendanceStudents(classId: string, threshold = 75): Promise<StudentWithStats[]> {
    const studentsWithStats = await this.getStudentsWithStats(classId);
    return studentsWithStats.filter(student => student.attendanceRate < threshold);
  }

  // RFID-specific methods
  async getUserByRfidCard(rfidCardId: string): Promise<User | undefined> {
    await this.initializeData();
    const [user] = await db.select().from(users).where(eq(users.rfidCardId, rfidCardId));
    return user || undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async getStudentByRfidCard(rfidCardId: string): Promise<Student | undefined> {
    await this.initializeData();
    const [student] = await db.select().from(students).where(eq(students.rfidCardId, rfidCardId));
    return student || undefined;
  }

  // New methods for additional functionality
  async getTeacherClasses(): Promise<any[]> {
    await this.initializeData();
    const allClasses = await db.select().from(classes);
    
    // Calculate stats for each class
    const classesWithStats = [];
    for (const classItem of allClasses) {
      const studentsCount = await db.select().from(students).where(eq(students.classId, classItem.id));
      const stats = await this.getDashboardStats(classItem.id);
      
      classesWithStats.push({
        id: classItem.id,
        name: classItem.name,
        subject: classItem.subject,
        totalStudents: studentsCount.length,
        attendanceRate: stats.attendanceRate,
        lastUpdated: "2 hours ago", // Demo data
        isActive: classItem.id === "demo", // Mark demo class as active
      });
    }
    
    return classesWithStats;
  }

  async generateReport(type: string, classId: string, startDate?: string, endDate?: string): Promise<any> {
    const stats = await this.getDashboardStats(classId);
    const students = await this.getStudentsWithStats(classId);
    
    return {
      type,
      generatedAt: new Date().toISOString(),
      classId,
      period: { startDate, endDate },
      summary: {
        totalStudents: students.length,
        averageAttendance: stats.attendanceRate,
        presentToday: stats.presentToday,
        absentToday: stats.absentToday,
      },
      students: students.map(s => ({
        rollNo: s.rollNo,
        fullName: s.fullName,
        attendanceRate: s.attendanceRate,
        status: s.status
      })),
      downloadUrl: `/reports/${type}-${Date.now()}.pdf` // Mock URL
    };
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        id: userId,
        fullName: "Anita Sharma",
        email: "anita.sharma@school.edu",
        phone: "+91 98765 43210",
        role: "teacher"
      };
    }
    return {
      id: user.id,
      fullName: user.username,
      email: user.username + "@school.edu",
      phone: "+91 98765 43210",
      role: user.role
    };
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    // For demo, just return updated data
    return {
      id: userId,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
  }

  async getSystemSettings(): Promise<any> {
    return {
      facialRecognition: true,
      rfidIntegration: true,
      offlineMode: true,
      pushNotifications: true,
      autoSync: {
        fiveMinutes: false,
        hourly: true,
        daily: true
      },
      attendanceThreshold: 75,
      governmentApiEndpoint: "https://api.education.gov.in"
    };
  }

  async updateSystemSettings(settingsData: any): Promise<any> {
    // For demo, just return updated settings
    return {
      ...settingsData,
      updatedAt: new Date().toISOString()
    };
  }

  async syncData(target: string, options: any): Promise<any> {
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      target,
      status: "success",
      recordsSynced: Math.floor(Math.random() * 100) + 50,
      lastSync: new Date().toISOString(),
      options
    };
  }
}

export const storage = new DatabaseStorage();
