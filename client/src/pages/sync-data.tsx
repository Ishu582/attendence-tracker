import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Cloud, Database, Server, CheckCircle, AlertCircle, Upload } from "lucide-react";

export default function SyncData() {
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState("2 min ago");
  const [governmentEndpoint, setGovernmentEndpoint] = useState("https://api.education.gov.in");
  const { toast } = useToast();

  const syncMutation = useMutation({
    mutationFn: async (target: string) => {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncProgress(i);
      }
      
      return apiRequest("POST", "/api/sync", {
        target,
        options: {
          endpoint: governmentEndpoint,
          includeAttendance: true,
          includeMeals: true
        }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync Completed",
        description: `Successfully synced ${data.recordsSynced} records with ${data.target}.`,
      });
      setLastSync("Just now");
      setSyncProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync data",
        variant: "destructive",
      });
      setSyncProgress(0);
    },
  });

  const handleSync = (target: string) => {
    syncMutation.mutate(target);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="title-sync-data">
          Data Synchronization
        </h1>
        <p className="text-muted-foreground">
          Sync attendance data with external systems and government portals
        </p>
      </div>

      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Last Sync</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lastSync}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Pending Records</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              12
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Connection Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-medium text-foreground">Online</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      {syncMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Sync in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={syncProgress} className="w-full" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Syncing attendance data...</span>
                <span>{syncProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Government Portal Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="govt-endpoint">API Endpoint</Label>
              <Input
                id="govt-endpoint"
                value={governmentEndpoint}
                onChange={(e) => setGovernmentEndpoint(e.target.value)}
                placeholder="https://api.education.gov.in"
                data-testid="input-govt-endpoint"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">
                  Syncs attendance and mid-day meal data
                </span>
              </div>
            </div>

            <Button 
              onClick={() => handleSync("government")}
              disabled={syncMutation.isPending}
              className="w-full"
              data-testid="button-sync-government"
            >
              <Upload className="h-4 w-4 mr-2" />
              {syncMutation.isPending ? "Syncing..." : "Sync with Government"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Backup</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Backup</span>
                <span className="text-sm text-muted-foreground">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm text-muted-foreground">2.3 MB</span>
              </div>
            </div>

            <Button 
              onClick={() => handleSync("cloud")}
              disabled={syncMutation.isPending}
              variant="outline"
              className="w-full"
              data-testid="button-sync-cloud"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {syncMutation.isPending ? "Syncing..." : "Backup Now"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { target: "Government Portal", status: "Success", time: "2 min ago", records: 156 },
              { target: "Cloud Backup", status: "Success", time: "1 hour ago", records: 298 },
              { target: "Government Portal", status: "Success", time: "Yesterday", records: 145 },
              { target: "Government Portal", status: "Failed", time: "2 days ago", records: 0 },
            ].map((sync, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`sync-history-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    sync.status === "Success" ? "bg-success" : "bg-destructive"
                  }`}></div>
                  <div>
                    <div className="font-medium text-foreground">{sync.target}</div>
                    <div className="text-sm text-muted-foreground">{sync.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {sync.records > 0 ? `${sync.records} records` : "0 records"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sync.status}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={sync.status === "Success" ? "default" : "destructive"}
                    className={sync.status === "Success" ? "bg-success text-success-foreground" : ""}
                  >
                    {sync.status}
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