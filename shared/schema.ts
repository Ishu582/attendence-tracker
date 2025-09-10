import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("teacher"), // teacher, admin, government
  rfidCardId: text("rfid_card_id").unique(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  teacherId: varchar("teacher_id").notNull(),
  schoolId: varchar("school_id").notNull(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rollNo: text("roll_no").notNull(),
  fullName: text("full_name").notNull(),
  classId: varchar("class_id").notNull(),
  photoUrl: text("photo_url"),
  rfidCardId: text("rfid_card_id").unique(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  classId: varchar("class_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  isPresent: boolean("is_present").notNull(),
  markedAt: timestamp("marked_at").notNull().default(sql`now()`),
  markedBy: varchar("marked_by").notNull(),
  method: text("method").notNull().default("manual"), // manual, facial, rfid
});

export const attendanceStats = pgTable("attendance_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  classId: varchar("class_id").notNull(),
  totalDays: integer("total_days").notNull().default(0),
  presentDays: integer("present_days").notNull().default(0),
  attendanceRate: real("attendance_rate").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  students: many(students),
  attendanceRecords: many(attendanceRecords),
  attendanceStats: many(attendanceStats),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  attendanceRecords: many(attendanceRecords),
  attendanceStats: one(attendanceStats, {
    fields: [students.id],
    references: [attendanceStats.studentId],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  student: one(students, {
    fields: [attendanceRecords.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendanceRecords.classId],
    references: [classes.id],
  }),
  markedBy: one(users, {
    fields: [attendanceRecords.markedBy],
    references: [users.id],
  }),
}));

export const attendanceStatsRelations = relations(attendanceStats, ({ one }) => ({
  student: one(students, {
    fields: [attendanceStats.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendanceStats.classId],
    references: [classes.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  markedAt: true,
});

export const insertAttendanceStatsSchema = createInsertSchema(attendanceStats).omit({
  id: true,
  lastUpdated: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceStats = typeof attendanceStats.$inferSelect;
export type InsertAttendanceStats = z.infer<typeof insertAttendanceStatsSchema>;

export const DashboardStatsSchema = z.object({
  totalStudents: z.number(),
  presentToday: z.number(),
  absentToday: z.number(),
  attendanceRate: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const WeeklyAttendanceSchema = z.object({
  day: z.string(),
  present: z.number(),
  absent: z.number(),
  percentage: z.number(),
});

export type WeeklyAttendance = z.infer<typeof WeeklyAttendanceSchema>;

export const StudentWithStatsSchema = z.object({
  id: z.string(),
  rollNo: z.string(),
  fullName: z.string(),
  photoUrl: z.string().nullable(),
  attendanceRate: z.number(),
  isPresent: z.boolean(),
  status: z.enum(["excellent", "good", "warning", "critical"]),
});

export type StudentWithStats = z.infer<typeof StudentWithStatsSchema>;
