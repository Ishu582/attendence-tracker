import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Camera, Wifi, Bell, Shield, User, School } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  const [classSettings, setClassSettings] = useState({
    className: "Class 5A",
    subject: "Mathematics",
    attendanceThreshold: 75
  });
  const [systemSettings, setSystemSettings] = useState({
    facialRecognition: true,
    rfidIntegration: true,
    offlineMode: true,
    pushNotifications: true,
    autoSync: {
      fiveMinutes: false,
      hourly: true,
      daily: true
    },
    governmentApiEndpoint: ""
  });

  // Load user profile
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  // Load system settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest("PUT", "/api/user/profile", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      return apiRequest("PUT", "/api/settings", settingsData);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || ""
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (settings) {
      setSystemSettings(settings);
    }
  }, [settings]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profile);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      ...systemSettings,
      attendanceThreshold: classSettings.attendanceThreshold
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="title-settings">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your Smart Attendance system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({...prev, fullName: e.target.value}))}
                data-testid="input-full-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                data-testid="input-phone"
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Class Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Class Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input 
                id="class-name" 
                defaultValue="Class 5A" 
                data-testid="input-class-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                defaultValue="Mathematics" 
                data-testid="input-subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendance-threshold">Low Attendance Threshold (%)</Label>
              <Input 
                id="attendance-threshold" 
                type="number" 
                defaultValue="75" 
                min="1" 
                max="100"
                data-testid="input-attendance-threshold"
              />
            </div>
            
            <Button className="w-full" data-testid="button-save-class">
              <Save className="h-4 w-4 mr-2" />
              Save Class Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Facial Recognition</Label>
                <p className="text-xs text-muted-foreground">Enable automatic attendance via face detection</p>
              </div>
              <Switch 
                checked={systemSettings.facialRecognition}
                onCheckedChange={(checked) => setSystemSettings(prev => ({...prev, facialRecognition: checked}))}
                data-testid="switch-facial-recognition" 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">RFID Integration</Label>
                <p className="text-xs text-muted-foreground">Allow attendance marking via RFID cards</p>
              </div>
              <Switch 
                checked={systemSettings.rfidIntegration}
                onCheckedChange={(checked) => setSystemSettings(prev => ({...prev, rfidIntegration: checked}))}
                data-testid="switch-rfid" 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Offline Mode</Label>
                <p className="text-xs text-muted-foreground">Store data locally when internet is unavailable</p>
              </div>
              <Switch 
                checked={systemSettings.offlineMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({...prev, offlineMode: checked}))}
                data-testid="switch-offline-mode" 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive alerts for low attendance</p>
              </div>
              <Switch 
                checked={systemSettings.pushNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({...prev, pushNotifications: checked}))}
                data-testid="switch-notifications" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data & Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Data & Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Auto Sync</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Every 5 minutes</Label>
                  <Switch data-testid="switch-auto-sync-5min" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Every hour</Label>
                  <Switch defaultChecked data-testid="switch-auto-sync-hour" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Daily</Label>
                  <Switch defaultChecked data-testid="switch-auto-sync-daily" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Data Backup</h3>
              <Button variant="outline" className="w-full" data-testid="button-backup-data">
                <Camera className="h-4 w-4 mr-2" />
                Backup Data
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-export-data">
                Export to CSV
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Government Sync</h3>
              <div className="space-y-2">
                <Label htmlFor="govt-api">Government API Endpoint</Label>
                <Input 
                  id="govt-api" 
                  placeholder="https://api.education.gov.in" 
                  data-testid="input-govt-api"
                />
              </div>
              <Button variant="outline" className="w-full" data-testid="button-sync-government">
                Sync with Government Portal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <div className="flex justify-end">
        <Button size="lg" data-testid="button-save-all-settings">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
