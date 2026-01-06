"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PhoneOutgoing,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#1a5f4a] flex items-center justify-center animate-pulse">
            <PhoneOutgoing className="h-6 w-6 text-white" />
          </div>
          <div className="text-[#1a5f4a]/60 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1a5f4a]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#d4a853]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#1a5f4a]/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#1a5f4a] flex items-center justify-center shadow-lg shadow-[#1a5f4a]/20">
              <PhoneOutgoing className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1a5f4a]">
              Pulse
            </span>
          </div>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="bg-[#1a5f4a] hover:bg-[#154a3a] text-white font-semibold px-6 h-11 rounded-xl shadow-lg shadow-[#1a5f4a]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign in with Google
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f4a]/10 rounded-full">
                <Sparkles className="h-4 w-4 text-[#d4a853]" />
                <span className="text-sm font-semibold text-[#1a5f4a]">
                  Relationship Intelligence
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-[#1a5f4a] leading-[1.1]">
                Never let a
                <br />
                <span className="relative inline-block">
                  relationship
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 8" stroke="#d4a853" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
                <br />
                go cold.
              </h1>

              <p className="text-xl text-[#1a5f4a]/70 max-w-lg leading-relaxed">
                Pulse uses smart cadence windows to help you stay in touch with your
                professional network naturally—never too early, never too late.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="bg-[#1a5f4a] hover:bg-[#154a3a] text-white h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-[#1a5f4a]/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5 hover:border-[#1a5f4a]/30"
                >
                  See how it works
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-6 text-[#1a5f4a]/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Privacy-first</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">Google sync</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-[#1a5f4a]/10 border border-[#1a5f4a]/10 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1a5f4a]">Your Network Health</h3>
                    <span className="text-xs font-semibold text-[#1a5f4a]/50 bg-[#1a5f4a]/5 px-3 py-1 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                      <div className="text-3xl font-black text-emerald-600">12</div>
                      <div className="text-xs font-medium text-emerald-600/70 mt-1">Healthy</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-2xl">
                      <div className="text-3xl font-black text-amber-600">4</div>
                      <div className="text-xs font-medium text-amber-600/70 mt-1">Due soon</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-2xl">
                      <div className="text-3xl font-black text-red-500">2</div>
                      <div className="text-xs font-medium text-red-500/70 mt-1">Overdue</div>
                    </div>
                  </div>

                  {/* Contact preview */}
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Chen", company: "Acme Corp", status: "healthy", days: "5 days ago" },
                      { name: "Marcus Johnson", company: "TechStart", status: "warning", days: "23 days ago" },
                      { name: "Emily Rodriguez", company: "Designco", status: "overdue", days: "45 days ago" },
                    ].map((contact, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer"
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          contact.status === "healthy" ? "bg-emerald-500" :
                          contact.status === "warning" ? "bg-amber-500" : "bg-red-500"
                        }`}>
                          {contact.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#1a5f4a] truncate">{contact.name}</div>
                          <div className="text-sm text-[#1a5f4a]/50">{contact.company}</div>
                        </div>
                        <div className="text-xs font-medium text-[#1a5f4a]/40">{contact.days}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating accent cards */}
              <div className="absolute -top-4 -left-4 bg-[#d4a853] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transform -rotate-6">
                +18% engagement
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white px-4 py-3 rounded-xl shadow-lg border border-[#1a5f4a]/10 transform rotate-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-[#1a5f4a] text-sm">Synced with Google</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status explanation section */}
        <section className="bg-[#1a5f4a] py-24 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Three states. Total clarity.
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Pulse uses intelligent cadence windows to show you exactly where each relationship stands.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Healthy */}
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-[1.02]">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Healthy</h3>
                <p className="text-white/70 leading-relaxed">
                  You&apos;re on track. No action needed—your relationship is in great shape. Keep doing what you&apos;re doing.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-sm text-white/50">Within target cadence</div>
                </div>
              </div>

              {/* In Window */}
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-[1.02]">
                <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">In the Window</h3>
                <p className="text-white/70 leading-relaxed">
                  The sweet spot! Now&apos;s the perfect time to reach out naturally. A quick message would feel organic.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-sm text-white/50">±15% of target cadence</div>
                </div>
              </div>

              {/* Overdue */}
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-[1.02]">
                <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Overdue</h3>
                <p className="text-white/70 leading-relaxed">
                  Time to reconnect! It&apos;s been longer than your target cadence. Don&apos;t let this relationship go cold.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-sm text-white/50">Past target cadence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-24 bg-[#faf8f5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#1a5f4a]/5 border border-[#1a5f4a]/10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-[#1a5f4a]/5 rounded-2xl">
                      <div className="h-12 w-12 rounded-xl bg-[#1a5f4a] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-black text-white">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a5f4a] text-lg">Dynamic Windows</h4>
                        <p className="text-[#1a5f4a]/60 mt-1">
                          Instead of rigid &quot;every 30 days&quot;, Pulse uses a ±15% variance window so outreach feels natural.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-[#1a5f4a]/5 rounded-2xl">
                      <div className="h-12 w-12 rounded-xl bg-[#1a5f4a] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-black text-white">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a5f4a] text-lg">Auto-Sync with Google</h4>
                        <p className="text-[#1a5f4a]/60 mt-1">
                          Connects to Gmail and Calendar to automatically track when you last interacted.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-[#1a5f4a]/5 rounded-2xl">
                      <div className="h-12 w-12 rounded-xl bg-[#1a5f4a] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-black text-white">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a5f4a] text-lg">Privacy First</h4>
                        <p className="text-[#1a5f4a]/60 mt-1">
                          We only read timestamps—never the content of your emails or meetings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-4xl lg:text-5xl font-black text-[#1a5f4a] leading-tight">
                  Smart, not robotic.
                </h2>
                <p className="text-xl text-[#1a5f4a]/70 leading-relaxed">
                  Most CRM tools feel like work. Pulse feels like having a thoughtful assistant who understands that real relationships need breathing room.
                </p>
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-4xl font-black text-[#d4a853]">50%</div>
                    <div className="text-sm text-[#1a5f4a]/50 font-medium">Less dropped contacts</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#d4a853]">3x</div>
                    <div className="text-sm text-[#1a5f4a]/50 font-medium">More meaningful touchpoints</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-b from-[#faf8f5] to-[#f5f0e8]">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl lg:text-6xl font-black text-[#1a5f4a] mb-6">
              Ready to nurture your network?
            </h2>
            <p className="text-xl text-[#1a5f4a]/70 mb-10 max-w-2xl mx-auto">
              Join professionals who use Pulse to maintain authentic relationships at scale.
            </p>
            <Button
              size="lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="bg-[#1a5f4a] hover:bg-[#154a3a] text-white h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl shadow-[#1a5f4a]/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              Get started — it&apos;s free
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a5f4a] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <PhoneOutgoing className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Pulse</span>
            </div>
            <p className="text-white/50 text-sm">
              © 2025 Pulse. Relationship Health Dashboard.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
