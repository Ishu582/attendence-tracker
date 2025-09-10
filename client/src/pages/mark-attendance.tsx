import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Scan } from "lucide-react";
import type { StudentWithStats } from "@shared/schema";

export default function MarkAttendance() {
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [rfidCardId, setRfidCardId] = useState("");
  const [rfidScans, setRfidScans] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/students"],
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; isPresent: boolean; date: string }) => {
      return apiRequest("POST", "/api/attendance", {
        studentId: data.studentId,
        classId: "demo",
        date: data.date,
        isPresent: data.isPresent,
        markedBy: "teacher-demo",
        method: "manual",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/students"] });
    },
  });

  const rfidAttendanceMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest("POST", "/api/rfid/attendance", {
        rfidCardId: cardId,
        classId: "demo",
        markedBy: "teacher-demo",
        date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "RFID Attendance Marked",
        description: `${data.student.fullName} (${data.student.rollNo}) marked present`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/students"] });
      setRfidScans(prev => [...prev, rfidCardId]);
      setRfidCardId("");
    },
    onError: (error: any) => {
      toast({
        title: "RFID Error",
        description: error.message || "Failed to mark RFID attendance",
        variant: "destructive",
      });
    },
  });

  const bulkRfidMutation = useMutation({
    mutationFn: async (scans: string[]) => {
      return apiRequest("POST", "/api/rfid/bulk-attendance", {
        scans,
        classId: "demo", 
        markedBy: "teacher-demo",
        date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Bulk RFID Processing Complete",
        description: `${data.successful.length}/${data.total} students marked successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class/demo/students"] });
      setRfidScans([]);
    },
  });

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSubmitAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      for (const [studentId, isPresent] of Object.entries(attendanceData)) {
        await markAttendanceMutation.mutateAsync({
          studentId,
          isPresent,
          date: today,
        });
      }
      
      toast({
        title: "Attendance Marked",
        description: "Attendance has been successfully recorded for all students.",
      });
      
      setAttendanceData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAllPresent = () => {
    if (students) {
      const newData: Record<string, boolean> = {};
      students.forEach(student => {
        newData[student.id] = true;
      });
      setAttendanceData(newData);
    }
  };

  const markAllAbsent = () => {
    if (students) {
      const newData: Record<string, boolean> = {};
      students.forEach(student => {
        newData[student.id] = false;
      });
      setAttendanceData(newData);
    }
  };

  const handleRfidScan = () => {
    if (rfidCardId.trim()) {
      rfidAttendanceMutation.mutate(rfidCardId.trim());
    }
  };

  const handleBulkRfidProcess = () => {
    if (rfidScans.length > 0) {
      bulkRfidMutation.mutate(rfidScans);
    }
  };

  const clearRfidScans = () => {
    setRfidScans([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="title-mark-attendance">
            Mark Attendance
          </h1>
          <p className="text-muted-foreground">
            Class 5A - Mathematics • {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent} data-testid="button-mark-all-present">
            Mark All Present
          </Button>
          <Button variant="outline" onClick={markAllAbsent} data-testid="button-mark-all-absent">
            Mark All Absent
          </Button>
        </div>
      </div>

      {/* RFID Attendance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              RFID Attendance Scanning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Scan or enter RFID card ID..."
                value={rfidCardId}
                onChange={(e) => setRfidCardId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRfidScan()}
                data-testid="input-rfid-card"
              />
              <Button 
                onClick={handleRfidScan} 
                disabled={!rfidCardId.trim() || rfidAttendanceMutation.isPending}
                data-testid="button-rfid-scan"
              >
                <Scan className="h-4 w-4 mr-2" />
                {rfidAttendanceMutation.isPending ? "Scanning..." : "Scan"}
              </Button>
            </div>

            {rfidScans.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanned Cards ({rfidScans.length})</span>
                  <Button variant="outline" size="sm" onClick={clearRfidScans}>
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rfidScans.map((cardId, index) => (
                    <Badge key={index} variant="secondary">
                      {cardId.slice(-6)}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={handleBulkRfidProcess}
                  disabled={bulkRfidMutation.isPending}
                  className="w-full"
                  data-testid="button-bulk-process"
                >
                  {bulkRfidMutation.isPending ? "Processing..." : `Process ${rfidScans.length} Scans`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's RFID Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Students Present via RFID:</span>
                <span className="font-medium">
                  {students?.filter(s => s.isPresent).length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Students:</span>
                <span className="font-medium">{students?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Attendance Rate:</span>
                <span className="font-medium text-green-600">
                  {students?.length ? Math.round(((students?.filter(s => s.isPresent).length || 0) / students.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Attendance (Student List)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students?.map((student) => {
              const isPresent = attendanceData[student.id];
              const hasSelection = student.id in attendanceData;
              
              return (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`attendance-row-${student.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`present-${student.id}`}
                          checked={isPresent === true}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                          data-testid={`checkbox-present-${student.id}`}
                        />
                        <label 
                          htmlFor={`present-${student.id}`}
                          className="text-sm font-medium text-success cursor-pointer"
                        >
                          Present
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`absent-${student.id}`}
                          checked={isPresent === false}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, !checked)}
                          data-testid={`checkbox-absent-${student.id}`}
                        />
                        <label 
                          htmlFor={`absent-${student.id}`}
                          className="text-sm font-medium text-destructive cursor-pointer"
                        >
                          Absent
                        </label>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <div className="font-medium text-foreground">{student.fullName}</div>
                      <div className="text-sm text-muted-foreground">Roll No. {student.rollNo}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {hasSelection && (
                      <Badge 
                        variant={isPresent ? "default" : "destructive"}
                        className={isPresent ? "bg-success text-success-foreground" : ""}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </Badge>
                    )}
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {student.attendanceRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {Object.keys(attendanceData).length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={handleSubmitAttendance}
                disabled={markAttendanceMutation.isPending}
                className="w-full"
                data-testid="button-submit-attendance"
              >
                {markAttendanceMutation.isPending ? "Submitting..." : "Submit Attendance"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
