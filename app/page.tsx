"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  PhoneOutgoing,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <PhoneOutgoing className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pulse</h1>
        </div>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Sign in with Google
        </Button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6 mb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Keep your network{" "}
            <span className="text-blue-600">alive & thriving</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Pulse uses smart &quot;cadence windows&quot; to help you stay in touch with
            your professional contacts naturally—never too early, never too
            late.
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900">Healthy</h3>
              </div>
              <p className="text-emerald-700">
                You&apos;re on track. No action needed—your relationship is in great
                shape.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-amber-900">
                  In the Window
                </h3>
              </div>
              <p className="text-amber-700">
                The sweet spot! Now&apos;s the perfect time to reach out naturally.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-red-900">Overdue</h3>
              </div>
              <p className="text-red-700">
                Time to reconnect! It&apos;s been longer than your target cadence.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">
              Smart, not robotic
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Dynamic Windows
                  </h4>
                  <p className="text-slate-600">
                    Instead of &quot;every 30 days&quot;, Pulse uses a ±15% variance
                    window so outreach feels natural.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Auto-Sync with Google
                  </h4>
                  <p className="text-slate-600">
                    Connects to Gmail and Calendar to automatically track when
                    you last interacted.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Privacy First</h4>
                  <p className="text-slate-600">
                    We only read timestamps—never the content of your emails or
                    meetings.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
            <div className="text-center text-slate-400">
              <PhoneOutgoing className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Dashboard Preview</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>Pulse — Relationship Health Dashboard</p>
      </footer>
    </div>
  );
}
