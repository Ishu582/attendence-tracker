import type { WeeklyAttendance } from "@shared/schema";

interface WeeklyChartProps {
  data: WeeklyAttendance[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.present + d.absent));

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success rounded-full"></div>
          <span className="text-sm text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-full"></div>
          <span className="text-sm text-muted-foreground">Absent</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((dayData, index) => {
          const total = dayData.present + dayData.absent;
          const presentHeight = maxTotal > 0 ? (dayData.present / maxTotal) * 100 : 0;
          const absentHeight = maxTotal > 0 ? (dayData.absent / maxTotal) * 100 : 0;

          return (
            <div 
              key={dayData.day} 
              className="flex-1 flex flex-col items-center"
              data-testid={`chart-day-${dayData.day.toLowerCase()}`}
            >
              <div className="w-full max-w-12 flex flex-col items-center gap-1 h-full justify-end">
                <div 
                  className="w-full bg-destructive rounded-t chart-bar" 
                  style={{ height: `${absentHeight}%` }}
                  data-testid={`bar-absent-${dayData.day.toLowerCase()}`}
                ></div>
                <div 
                  className="w-full bg-success rounded-b chart-bar" 
                  style={{ height: `${presentHeight}%` }}
                  data-testid={`bar-present-${dayData.day.toLowerCase()}`}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {dayData.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
