import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DashboardStats, StudentWithStats } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  
  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ["/api/class/demo/dashboard-stats"],
  });

  const { data: students } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/students"],
  });

  const { data: lowAttendanceStudents } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/low-attendance"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (type: string) => {
      return apiRequest("POST", "/api/reports/generate", {
        type,
        classId: "demo",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Report Generated",
        description: `${data.type} report has been generated successfully. ${data.summary.totalStudents} students included.`,
      });
      // In a real app, this would trigger a download
      console.log("Report data:", data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = (reportType: string) => {
    generateReportMutation.mutate(reportType);
  };

  const excellentStudents = students?.filter(s => s.status === "excellent").length || 0;
  const goodStudents = students?.filter(s => s.status === "good").length || 0;
  const warningStudents = students?.filter(s => s.status === "warning").length || 0;
  const criticalStudents = students?.filter(s => s.status === "critical").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="title-reports">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive attendance reports for Class 5A - Mathematics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Overall Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {dashboardStats?.attendanceRate || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Excellent (95%+)</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {excellentStudents}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Needs Attention</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {warningStudents}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Critical</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {criticalStudents}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-3 p-6 h-auto"
              onClick={() => handleGenerateReport("daily")}
              disabled={generateReportMutation.isPending}
              data-testid="button-daily-report"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-medium">Daily Attendance Report</div>
                <div className="text-sm text-muted-foreground">Today's attendance summary</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-3 p-6 h-auto"
              onClick={() => handleGenerateReport("weekly")}
              disabled={generateReportMutation.isPending}
              data-testid="button-weekly-report"
            >
              <BarChart3 className="h-8 w-8 text-success" />
              <div className="text-left">
                <div className="font-medium">Weekly Report</div>
                <div className="text-sm text-muted-foreground">Last 7 days attendance trends</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-3 p-6 h-auto"
              onClick={() => handleGenerateReport("monthly")}
              disabled={generateReportMutation.isPending}
              data-testid="button-monthly-report"
            >
              <TrendingUp className="h-8 w-8 text-warning" />
              <div className="text-left">
                <div className="font-medium">Monthly Report</div>
                <div className="text-sm text-muted-foreground">Complete month analysis</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-3 p-6 h-auto"
              onClick={() => handleGenerateReport("government")}
              disabled={generateReportMutation.isPending}
              data-testid="button-government-report"
            >
              <Download className="h-8 w-8 text-secondary" />
              <div className="text-left">
                <div className="font-medium">Government Report</div>
                <div className="text-sm text-muted-foreground">Official submission format</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students?.map((student) => (
              <div 
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`performance-row-${student.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
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
                    <div className="text-xs text-muted-foreground">Attendance Rate</div>
                  </div>
                  
                  <Badge 
                    variant={
                      student.status === "excellent" ? "default" :
                      student.status === "good" ? "default" :
                      student.status === "warning" ? "secondary" :
                      "destructive"
                    }
                    className={
                      student.status === "excellent" || student.status === "good" 
                        ? "bg-success text-success-foreground" 
                        : student.status === "warning"
                        ? "bg-warning text-warning-foreground"
                        : ""
                    }
                  >
                    {student.status === "excellent" ? "Excellent" :
                     student.status === "good" ? "Good" :
                     student.status === "warning" ? "Warning" :
                     "Critical"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
