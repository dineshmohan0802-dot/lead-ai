import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function TestAuth() {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Supabase URL:", supabaseUrl);
        console.log("Anon Key:", supabaseAnonKey?.slice(0, 20) + "...");

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Test 1: Check auth status
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        console.log("Session check:", { session, error: sessionError });

        // Test 2: Get user
        const { data: user, error: userError } = await supabase.auth.getUser();
        console.log("User check:", { user, error: userError });

        // Test 3: Try signing up with test user
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: "Test123!@#",
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        console.log("Sign up test:", { data: signUpData, error: signUpError });

        setDetails({
          supabaseUrl,
          anonKeyValid: !!supabaseAnonKey,
          sessionStatus: sessionError ? `Error: ${sessionError.message}` : "OK",
          userStatus: userError ? `Error: ${userError.message}` : "OK",
          signUpTest: signUpError ? `Error: ${signUpError.message}` : "Success",
          testEmail,
          fullResponse: { signUpData, signUpError },
        });

        setStatus("✓ Connection successful - See details below");
      } catch (error: any) {
        setStatus(`✗ Error: ${error.message}`);
        setDetails(error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00D4FF] mb-4">Supabase Auth Test</h1>
        
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-6 mb-6">
          <p className="text-[#F0F4F8] text-lg">{status}</p>
        </div>

        {details && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
            <pre className="text-[#8B95A5] text-sm overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/login"
            className="text-[#00D4FF] hover:underline text-sm"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
