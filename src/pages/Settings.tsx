import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Save,
  Loader2,
  Check,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [orgName, setOrgName] = useState("Demo Organization");
  const [orgIndustry, setOrgIndustry] = useState("Technology");
  const [orgSize, setOrgSize] = useState("20-50");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [hotLeadAlerts, setHotLeadAlerts] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h1 className="font-['Space_Grotesk'] font-medium text-[28px] text-[#F0F4F8] mb-8">
        Settings
      </h1>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-[200px] flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                activeTab === tab.id
                  ? "bg-[#00D4FF]/10 text-[#00D4FF] font-medium"
                  : "text-[#8B95A5] hover:text-[#F0F4F8] hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none focus:border-[#00D4FF]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#8B95A5] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === "organization" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
                  Organization Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none focus:border-[#00D4FF]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Industry</label>
                    <input
                      type="text"
                      value={orgIndustry}
                      onChange={(e) => setOrgIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none focus:border-[#00D4FF]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#8B95A5] mb-1.5 block">Company Size</label>
                    <select
                      value={orgSize}
                      onChange={(e) => setOrgSize(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] focus:outline-none"
                    >
                      <option>1-10</option>
                      <option>10-50</option>
                      <option>50-200</option>
                      <option>200-500</option>
                      <option>500-1000</option>
                      <option>1000+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Alerts", desc: "Receive daily email digests of new leads", state: emailAlerts, setState: setEmailAlerts },
                    { label: "Slack Integration", desc: "Get real-time notifications in Slack", state: slackAlerts, setState: setSlackAlerts },
                    { label: "Hot Lead Alerts", desc: "Instant alerts for leads with intent score >80", state: hotLeadAlerts, setState: setHotLeadAlerts },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[#F0F4F8]">{item.label}</p>
                        <p className="text-[11px] text-[#8B95A5]">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.setState(!item.state)}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          item.state ? "bg-[#00D4FF]" : "bg-white/[0.1]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            item.state ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[#F0F4F8]">Two-Factor Authentication</p>
                      <p className="text-[11px] text-[#8B95A5]">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/[0.15] text-[12px] text-[#F0F4F8] hover:border-white/30 transition-colors">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-white/[0.04]">
                    <div>
                      <p className="text-[13px] font-medium text-[#F0F4F8]">Session Management</p>
                      <p className="text-[11px] text-[#8B95A5]">Manage your active sessions</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/[0.15] text-[12px] text-[#F0F4F8] hover:border-white/30 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="font-['Space_Grotesk'] font-medium text-[16px] text-[#F0F4F8] mb-6">
                  API Keys
                </h3>
                <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#F0F4F8]">Production API Key</p>
                      <p className="text-[11px] text-[#8B95A5] mt-0.5">
                        Use this key to authenticate API requests
                      </p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/[0.15] text-[12px] text-[#F0F4F8] hover:border-white/30 transition-colors">
                      Reveal
                    </button>
                  </div>
                  <div className="mt-3 px-3 py-2 rounded bg-white/[0.03] border border-white/[0.06]">
                    <code className="text-[11px] text-[#4A5568] font-mono">
                      ln_live_••••••••••••••••••••••••
                    </code>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#F0F4F8]">Webhook Secret</p>
                      <p className="text-[11px] text-[#8B95A5] mt-0.5">
                        For verifying webhook signatures
                      </p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/[0.15] text-[12px] text-[#F0F4F8] hover:border-white/30 transition-colors">
                      Reveal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[13px] hover:bg-[#33DDFF] transition-colors"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
