import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Linkedin,
  Twitter,
  Github,
  Globe,
} from "lucide-react";

const platformIcons: Record<string, React.ElementType> = {
  reddit: MessageSquare,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  producthunt: Globe,
  hackernews: Globe,
  quora: Globe,
};

const intentColors: Record<string, string> = {
  buying_intent: "#10B981",
  research_intent: "#F59E0B",
  comparison: "#7B61FF",
  complaint: "#EF4444",
  recommendation: "#00D4FF",
  job_seeking: "#EC4899",
  general: "#8B95A5",
};

const sentimentIcons: Record<string, React.ElementType> = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
  frustrated: TrendingDown,
  excited: TrendingUp,
  curious: TrendingUp,
  urgent: TrendingUp,
  buying_ready: TrendingUp,
};

export default function Leads() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [intentType, setIntentType] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = trpc.lead.list.useQuery({
    orgId: 1,
    limit: 50,
    search: search || undefined,
    platform: platform || undefined,
    intentType: intentType || undefined,
    status: status || undefined,
  });

  const utils = trpc.useUtils();
  const toggleBookmark = trpc.lead.toggleBookmark.useMutation({
    onSuccess: () => utils.lead.list.invalidate(),
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8]">
            Lead Discovery
          </h1>
          <p className="text-[14px] text-[#8B95A5] mt-1">
            {data?.leads.length ?? 0} leads found
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#8B95A5] hover:text-[#F0F4F8] hover:border-white/[0.1] transition-all text-[13px]"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
        <input
          type="text"
          placeholder="Search by name, company, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30 transition-colors"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
          >
            <option value="">All Platforms</option>
            <option value="reddit">Reddit</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="github">GitHub</option>
            <option value="producthunt">Product Hunt</option>
            <option value="hackernews">Hacker News</option>
            <option value="quora">Quora</option>
          </select>
          <select
            value={intentType}
            onChange={(e) => setIntentType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
          >
            <option value="">All Intent Types</option>
            <option value="buying_intent">Buying Intent</option>
            <option value="research_intent">Research Intent</option>
            <option value="comparison">Comparison</option>
            <option value="complaint">Complaint</option>
            <option value="recommendation">Recommendation</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="converted">Converted</option>
          </select>
          <button
            onClick={() => { setPlatform(""); setIntentType(""); setStatus(""); setSearch(""); }}
            className="px-3 py-2 text-[13px] text-[#8B95A5] hover:text-[#F0F4F8] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Lead List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.leads.map((lead) => {
            const PlatformIcon = platformIcons[lead.platform] ?? Globe;
            const SentimentIcon = sentimentIcons[lead.sentiment] ?? Minus;
            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00D4FF]/20 hover:bg-white/[0.03] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <PlatformIcon className="w-3.5 h-3.5 text-[#8B95A5]" />
                      <span className="text-[11px] text-[#8B95A5] uppercase tracking-wide">
                        {lead.platform}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: `${intentColors[lead.intentType]}15`,
                          color: intentColors[lead.intentType],
                        }}
                      >
                        {lead.intentType.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-[#4A5568]">
                        {new Date(lead.discoveredAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-medium text-[#F0F4F8] mb-1 truncate">
                      {lead.title || lead.content?.slice(0, 100)}
                    </h3>

                    <p className="text-[13px] text-[#8B95A5] line-clamp-2 leading-relaxed">
                      {lead.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      {lead.authorName && (
                        <span className="text-[12px] text-[#8B95A5]">
                          by{" "}
                          <span className="text-[#F0F4F8]">{lead.authorName}</span>
                        </span>
                      )}
                      {lead.companyName && (
                        <span className="text-[12px] text-[#8B95A5]">
                          at{" "}
                          <span className="text-[#F0F4F8]">{lead.companyName}</span>
                        </span>
                      )}
                      {lead.jobTitle && (
                        <span className="text-[12px] text-[#8B95A5]">
                          {lead.jobTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            lead.intentScore >= 70
                              ? "#10B98115"
                              : lead.intentScore >= 40
                              ? "#F59E0B15"
                              : "#EF444415",
                        }}
                      >
                        <span
                          className="text-[13px] font-medium"
                          style={{
                            color:
                              lead.intentScore >= 70
                                ? "#10B981"
                                : lead.intentScore >= 40
                                ? "#F59E0B"
                                : "#EF4444",
                          }}
                        >
                          {lead.intentScore}
                        </span>
                      </div>
                      <SentimentIcon
                        className="w-4 h-4"
                        style={{
                          color:
                            lead.sentimentScore > 0
                              ? "#10B981"
                              : lead.sentimentScore < 0
                              ? "#EF4444"
                              : "#8B95A5",
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark.mutate({ id: lead.id });
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            lead.isBookmarked
                              ? "text-[#00D4FF] fill-[#00D4FF]"
                              : "text-[#8B95A5]"
                          }`}
                        />
                      </button>
                      {lead.url && (
                        <a
                          href={lead.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#8B95A5]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {data?.leads.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-10 h-10 text-[#4A5568] mx-auto mb-4" />
              <p className="text-[16px] text-[#8B95A5]">No leads found</p>
              <p className="text-[13px] text-[#4A5568] mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
