import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Brain,
  Building2,
  Mail,
  MapPin,
  Briefcase,
  Tag,
  Activity,
  Send,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const intentColors: Record<string, string> = {
  buying_intent: "#10B981",
  research_intent: "#F59E0B",
  comparison: "#7B61FF",
  complaint: "#EF4444",
  recommendation: "#00D4FF",
  job_seeking: "#EC4899",
  general: "#8B95A5",
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadId = parseInt(id ?? "0");
  const { data: lead, isLoading } = trpc.lead.get.useQuery({ id: leadId });
  const [outreachType, setOutreachType] = useState<"cold_email" | "linkedin_message" | "twitter_dm" | "call_script">("cold_email");
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const utils = trpc.useUtils();
  const toggleBookmark = trpc.lead.toggleBookmark.useMutation({
    onSuccess: () => {
      utils.lead.get.invalidate({ id: leadId });
      utils.lead.list.invalidate();
    },
  });

  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: () => utils.lead.get.invalidate({ id: leadId }),
  });

  const generateMutation = trpc.outreach.generateMessage.useMutation({
    onSuccess: (data) => {
      if (data) {
        setGeneratedMessage(`Subject: ${data.subject}\n\n${data.body}`);
      }
      setGenerating(false);
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    generateMutation.mutate({
      orgId: 1,
      leadId,
      type: outreachType,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-[#8B95A5]">Lead not found</p>
        <button
          onClick={() => navigate("/leads")}
          className="mt-4 text-[#00D4FF] text-[13px] hover:underline"
        >
          Back to leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/leads")}
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B95A5]" />
          </button>
          <div>
            <h1 className="font-['Space_Grotesk'] font-medium text-[22px] text-[#F0F4F8]">
              {lead.authorName || "Unknown"}
            </h1>
            {lead.companyName && (
              <p className="text-[13px] text-[#8B95A5]">{lead.companyName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark.mutate({ id: lead.id })}
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 ${
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
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-[#8B95A5]" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Post */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase"
                style={{
                  backgroundColor: `${intentColors[lead.intentType]}15`,
                  color: intentColors[lead.intentType],
                }}
              >
                {lead.intentType.replace("_", " ")}
              </span>
              <span className="text-[11px] text-[#4A5568]">
                {lead.platform} • {new Date(lead.discoveredAt).toLocaleDateString()}
              </span>
            </div>
            {lead.title && (
              <h2 className="text-[16px] font-medium text-[#F0F4F8] mb-3">
                {lead.title}
              </h2>
            )}
            <p className="text-[14px] text-[#8B95A5] leading-relaxed whitespace-pre-wrap">
              {lead.content}
            </p>
          </div>

          {/* AI Explanation */}
          <div className="p-6 rounded-xl bg-[#00D4FF]/[0.03] border border-[#00D4FF]/10">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="font-['Space_Grotesk'] font-medium text-[14px] text-[#00D4FF]">
                AI Intent Analysis
              </h3>
            </div>
            <p className="text-[13px] text-[#8B95A5] leading-relaxed">
              {lead.aiExplanation}
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="text-[11px] text-[#4A5568]">Intent Score</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${lead.intentScore}%`,
                        backgroundColor:
                          lead.intentScore >= 70
                            ? "#10B981"
                            : lead.intentScore >= 40
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-[#F0F4F8]">
                    {lead.intentScore}/100
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[#4A5568]">Sentiment</span>
                <p className="text-[13px] text-[#F0F4F8] mt-1 capitalize">
                  {lead.sentiment.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#8B95A5]" />
              <h3 className="font-['Space_Grotesk'] font-medium text-[14px] text-[#F0F4F8]">
                Activity Timeline
              </h3>
            </div>
            <div className="space-y-3">
              {lead.activities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00D4FF] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] text-[#F0F4F8]">{activity.description}</p>
                    <p className="text-[11px] text-[#4A5568]">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!lead.activities || lead.activities.length === 0) && (
                <p className="text-[13px] text-[#8B95A5]">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrichment Data */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#8B95A5]" />
              <h3 className="font-['Space_Grotesk'] font-medium text-[14px] text-[#F0F4F8]">
                Lead Profile
              </h3>
            </div>
            <div className="space-y-3">
              {lead.jobTitle && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#4A5568]" />
                  <span className="text-[12px] text-[#8B95A5]">{lead.jobTitle}</span>
                </div>
              )}
              {lead.companyIndustry && (
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#4A5568]" />
                  <span className="text-[12px] text-[#8B95A5]">{lead.companyIndustry}</span>
                </div>
              )}
              {lead.companySize && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#4A5568]" />
                  <span className="text-[12px] text-[#8B95A5]">{lead.companySize} employees</span>
                </div>
              )}
              {lead.companyLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#4A5568]" />
                  <span className="text-[12px] text-[#8B95A5]">{lead.companyLocation}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#4A5568]" />
                  <span className="text-[12px] text-[#00D4FF]">{lead.email}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <span className="text-[11px] text-[#4A5568]">Status</span>
              <select
                value={lead.status}
                onChange={(e) =>
                  updateStatus.mutate({ id: lead.id, status: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="responded">Responded</option>
                <option value="converted">Converted</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* AI Outreach Generator */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="font-['Space_Grotesk'] font-medium text-[14px] text-[#F0F4F8]">
                AI Outreach
              </h3>
            </div>
            <select
              value={outreachType}
              onChange={(e) => setOutreachType(e.target.value as typeof outreachType)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-[#F0F4F8] focus:outline-none mb-3"
            >
              <option value="cold_email">Cold Email</option>
              <option value="linkedin_message">LinkedIn Message</option>
              <option value="twitter_dm">Twitter DM</option>
              <option value="call_script">Call Script</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[12px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Message"
              )}
            </button>

            {generatedMessage && (
              <div className="mt-4 p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[12px] text-[#8B95A5] whitespace-pre-wrap leading-relaxed">
                  {generatedMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
