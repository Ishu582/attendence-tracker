import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Percent, Check, History, RotateCcw, BarChart3, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/progress-ring";
import { WeeklyChart } from "@/components/weekly-chart";
import { Link } from "wouter";
import type { DashboardStats, WeeklyAttendance, StudentWithStats } from "@shared/schema";

export default function Dashboard() {
  // Get the first class for demo (in real app, this would be selected by teacher)
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/class/demo/dashboard-stats"],
  });

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery<WeeklyAttendance[]>({
    queryKey: ["/api/class/demo/weekly-attendance"],
  });

  const { data: students, isLoading: studentsLoading } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/students"],
  });

  const { data: lowAttendanceStudents, isLoading: lowAttendanceLoading } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/low-attendance"],
  });

  if (statsLoading || weeklyLoading || studentsLoading || lowAttendanceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="title-dashboard">
          Teacher Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-current-class">
          Class 5A - Mathematics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Students</div>
              <div className="text-3xl font-bold text-foreground" data-testid="stat-total-students">
                {dashboardStats?.totalStudents || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 text-success rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Present Today</div>
              <div className="text-3xl font-bold text-foreground" data-testid="stat-present-today">
                {dashboardStats?.presentToday || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Absent Today</div>
              <div className="text-3xl font-bold text-foreground" data-testid="stat-absent-today">
                {dashboardStats?.absentToday || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 text-success rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Attendance Rate</div>
              <div className="text-3xl font-bold text-foreground" data-testid="stat-attendance-rate">
                {dashboardStats?.attendanceRate || 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            asChild
            className="bg-success hover:bg-success/90 text-success-foreground rounded-xl p-6 h-auto flex-col items-start text-left"
            data-testid="action-mark-attendance"
          >
            <Link href="/mark-attendance">
              <div className="flex items-center justify-center w-12 h-12 bg-success-foreground/20 rounded-lg mb-4">
                <Check className="h-6 w-6" />
              </div>
              <div className="font-semibold">Mark Attendance</div>
            </Link>
          </Button>

          <Button 
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl p-6 h-auto flex-col items-start text-left"
            data-testid="action-view-history"
          >
            <Link href="/attendance-history">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-foreground/20 rounded-lg mb-4">
                <History className="h-6 w-6" />
              </div>
              <div className="font-semibold">View History</div>
            </Link>
          </Button>

          <Button 
            className="bg-warning hover:bg-warning/90 text-warning-foreground rounded-xl p-6 h-auto flex-col items-start text-left"
            data-testid="action-sync-data"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-warning-foreground/20 rounded-lg mb-4">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div className="font-semibold">Sync Data</div>
          </Button>

          <Button 
            asChild
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl p-6 h-auto flex-col items-start text-left"
            data-testid="action-generate-report"
          >
            <Link href="/reports">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-foreground/20 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="font-semibold">Generate Report</div>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Attendance Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyData && <WeeklyChart data={weeklyData} />}
            </CardContent>
          </Card>
        </div>

        {/* Low Attendance Alert */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Low Attendance Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowAttendanceStudents?.map((student) => (
                  <div 
                    key={student.id}
                    className={`rounded-lg p-3 border ${
                      student.status === "critical" 
                        ? "bg-destructive/5 border-destructive/20" 
                        : "bg-warning/5 border-warning/20"
                    }`}
                    data-testid={`alert-student-${student.id}`}
                  >
                    <div className="font-medium text-foreground">{student.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.attendanceRate}% attendance {student.status === "critical" ? "(Below 75%)" : "(Needs attention)"}
                    </div>
                  </div>
                ))}
                {!lowAttendanceStudents?.length && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No low attendance alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Attendance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students?.map((student) => (
              <div 
                key={student.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                data-testid={`student-${student.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    student.status === "excellent" ? "bg-success" :
                    student.status === "good" ? "bg-success" :
                    student.status === "warning" ? "bg-warning" :
                    "bg-destructive"
                  }`}></div>
                  <div>
                    <div className="font-medium text-foreground">{student.fullName}</div>
                    <div className="text-sm text-muted-foreground">Roll No. {student.rollNo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {student.attendanceRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                  </div>
                  <ProgressRing percentage={student.attendanceRate} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
