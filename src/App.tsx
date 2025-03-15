
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import GrammarPage from "./pages/GrammarPage";
import StoryImagesPage from "./pages/StoryImagesPage";
import SpokenEnglishPage from "./pages/SpokenEnglishPage";
import VoiceBotPage from "./pages/VoiceBotPage";
import SocraticTutorPage from "./pages/SocraticTutorPage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import { createContext, useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const AuthContext = createContext<{
  session: Session | null;
  user: any;
}>({
  session: null,
  user: null,
});

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <nav className="border-b">
                <div className="container mx-auto px-4">
                  <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link to="/" className="text-xl font-bold">
                        Learn English
                      </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                      {session ? (
                        <>
                          <Link to="/dashboard" className="text-sm font-medium">
                            Dashboard
                          </Link>
                          <Link to="/history" className="text-sm font-medium">
                            History
                          </Link>
                        </>
                      ) : (
                        <Link to="/auth" className="text-sm font-medium">
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </nav>

              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/grammar" element={<GrammarPage />} />
                  <Route path="/story-images" element={<StoryImagesPage />} />
                  <Route path="/spoken-english" element={<SpokenEnglishPage />} />
                  <Route path="/voice-bot" element={<VoiceBotPage />} />
                  <Route path="/socratic-tutor" element={<SocraticTutorPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
          <Sonner />
          <Toaster />
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
