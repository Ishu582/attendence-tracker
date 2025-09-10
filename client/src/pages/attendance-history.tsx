import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import type { AttendanceRecord, StudentWithStats } from "@shared/schema";

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: students, isLoading: studentsLoading } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/class/demo/students"],
  });

  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/class/demo/attendance", format(selectedDate, "yyyy-MM-dd")],
  });

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV/PDF report
    console.log("Exporting attendance data...");
  };

  if (studentsLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading attendance history...</div>
      </div>
    );
  }

  const getAttendanceForStudent = (studentId: string) => {
    return attendanceRecords?.find(record => record.studentId === studentId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="title-attendance-history">
            Attendance History
          </h1>
          <p className="text-muted-foreground">
            Class 5A - Mathematics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                data-testid="button-select-date"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex items-center gap-2"
            data-testid="button-export-data"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendance for {format(selectedDate, "MMMM dd, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students?.map((student) => {
              const attendance = getAttendanceForStudent(student.id);
              
              return (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`history-row-${student.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      attendance?.isPresent ? "bg-success" : "bg-destructive"
                    }`}></div>
                    <div>
                      <div className="font-medium text-foreground">{student.fullName}</div>
                      <div className="text-sm text-muted-foreground">Roll No. {student.rollNo}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={attendance?.isPresent ? "default" : "destructive"}
                      className={attendance?.isPresent ? "bg-success text-success-foreground" : ""}
                    >
                      {attendance?.isPresent ? "Present" : "Absent"}
                    </Badge>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {student.attendanceRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                    
                    {attendance && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(attendance.markedAt), "HH:mm")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {!students?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Students</div>
            <div className="text-2xl font-bold text-foreground">
              {students?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Present</div>
            <div className="text-2xl font-bold text-success">
              {attendanceRecords?.filter(r => r.isPresent).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Absent</div>
            <div className="text-2xl font-bold text-destructive">
              {attendanceRecords?.filter(r => !r.isPresent).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
