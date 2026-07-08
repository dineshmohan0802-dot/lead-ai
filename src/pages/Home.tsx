import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Radar,
  Globe,
  Brain,
  Zap,
  Users,
  BarChart3,
  Play,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Energy Stream Canvas ─── */
function EnergyStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 7;
    const BASE_SPEED = 0.8;
    const NOISE_SCALE = 0.003;
    const GLOW_RADIUS = 15;
    const COLOR_CYCLE_SPEED = 0.2;
    const TRAIL_LENGTH = 0.15;
    const COLOR_A = [0, 212, 255];
    const COLOR_B = [123, 97, 255];
    const COLOR_C = [255, 107, 53];

    // Initialize gradients
    const grad: number[][] = [];
    const perm: number[] = [];
    for (let i = 0; i < 256; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = 1;
      grad[i] = [Math.cos(angle) * len, Math.sin(angle) * len];
    }
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function dot2(g: number[], x: number, y: number) {
      return g[0] * x + g[1] * y;
    }

    function fastNoise2D(x: number, y: number): number {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const i = ix & 255;
      const j = iy & 255;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = perm[i] + j;
      const aa = perm[a & 255];
      const ab = perm[(a + 1) & 255];
      const b = perm[(i + 1) & 255] + j;
      const ba = perm[b & 255];
      const bb = perm[(b + 1) & 255];
      const x1 = dot2(grad[aa], fx, fy);
      const x2 = dot2(grad[ba], fx - 1, fy);
      const y1 = dot2(grad[ab], fx, fy - 1);
      const y2 = dot2(grad[bb], fx - 1, fy - 1);
      const z1 = x1 + ux * (x2 - x1);
      const z2 = y1 + ux * (y2 - y1);
      return z1 + uy * (z2 - z1);
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    const particles: {
      x: number; y: number; speed: number; radius: number;
      colorOffset: number; angle: number; individualTime: number;
    }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.5 + (Math.random() - 0.5) * 100,
        speed: BASE_SPEED * (0.8 + Math.random() * 0.4),
        radius: GLOW_RADIUS * (0.8 + Math.random() * 0.4),
        colorOffset: i * 0.3,
        angle: 0,
        individualTime: Math.random() * 1000,
      });
    }

    function updateParticles(time: number) {
      if (!canvas) return;
      for (const p of particles) {
        p.individualTime += 1;
        const n =
          fastNoise2D(p.x * NOISE_SCALE, p.y * NOISE_SCALE + time * 0.0003) *
          Math.PI *
          2;
        p.angle = n;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        const dx = p.x - canvas.width * 0.5;
        const dy = p.y - canvas.height * 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > Math.min(canvas.width, canvas.height) * 0.4) {
          p.x -= (dx / dist) * 0.5;
          p.y -= (dy / dist) * 0.5;
        }
      }
    }

    function drawEnergyStream(ctx: CanvasRenderingContext2D, time: number) {
      if (!canvas) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx =
        mx > 0 && my > 0
          ? mx
          : canvas.width * 0.6 + Math.sin(time * 0.0005) * canvas.width * 0.15;
      const cy =
        my > 0 && my > 0
          ? my
          : canvas.height * 0.5 + Math.cos(time * 0.0007) * canvas.height * 0.1;

      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalizedDist = Math.min(dist / (canvas.width * 0.3), 1);
        const t = time * COLOR_CYCLE_SPEED * 0.001 + p.colorOffset;
        const c1 = (Math.sin(t) + 1) * 0.5;
        const c2 = (Math.sin(t + 2.094) + 1) * 0.5;
        const c3 = (Math.sin(t + 4.188) + 1) * 0.5;
        const total = c1 + c2 + c3;
        const r = Math.round(
          ((c1 * COLOR_A[0] + c2 * COLOR_B[0] + c3 * COLOR_C[0]) / total) *
            (1 - normalizedDist * 0.5)
        );
        const g = Math.round(
          ((c1 * COLOR_A[1] + c2 * COLOR_B[1] + c3 * COLOR_C[1]) / total) *
            (1 - normalizedDist * 0.5)
        );
        const b = Math.round(
          ((c1 * COLOR_A[2] + c2 * COLOR_B[2] + c3 * COLOR_C[2]) / total) *
            (1 - normalizedDist * 0.5)
        );

        const grad = ctx.createRadialGradient(
          p.x, p.y, 0, p.x, p.y, p.radius * 2
        );
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.5)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let raf: number;
    function animate(timestamp: number) {
      if (!ctx || !canvas) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(10, 14, 26, ${TRAIL_LENGTH})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      updateParticles(timestamp);
      drawEnergyStream(ctx, timestamp);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}

/* ─── Navigation ─── */
function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
        </div>
        <span className="font-['Space_Grotesk'] font-medium text-[15px] text-[#F0F4F8]">
          LeadNexus
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Product", "Solutions", "Pricing", "Docs"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-[14px] text-[#8B95A5] hover:text-[#F0F4F8] transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="text-[14px] text-[#8B95A5] hover:text-[#F0F4F8] transition-colors px-3 py-2"
        >
          {isAuthenticated ? "Dashboard" : "Sign In"}
        </button>
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="text-[14px] font-medium bg-[#00D4FF] text-[#0A0E1A] px-5 py-2 rounded-lg hover:bg-[#33DDFF] transition-colors"
        >
          {isAuthenticated ? "Go to App" : "Start Free"}
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function Hero() {
  const navigate = useNavigate();
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    if (badgeRef.current)
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    if (titleRef.current)
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.3"
      );
    if (subRef.current)
      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    if (ctaRef.current)
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
    return () => { tl.kill(); };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <EnergyStream />
      <div className="relative z-10 text-center px-6 max-w-[800px]">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 mb-8 opacity-0"
        >
          <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-wider text-[#00D4FF]">
            AI-Powered Lead Intelligence
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-['Space_Grotesk'] font-medium text-[clamp(40px,5.5vw,72px)] text-[#F0F4F8] leading-[1.05] tracking-[-0.02em] opacity-0"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
        >
          Find High-Intent Prospects Before Your Competitors
        </h1>

        <p
          ref={subRef}
          className="mt-6 text-[18px] text-[#8B95A5] max-w-[560px] mx-auto leading-relaxed opacity-0"
        >
          LeadNexus scans millions of social signals across Reddit, LinkedIn,
          Twitter, and GitHub to surface prospects actively searching for
          solutions like yours.
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex items-center justify-center gap-4 opacity-0"
        >
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3.5 bg-[#00D4FF] text-[#0A0E1A] font-medium rounded-lg hover:bg-[#33DDFF] transition-colors text-[16px]"
          >
            Start Free Trial
          </button>
          <button className="px-8 py-3.5 border border-white/[0.15] text-[#F0F4F8] rounded-lg hover:border-white/30 transition-all text-[16px] flex items-center gap-2">
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Trusted By ─── */
function TrustedBy() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from("span", {
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const logos = ["NOTION", "STRIPE", "LINEAR", "VERCEL", "FIGMA", "GITHUB"];
  return (
    <section
      ref={ref}
      className="bg-[#0D1219] py-10 border-y border-white/[0.04]"
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center gap-12 flex-wrap">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-[14px] font-medium text-[#4A5568] tracking-[0.08em] uppercase"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Radar,
      title: "Intent Detection",
      desc: "Our AI classifies every signal by buying intent — from casual mentions to urgent purchase requests.",
    },
    {
      icon: Globe,
      title: "Multi-Platform Coverage",
      desc: "Monitor Reddit, LinkedIn, Twitter, GitHub, Product Hunt, Hacker News, and Quora from a single dashboard.",
    },
    {
      icon: Brain,
      title: "Smart Enrichment",
      desc: "Automatically enrich leads with verified emails, job titles, company data, and technographic profiles.",
    },
    {
      icon: Zap,
      title: "Real-Time Alerts",
      desc: "Get notified the moment a high-intent prospect mentions your keywords or competitors.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      desc: "Share lead lists, assign owners, track outreach, and measure pipeline contribution per team member.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      desc: "Track conversion rates, response rates, and pipeline velocity with actionable insights.",
    },
  ];

  return (
    <section ref={ref} className="bg-[#0A0E1A] py-[120px]" id="product">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className="font-['JetBrains_Mono'] text-[11px] text-[#00D4FF] tracking-[0.15em] uppercase">
          Platform
        </span>
        <h2 className="font-['Space_Grotesk'] font-medium text-[40px] text-[#F0F4F8] max-w-[600px] mt-4 leading-[1.15]">
          Turn Social Signals Into Sales Pipeline
        </h2>
        <p className="text-[16px] text-[#8B95A5] max-w-[500px] mt-4 leading-relaxed">
          Our AI engine continuously monitors the social web, identifying
          prospects at the moment they express buying intent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card p-8 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00D4FF]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#00D4FF]/8 flex items-center justify-center group-hover:bg-[#00D4FF]/15 transition-all">
                <f.icon className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-medium text-[18px] text-[#F0F4F8] mt-5">
                {f.title}
              </h3>
              <p className="text-[14px] text-[#8B95A5] mt-3 leading-[1.6]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".step", {
        opacity: 0,
        x: -30,
        duration: 0.7,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Define Your ICP",
      desc: "Tell our AI your ideal customer profile — industries, company sizes, job titles, and the keywords that signal buying intent.",
    },
    {
      num: "02",
      title: "AI Monitoring",
      desc: "Our engine scans 50M+ posts daily across 8 platforms, surfacing only the prospects that match your criteria.",
    },
    {
      num: "03",
      title: "Engage & Convert",
      desc: "Reach out with AI-personalized messages based on the prospect's exact post context. Track responses and close deals.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-[120px]"
      style={{
        background:
          "linear-gradient(180deg, #0A0E1A 0%, #0D1117 50%, #0A0E1A 100%)",
      }}
      id="solutions"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#00D4FF] tracking-[0.15em] uppercase">
            How It Works
          </span>
          <h2 className="font-['Space_Grotesk'] font-medium text-[40px] text-[#F0F4F8] mt-4">
            From Signal to Sales Conversation in Minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          {steps.map((s, i) => (
            <div key={s.num} className="step relative">
              <span className="font-['JetBrains_Mono'] text-[48px] text-[#00D4FF]/15 font-normal">
                {s.num}
              </span>
              <h3 className="font-['Space_Grotesk'] font-medium text-[20px] text-[#F0F4F8] mt-4">
                {s.title}
              </h3>
              <p className="text-[14px] text-[#8B95A5] mt-3 leading-[1.6]">
                {s.desc}
              </p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 right-[-24px] w-12 h-[1px] bg-white/[0.06]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard Preview ─── */
function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".preview-img", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-[#0A0E1A] py-[120px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className="font-['JetBrains_Mono'] text-[11px] text-[#00D4FF] tracking-[0.15em] uppercase">
          Dashboard
        </span>
        <h2 className="font-['Space_Grotesk'] font-medium text-[40px] text-[#F0F4F8] mt-4">
          Your Command Center for Revenue Intelligence
        </h2>

        <div className="preview-img mt-12 rounded-xl border border-white/[0.08] overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.08)]">
          <img
            src="/dashboard-preview.jpg"
            alt="LeadNexus Dashboard"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { val: "50M+", label: "Social signals scanned daily" },
            { val: "8", label: "Platforms monitored" },
            { val: "3x", label: "Higher response rate vs cold email" },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="font-['Space_Grotesk'] font-medium text-[36px] text-[#F0F4F8]">
                {stat.val}
              </span>
              <p className="text-[14px] text-[#8B95A5] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      quote:
        "LeadNexus surfaced 47 qualified leads in our first week. One converted into a $24K deal. The ROI is insane.",
      name: "Sarah Chen",
      title: "VP Sales at TechFlow",
      avatar: "/avatar-1.jpg",
    },
    {
      quote:
        "We replaced three separate tools with LeadNexus. The intent scoring alone saves our SDRs 10 hours per week.",
      name: "Marcus Johnson",
      title: "Sales Ops at DataSync",
      avatar: "/avatar-2.jpg",
    },
    {
      quote:
        "The AI outreach personalization is next-level. Our response rate went from 2% to 11% literally overnight.",
      name: "Elena Rodriguez",
      title: "Founder at GrowthLabs",
      avatar: "/avatar-3.jpg",
    },
  ];

  return (
    <section ref={ref} className="bg-[#0D1117] py-[120px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#00D4FF] tracking-[0.15em] uppercase">
            Testimonials
          </span>
          <h2 className="font-['Space_Grotesk'] font-medium text-[40px] text-[#F0F4F8] mt-4">
            Loved by Revenue Teams Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card p-8 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <p className="text-[16px] text-[#F0F4F8] leading-[1.6] italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-[14px] font-medium text-[#F0F4F8]">
                    {t.name}
                  </p>
                  <p className="text-[13px] text-[#8B95A5]">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".pricing-card", {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/mo",
      desc: "1,000 leads/mo, 3 platforms, 2 team seats, email alerts",
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$149",
      period: "/mo",
      desc: "5,000 leads/mo, all platforms, 5 team seats, Slack alerts, CRM sync",
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$399",
      period: "/mo",
      desc: "Unlimited leads, all platforms, 15 team seats, API access, dedicated support",
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section ref={ref} className="bg-[#0A0E1A] py-[120px]" id="pricing">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="text-center">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#00D4FF] tracking-[0.15em] uppercase">
            Pricing
          </span>
          <h2 className="font-['Space_Grotesk'] font-medium text-[40px] text-[#F0F4F8] mt-4">
            Simple, Transparent Pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`pricing-card relative p-10 rounded-xl ${
                p.highlighted
                  ? "bg-[#00D4FF]/5 border border-[#00D4FF]/25"
                  : "bg-white/[0.02] border border-white/[0.06]"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00D4FF] text-[#0A0E1A] font-['JetBrains_Mono'] text-[11px]">
                  Most Popular
                </span>
              )}
              <h3 className="font-['Space_Grotesk'] font-medium text-[20px] text-[#F0F4F8]">
                {p.name}
              </h3>
              <div className="mt-4">
                <span
                  className={`font-['Space_Grotesk'] font-medium text-[36px] ${
                    p.highlighted ? "text-[#00D4FF]" : "text-[#F0F4F8]"
                  }`}
                >
                  {p.price}
                </span>
                <span className="text-[#8B95A5] text-[14px]">{p.period}</span>
              </div>
              <p className="text-[14px] text-[#8B95A5] mt-4 leading-relaxed">
                {p.desc}
              </p>
              <button
                onClick={() => navigate("/login")}
                className={`w-full mt-8 py-3 rounded-lg font-medium text-[14px] transition-all ${
                  p.highlighted
                    ? "bg-[#00D4FF] text-[#0A0E1A] hover:bg-[#33DDFF]"
                    : "border border-white/[0.15] text-[#F0F4F8] hover:border-white/30"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Band ─── */
function CTABand() {
  const navigate = useNavigate();
  return (
    <section
      className="py-20"
      style={{
        background: "linear-gradient(135deg, #00D4FF 0%, #7B61FF 100%)",
      }}
    >
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <h2 className="font-['Space_Grotesk'] font-medium text-[36px] text-[#0A0E1A]">
          Ready to Find Your Next Customer?
        </h2>
        <p className="text-[16px] text-[#0A0E1A]/70 mt-3">
          Start your 14-day free trial. No credit card required.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-8 px-8 py-3.5 bg-[#0A0E1A] text-[#00D4FF] font-medium rounded-lg hover:bg-[#0A0E1A]/90 transition-colors"
        >
          Get Started Free
        </button>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[#0A0E1A] py-16 border-t border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#00D4FF]/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#00D4FF]" />
              </div>
              <span className="font-['Space_Grotesk'] font-medium text-[14px] text-[#F0F4F8]">
                LeadNexus
              </span>
            </div>
            <p className="text-[13px] text-[#8B95A5] mt-3 max-w-[240px] leading-relaxed">
              AI-powered lead intelligence for modern revenue teams.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Integrations", "API", "Changelog"],
            },
            {
              title: "Resources",
              links: ["Documentation", "Blog", "Community", "Support"],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Legal", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[14px] font-medium text-[#F0F4F8] mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[14px] text-[#8B95A5] hover:text-[#F0F4F8] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-[12px] text-[#4A5568]">
            2025 LeadNexus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Home Page ─── */
export default function Home() {
  return (
    <div className="bg-[#0A0E1A]">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Testimonials />
      <Pricing />
      <CTABand />
      <Footer />
    </div>
  );
}
