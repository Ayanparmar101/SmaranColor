
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GrammarPage from "./pages/GrammarPage";
import StoryImagesPage from "./pages/StoryImagesPage";
import SpokenEnglishPage from "./pages/SpokenEnglishPage";
import VoiceBotPage from "./pages/VoiceBotPage";
import SocraticTutorPage from "./pages/SocraticTutorPage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
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
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/grammar" element={<GrammarPage />} />
              <Route path="/story-images" element={<StoryImagesPage />} />
              <Route path="/spoken-english" element={<SpokenEnglishPage />} />
              <Route path="/voice-bot" element={<VoiceBotPage />} />
              <Route path="/socratic-tutor" element={<SocraticTutorPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
