import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cognitiveDistortions, getCognitiveDistortionById } from "@/lib/cognitiveDistortions";

export default function Analyze() {
  const [dateFilter, setDateFilter] = useState("7days");

  const getDateRange = (filter) => {
    const now = new Date();
    switch (filter) {
      case "today":
        return {
          from: format(startOfDay(now), 'yyyy-MM-dd'),
          to: format(endOfDay(now), 'yyyy-MM-dd'),
        };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return {
          from: format(startOfDay(yesterday), 'yyyy-MM-dd'),
          to: format(endOfDay(yesterday), 'yyyy-MM-dd'),
        };
      case "7days":
        return {
          from: format(subDays(now, 6), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
        };
      case "30days":
        return {
          from: format(subDays(now, 29), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
        };
    }
  };

  const dateRange = getDateRange(dateFilter);

  const { data: thoughts = [], isLoading } = useQuery({
    queryKey: ["/api/thoughts", dateRange.from, dateRange.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });
      const response = await fetch(`https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/thoughts?${params}`, {
        credentials: "include",
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      return response.json();
    },
  });

  const stats = useMemo(() => {
    if (!thoughts.length) {
      return {
        totalThoughts: 0,
        avgPerDay: 0,
        avgIntensity: 0,
        topCategory: "None",
      };
    }

    const days = dateFilter === "today" || dateFilter === "yesterday" ? 1 : 
                 dateFilter === "7days" ? 7 : 30;
    
    const avgIntensity = thoughts.reduce((sum, t) => sum + t.intensity, 0) / thoughts.length;
    
    const categoryCount = thoughts.reduce((acc, thought) => {
      acc[thought.cognitiveDistortion] = (acc[thought.cognitiveDistortion] || 0) + 1;
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

    return {
      totalThoughts: thoughts.length,
      avgPerDay: Number((thoughts.length / days).toFixed(1)),
      avgIntensity: Number(avgIntensity.toFixed(1)),
      topCategory: getCognitiveDistortionById(topCategory)?.name || topCategory,
    };
  }, [thoughts, dateFilter]);

  const dailyData = useMemo(() => {
    const dailyCount = thoughts.reduce((acc, thought) => {
      const date = format(new Date(thought.createdAt), 'MMM dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyCount).map(([date, count]) => ({
      date,
      count,
    }));
  }, [thoughts]);

  const categoryData = useMemo(() => {
    const categoryCount = thoughts.reduce((acc, thought) => {
      const distortion = getCognitiveDistortionById(thought.cognitiveDistortion);
      const name = distortion?.name || thought.cognitiveDistortion;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [thoughts]);

  const COLORS = ['#4FD1C7', '#2DD4BF', '#06B6D4', '#0891B2', '#0E7490'];

  const filterButtons = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "7days", label: "Last 7 days" },
    { id: "30days", label: "Last 30 days" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="app-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 app-text-primary">Analysis Period</h2>
        <div className="grid grid-cols-2 gap-3">
          {filterButtons.map((button) => (
            <Button
              key={button.id}
              onClick={() => setDateFilter(button.id)}
              variant={dateFilter === button.id ? "default" : "secondary"}
              className={
                dateFilter === button.id
                  ? "app-primary-bg hover:app-primary-bg-hover text-white"
                  : "app-surface-light hover:app-surface-light app-text-primary"
              }
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="app-surface rounded-2xl p-4">
          <h3 className="text-sm font-medium app-text-secondary mb-1">Total Thoughts</h3>
          <p className="text-2xl font-bold app-text-primary">{stats.totalThoughts}</p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <h3 className="text-sm font-medium app-text-secondary mb-1">Avg Per Day</h3>
          <p className="text-2xl font-bold app-text-primary">{stats.avgPerDay}</p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <h3 className="text-sm font-medium app-text-secondary mb-1">Avg Intensity</h3>
          <p className="text-2xl font-bold app-text-primary">{stats.avgIntensity}/10</p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <h3 className="text-sm font-medium app-text-secondary mb-1">Top Pattern</h3>
          <p className="text-xs font-medium app-text-primary leading-tight">{stats.topCategory}</p>
        </div>
      </div>

      {/* Daily Trend Chart */}
      {dailyData.length > 0 && (
        <div className="app-surface rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 app-text-primary">Daily Thoughts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Bar dataKey="count" fill="#4FD1C7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cognitive Distortion Breakdown */}
      {categoryData.length > 0 && (
        <div className="app-surface rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 app-text-primary">Cognitive Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData.slice(0, 5)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {categoryData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm app-text-primary truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium app-text-secondary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Thoughts */}
      <div className="app-surface rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 app-text-primary">Recent Thoughts</h3>
        {thoughts.length === 0 ? (
          <div className="text-center py-8 app-text-secondary">
            No thoughts recorded for this period.
          </div>
        ) : (
          <div className="space-y-3">
            {thoughts.slice(0, 10).map((thought) => {
              const distortion = getCognitiveDistortionById(thought.cognitiveDistortion);
              return (
                <div key={thought.id} className="app-surface-light rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="app-text-secondary">
                      {format(new Date(thought.createdAt), "MMM d, h:mm a")}
                    </span>
                    <span className="bg-primary/20 app-primary px-2 py-1 rounded-full text-xs">
                      {thought.intensity}/10
                    </span>
                  </div>
                  <div className="font-medium mb-1 app-text-primary">
                    {distortion?.name || thought.cognitiveDistortion}
                  </div>
                  <div className="app-text-primary text-sm mb-2 line-clamp-2">
                    {thought.content}
                  </div>
                  {thought.trigger && (
                    <div className="app-text-secondary text-xs">Trigger: {thought.trigger}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}