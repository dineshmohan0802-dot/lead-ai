import { useEffect, useRef } from "react";
import { trpc } from "@/providers/trpc";
import {
  Users,
  TrendingUp,
  Target,
  Activity,
  ArrowUpRight,
  Flame,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import gsap from "gsap";

const COLORS = ["#00D4FF", "#7B61FF", "#FF6B35", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery({ orgId: 1 });
  const { data: timeline } = trpc.dashboard.intentTimeline.useQuery({ orgId: 1, days: 30 });
  const { data: topics } = trpc.dashboard.trendingTopics.useQuery({ orgId: 1 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dash-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const timelineData = timeline?.map((t) => ({
    date: t.date.slice(5),
    leads: t.count,
    avgScore: Math.round(t.avgScore ?? 0),
  })) ?? [];

  const platformData = stats?.byPlatform.map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    value: p.count,
  })) ?? [];

  return (
    <div ref={ref} className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8]">
          Dashboard
        </h1>
        <p className="text-[14px] text-[#8B95A5] mt-1">
          Overview of your lead intelligence pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Leads",
            value: stats?.totalLeads ?? 0,
            change: "+12%",
            icon: Users,
            color: "#00D4FF",
          },
          {
            label: "High Intent",
            value: stats?.highIntent ?? 0,
            change: "+8%",
            icon: Target,
            color: "#10B981",
          },
          {
            label: "Medium Intent",
            value: stats?.mediumIntent ?? 0,
            change: "+15%",
            icon: TrendingUp,
            color: "#F59E0B",
          },
          {
            label: "New Today",
            value: stats?.newToday ?? 0,
            change: "+3",
            icon: Activity,
            color: "#7B61FF",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="dash-card p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <span className="flex items-center gap-1 text-[12px] text-[#10B981]">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8] mt-3">
              {stat.value}
            </p>
            <p className="text-[13px] text-[#8B95A5]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Intent Timeline */}
        <div className="dash-card lg:col-span-2 p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8]">
              Intent Timeline
            </h3>
            <span className="text-[12px] text-[#8B95A5]">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#4A5568" fontSize={11} tickLine={false} />
              <YAxis stroke="#4A5568" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#8B95A5" }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#00D4FF"
                fillOpacity={1}
                fill="url(#colorLeads)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="dash-card p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
            By Platform
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                {platformData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {platformData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[11px] text-[#8B95A5]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <div className="dash-card p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8]">
              Trending Topics
            </h3>
          </div>
          <div className="space-y-3">
            {topics?.slice(0, 8).map((topic, i) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#4A5568] w-5">{i + 1}</span>
                  <span className="text-[13px] text-[#F0F4F8] capitalize">{topic.topic}</span>
                </div>
                <span className="text-[12px] text-[#8B95A5]">{topic.count} mentions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-card p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-[#00D4FF]" />
            <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8]">
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00D4FF] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] text-[#F0F4F8]">{activity.description}</p>
                  <p className="text-[11px] text-[#8B95A5] mt-0.5">
                    {new Date(activity.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
              <p className="text-[13px] text-[#8B95A5]">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
