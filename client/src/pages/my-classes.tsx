import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function MyClasses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["/api/teacher/classes"],
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string }) => {
      return apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      toast({
        title: "Class Created",
        description: "New class has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/classes"] });
      setIsDialogOpen(false);
      setNewClassName("");
      setNewSubject("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });

  const handleCreateClass = () => {
    if (newClassName.trim() && newSubject.trim()) {
      createClassMutation.mutate({ 
        name: newClassName.trim(), 
        subject: newSubject.trim() 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading classes...</div>
      </div>
    );
  }

  // Calculate overview stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum: number, cls: any) => sum + cls.totalStudents, 0);
  const avgAttendance = classes.length > 0 
    ? Math.round(classes.reduce((sum: number, cls: any) => sum + cls.attendanceRate, 0) / classes.length * 10) / 10 
    : 0;
  const activeClasses = classes.filter((cls: any) => cls.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="title-my-classes">
            My Classes
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor attendance for all your classes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-class">
              <Plus className="h-4 w-4 mr-2" />
              Add New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="e.g., Class 5A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  data-testid="input-class-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  data-testid="input-subject"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim() || !newSubject.trim() || createClassMutation.isPending}
                  data-testid="button-create-class"
                >
                  {createClassMutation.isPending ? "Creating..." : "Create Class"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card 
            key={classItem.id} 
            className={`hover:shadow-md transition-shadow ${
              classItem.isActive ? "ring-2 ring-primary/20 bg-primary/5" : ""
            }`}
            data-testid={`class-card-${classItem.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                {classItem.isActive && (
                  <Badge className="bg-success text-success-foreground">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{classItem.subject}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{classItem.totalStudents}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className={`text-sm font-medium ${
                      classItem.attendanceRate >= 85 ? "text-success" :
                      classItem.attendanceRate >= 75 ? "text-warning" :
                      "text-destructive"
                    }`}>
                      {classItem.attendanceRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Last updated {classItem.lastUpdated}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  asChild 
                  size="sm" 
                  className={classItem.isActive ? "" : "opacity-60"}
                  data-testid={`button-view-dashboard-${classItem.id}`}
                >
                  <Link href="/">
                    View Dashboard
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                  data-testid={`button-mark-attendance-${classItem.id}`}
                >
                  <Link href="/mark-attendance">
                    Mark Attendance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalClasses}</div>
              <div className="text-sm text-muted-foreground">Total Classes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{avgAttendance}%</div>
              <div className="text-sm text-muted-foreground">Avg. Attendance</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeClasses}</div>
              <div className="text-sm text-muted-foreground">Active Classes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
