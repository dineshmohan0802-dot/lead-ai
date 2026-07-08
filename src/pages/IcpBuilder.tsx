import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Target,
  Sparkles,
  Plus,
  X,
  Save,
  Loader2,
  Building2,
  Users,
  MapPin,
  Code2,
  FolderOpen,
  Crown,
  KeyRound,
  Ban,
  AlertTriangle,
} from "lucide-react";

export default function IcpBuilder() {
  const { data: icp, isLoading } = trpc.icp.get.useQuery({ orgId: 1 });
  const upsertMutation = trpc.icp.upsert.useMutation({
    onSuccess: () => utils.icp.get.invalidate({ orgId: 1 }),
  });
  const generateMutation = trpc.icp.generateAI.useMutation({
    onSuccess: (data) => {
      if (data) {
        setIndustries(data.industries ?? []);
        setCompanySizes(data.companySizes ?? []);
        setJobTitles(data.jobTitles ?? []);
        setPainPoints(data.painPoints ?? []);
        setBuyingKeywords(data.buyingKeywords ?? []);
        setTechnologies(data.technologies ?? []);
        setDepartments(data.departments ?? []);
        setCountries(data.countries ?? []);
        setRevenueRange(data.revenueRange ?? "");
        setCompetitorTriggers([]);
        setNegativeKeywords([]);
      }
      setGenerating(false);
    },
  });
  const utils = trpc.useUtils();

  const [industries, setIndustries] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [revenueRange, setRevenueRange] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [buyingKeywords, setBuyingKeywords] = useState<string[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([]);
  const [competitorTriggers, setCompetitorTriggers] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [orgDesc, setOrgDesc] = useState("");
  const [productDesc, setProductDesc] = useState("");

  useEffect(() => {
    if (icp) {
      try { setIndustries(JSON.parse(icp.industries as string || "[]")); } catch { setIndustries([]); }
      try { setCompanySizes(JSON.parse(icp.companySizes as string || "[]")); } catch { setCompanySizes([]); }
      try { setCountries(JSON.parse(icp.countries as string || "[]")); } catch { setCountries([]); }
      try { setTechnologies(JSON.parse(icp.technologies as string || "[]")); } catch { setTechnologies([]); }
      try { setDepartments(JSON.parse(icp.departments as string || "[]")); } catch { setDepartments([]); }
      try { setJobTitles(JSON.parse(icp.jobTitles as string || "[]")); } catch { setJobTitles([]); }
      try { setBuyingKeywords(JSON.parse(icp.buyingKeywords as string || "[]")); } catch { setBuyingKeywords([]); }
      try { setNegativeKeywords(JSON.parse(icp.negativeKeywords as string || "[]")); } catch { setNegativeKeywords([]); }
      try { setCompetitorTriggers(JSON.parse(icp.competitorTriggers as string || "[]")); } catch { setCompetitorTriggers([]); }
      try { setPainPoints(JSON.parse(icp.painPoints as string || "[]")); } catch { setPainPoints([]); }
      setRevenueRange(icp.revenueRange ?? "");
    }
  }, [icp]);

  const handleSave = () => {
    upsertMutation.mutate({
      orgId: 1,
      industries,
      companySizes,
      countries,
      revenueRange,
      technologies,
      departments,
      jobTitles,
      buyingKeywords,
      negativeKeywords,
      competitorTriggers,
      painPoints,
    });
  };

  const handleGenerate = () => {
    if (!orgDesc || !productDesc) return;
    setGenerating(true);
    generateMutation.mutate({
      organizationDescription: orgDesc,
      productDescription: productDesc,
    });
  };

  const TagInput = ({
    label,
    icon: Icon,
    tags,
    setTags,
    placeholder,
  }: {
    label: string;
    icon: React.ElementType;
    tags: string[];
    setTags: (t: string[]) => void;
    placeholder: string;
  }) => {
    const [input, setInput] = useState("");
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-3.5 h-3.5 text-[#8B95A5]" />
          <span className="text-[13px] font-medium text-[#F0F4F8]">{label}</span>
        </div>
        <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] min-h-[44px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#00D4FF]/10 text-[#00D4FF] text-[11px]"
            >
              {tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                setTags([...tags, input.trim()]);
                setInput("");
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[80px] bg-transparent text-[12px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8]">
            AI ICP Builder
          </h1>
          <p className="text-[14px] text-[#8B95A5] mt-1">
            Define your ideal customer profile for AI-powered lead scoring
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[13px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50"
        >
          {upsertMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save ICP
        </button>
      </div>

      {/* AI Generate Section */}
      <div className="p-6 rounded-xl bg-[#00D4FF]/[0.03] border border-[#00D4FF]/10 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          <h3 className="font-['Space_Grotesk'] font-medium text-[14px] text-[#00D4FF]">
            Auto-Generate with AI
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Describe your organization..."
            value={orgDesc}
            onChange={(e) => setOrgDesc(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
          />
          <input
            type="text"
            placeholder="Describe your product/service..."
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !orgDesc || !productDesc}
          className="px-5 py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[13px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate ICP Suggestions
        </button>
      </div>

      {/* ICP Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TagInput
          label="Industries"
          icon={Building2}
          tags={industries}
          setTags={setIndustries}
          placeholder="Add industry..."
        />
        <TagInput
          label="Company Sizes"
          icon={Users}
          tags={companySizes}
          setTags={setCompanySizes}
          placeholder="e.g. 10-50, 50-200..."
        />
        <TagInput
          label="Countries"
          icon={MapPin}
          tags={countries}
          setTags={setCountries}
          placeholder="Add country..."
        />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-3.5 h-3.5 text-[#8B95A5]" />
            <span className="text-[13px] font-medium text-[#F0F4F8]">Revenue Range</span>
          </div>
          <input
            type="text"
            value={revenueRange}
            onChange={(e) => setRevenueRange(e.target.value)}
            placeholder="e.g. $1M - $50M"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none"
          />
        </div>
        <TagInput
          label="Technologies"
          icon={Code2}
          tags={technologies}
          setTags={setTechnologies}
          placeholder="e.g. Salesforce, HubSpot..."
        />
        <TagInput
          label="Departments"
          icon={FolderOpen}
          tags={departments}
          setTags={setDepartments}
          placeholder="e.g. Sales, Marketing..."
        />
        <TagInput
          label="Job Titles"
          icon={Crown}
          tags={jobTitles}
          setTags={setJobTitles}
          placeholder="e.g. VP Sales, CMO..."
        />
        <TagInput
          label="Buying Keywords"
          icon={KeyRound}
          tags={buyingKeywords}
          setTags={setBuyingKeywords}
          placeholder="e.g. looking for, alternative to..."
        />
        <TagInput
          label="Negative Keywords"
          icon={Ban}
          tags={negativeKeywords}
          setTags={setNegativeKeywords}
          placeholder="e.g. free, open source only..."
        />
        <TagInput
          label="Competitor Triggers"
          icon={Target}
          tags={competitorTriggers}
          setTags={setCompetitorTriggers}
          placeholder="e.g. HubSpot, Salesforce..."
        />
        <TagInput
          label="Pain Points"
          icon={AlertTriangle}
          tags={painPoints}
          setTags={setPainPoints}
          placeholder="e.g. Manual prospecting..."
        />
      </div>
    </div>
  );
}
