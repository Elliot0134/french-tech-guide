import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Audit from "./pages/Audit";
import Results from "./pages/Results";
import ResultsSecondFormSubmitted from "./pages/ResultsSecondFormSubmitted";
import { AuditForm } from "./components/AuditForm";
import { SecondFormDetails } from "./components/SecondFormDetails";
import Recommandations from "./pages/Recommandations"; // Import the new page
import LoadingPage from "./pages/LoadingPage"; // Import LoadingPage
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [formData, setFormData] = useState({});

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/audit" element={<Audit />} />
            <Route 
              path="/results" 
              element={<Results />} 
            />
            <Route 
              path="/results/second-form" 
              element={<SecondFormDetails />} 
            />
            <Route
              path="/results/submitted"
              element={<ResultsSecondFormSubmitted />}
            />
            <Route path="/loading" element={<LoadingPage />} /> {/* Loading page for generation */}
            <Route path="/recommandations/:projectId" element={<Recommandations />} /> {/* New dynamic route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
