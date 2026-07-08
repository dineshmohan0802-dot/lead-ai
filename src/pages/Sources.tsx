import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Globe,
  Plus,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  MessageSquare,
  Linkedin,
  Twitter,
  Github,
  Search,
} from "lucide-react";

const platformIcons: Record<string, React.ElementType> = {
  reddit: MessageSquare,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  producthunt: Globe,
  hackernews: Globe,
  quora: Search,
};

const platformColors: Record<string, string> = {
  reddit: "#FF4500",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  github: "#8B949E",
  producthunt: "#DA552F",
  hackernews: "#FF6600",
  quora: "#B92B27",
};

export default function Sources() {
  const { data: sources, isLoading } = trpc.source.list.useQuery({ orgId: 1 });
  const utils = trpc.useUtils();
  const createMutation = trpc.source.create.useMutation({
    onSuccess: () => {
      utils.source.list.invalidate({ orgId: 1 });
      setShowCreate(false);
      setNewName("");
      setNewPlatform("reddit");
      setNewType("keyword");
    },
  });
  const updateMutation = trpc.source.update.useMutation({
    onSuccess: () => utils.source.list.invalidate({ orgId: 1 }),
  });
  const deleteMutation = trpc.source.delete.useMutation({
    onSuccess: () => utils.source.list.invalidate({ orgId: 1 }),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState("reddit");
  const [newType, setNewType] = useState<"keyword" | "competitor" | "brand" | "account" | "subreddit">("keyword");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8]">
            Data Sources
          </h1>
          <p className="text-[14px] text-[#8B95A5] mt-1">
            Manage your monitoring sources across platforms
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[13px] hover:bg-[#33DDFF] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#111827] border border-white/[0.06] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8]">
                Add Monitoring Source
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded-lg hover:bg-white/[0.04]"
              >
                <X className="w-4 h-4 text-[#8B95A5]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Source Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. CRM Alternatives"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
                >
                  <option value="reddit">Reddit</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="github">GitHub</option>
                  <option value="producthunt">Product Hunt</option>
                  <option value="hackernews">Hacker News</option>
                  <option value="quora">Quora</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as typeof newType)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
                >
                  <option value="keyword">Keyword</option>
                  <option value="competitor">Competitor</option>
                  <option value="brand">Brand</option>
                  <option value="account">Account</option>
                  <option value="subreddit">Subreddit</option>
                </select>
              </div>
              <button
                onClick={() =>
                  createMutation.mutate({
                    orgId: 1,
                    name: newName,
                    platform: newPlatform,
                    type: newType,
                  })
                }
                disabled={!newName || createMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[13px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Source
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources?.map((source) => {
          const Icon = platformIcons[source.platform] ?? Globe;
          const color = platformColors[source.platform] ?? "#8B95A5";
          return (
            <div
              key={source.id}
              className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-[#F0F4F8]">
                      {source.name}
                    </h3>
                    <p className="text-[11px] text-[#8B95A5] capitalize">
                      {source.platform} • {source.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateMutation.mutate({
                        id: source.id,
                        isActive: !source.isActive,
                      })
                    }
                    className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    {source.isActive ? (
                      <ToggleRight className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[#4A5568]" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this source?")) {
                        deleteMutation.mutate({ id: source.id });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[#8B95A5] hover:text-[#EF4444]" />
                  </button>
                </div>
              </div>

              {source.lastScrapedAt && (
                <p className="text-[11px] text-[#4A5568] mt-3">
                  Last scraped: {new Date(source.lastScrapedAt).toLocaleString()}
                </p>
              )}

              <div className="mt-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    source.isActive
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : "bg-[#4A5568]/10 text-[#4A5568]"
                  }`}
                >
                  {source.isActive ? "Active" : "Paused"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {(!sources || sources.length === 0) && (
        <div className="text-center py-20">
          <Globe className="w-10 h-10 text-[#4A5568] mx-auto mb-4" />
          <p className="text-[16px] text-[#8B95A5]">No sources yet</p>
          <p className="text-[13px] text-[#4A5568] mt-1">
            Add your first monitoring source to start discovering leads
          </p>
        </div>
      )}
    </div>
  );
}
