import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Send,
  Mail,
  MessageSquare,
  Twitter,
  Phone,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  FileText,
} from "lucide-react";

const outreachTypes = [
  { id: "cold_email" as const, label: "Cold Email", icon: Mail },
  { id: "linkedin_message" as const, label: "LinkedIn", icon: MessageSquare },
  { id: "twitter_dm" as const, label: "Twitter DM", icon: Twitter },
  { id: "call_script" as const, label: "Call Script", icon: Phone },
];

export default function Outreach() {
  const [selectedType, setSelectedType] = useState<"cold_email" | "linkedin_message" | "twitter_dm" | "call_script">("cold_email");
  const [leadContext, setLeadContext] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateMutation = trpc.outreach.generateMessage.useMutation({
    onSuccess: (data) => {
      if (data) {
        setGenerated(data.body);
        setSubject(data.subject ?? "");
      }
      setGenerating(false);
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    // Use a mock leadId=1 for the playground
    generateMutation.mutate({
      orgId: 1,
      leadId: 1,
      type: selectedType,
      customInstructions: `Context: ${leadContext}. Company: ${companyName}. Prospect: ${prospectName}.`,
    });
  };

  const handleCopy = () => {
    if (generated) {
      navigator.clipboard.writeText(subject ? `Subject: ${subject}\n\n${generated}` : generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8]">
          AI Outreach Generator
        </h1>
        <p className="text-[14px] text-[#8B95A5] mt-1">
          Generate personalized outreach messages with AI
        </p>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 mb-6">
        {outreachTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              selectedType === type.id
                ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20"
                : "bg-white/[0.02] text-[#8B95A5] border border-white/[0.06] hover:text-[#F0F4F8]"
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Prospect Name</label>
            <input
              type="text"
              value={prospectName}
              onChange={(e) => setProspectName(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. TechFlow Inc"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Lead Context</label>
            <textarea
              value={leadContext}
              onChange={(e) => setLeadContext(e.target.value)}
              placeholder="Paste the prospect's post or context here..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30 resize-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !leadContext}
            className="w-full py-3 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[14px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Message
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B95A5]" />
              <span className="text-[13px] font-medium text-[#F0F4F8]">Generated Message</span>
            </div>
            {generated && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#8B95A5] hover:text-[#F0F4F8] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#10B981]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] min-h-[400px]">
            {generated ? (
              <div className="space-y-4">
                {subject && (
                  <div>
                    <span className="text-[11px] text-[#4A5568] uppercase tracking-wide">Subject</span>
                    <p className="text-[14px] text-[#F0F4F8] mt-1 font-medium">{subject}</p>
                  </div>
                )}
                <div>
                  <span className="text-[11px] text-[#4A5568] uppercase tracking-wide">Message</span>
                  <p className="text-[13px] text-[#8B95A5] mt-2 whitespace-pre-wrap leading-relaxed">
                    {generated}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Send className="w-10 h-10 text-[#4A5568] mb-3" />
                <p className="text-[14px] text-[#8B95A5]">
                  Fill in the details and click generate
                </p>
                <p className="text-[12px] text-[#4A5568] mt-1">
                  AI will create a personalized message
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
