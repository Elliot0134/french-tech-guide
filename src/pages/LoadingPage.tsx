import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "frenchTechGenerationData";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [pollingStatus, setPollingStatus] = useState("Envoi des données...");

  // Try to get data from multiple sources (state, localStorage, or URL)
  const getLoadingData = () => {
    // First, try from location.state
    if (location.state?.projectId) {
      return {
        initialFormData: location.state.initialFormData,
        secondFormData: location.state.secondFormData,
        projectId: location.state.projectId,
      };
    }

    // Second, try from URL params
    const urlProjectId = searchParams.get("projectId");
    if (urlProjectId) {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.projectId === urlProjectId) {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }

    // Third, try from localStorage only
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }

    return { initialFormData: null, secondFormData: null, projectId: null };
  };

  const { initialFormData, secondFormData, projectId } = getLoadingData();

  useEffect(() => {
    const sendWebhookAndPoll = async () => {
      if (!projectId || !initialFormData || !secondFormData) {
        console.error("Missing data for webhook call.");
        localStorage.removeItem(STORAGE_KEY);
        navigate("/"); // Redirect to home if data is missing
        return;
      }

      // Save to localStorage for persistence across reloads
      let webhookSent = false;
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          webhookSent = parsed.webhookSent || false;
        }
      } catch (error) {
        console.error("Error reading webhook status:", error);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          initialFormData,
          secondFormData,
          projectId,
          webhookSent
        }));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      // Step 1: Send webhook (only if not already sent)
      if (!webhookSent) {
        try {
          setPollingStatus("Envoi des données au serveur...");
          const webhookUrl = "https://n8n.srv906204.hstgr.cloud/webhook/formulaire-french-tech-idea";
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...initialFormData, ...secondFormData, project_id: projectId }),
          });

          if (!response.ok) {
            console.error("Webhook call failed:", response.statusText);
            alert("Une erreur est survenue lors de l'envoi des données au webhook.");
            localStorage.removeItem(STORAGE_KEY);
            navigate("/");
            return;
          } else {
            console.log("Data sent to webhook successfully!");
            // Mark webhook as sent
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                initialFormData,
                secondFormData,
                projectId,
                webhookSent: true
              }));
            } catch (error) {
              console.error("Error updating webhook status:", error);
            }
          }
        } catch (webhookError) {
          console.error("Error calling webhook:", webhookError);
          alert("Une erreur est survenue lors de l'envoi des données au webhook.");
          localStorage.removeItem(STORAGE_KEY);
          navigate("/");
          return;
        }
      } else {
        console.log("Webhook already sent, skipping to polling...");
      }

      // Step 2: Poll the generation_ia table
      setPollingStatus("Génération de vos recommandations en cours...");

      const checkGeneration = async (): Promise<boolean> => {
        try {
          const { data, error } = await supabase
            .from('statut_generation')
            .select('PDF')
            .eq('project_id', projectId)
            .single();

          if (error) {
            // Row doesn't exist yet or other error
            console.log("Generation status not ready yet:", error.message);
            return false;
          }

          // Check if PDF column is "Terminé"
          if (data && data.PDF === "Terminé") {
            console.log("PDF generation complete!");
            return true;
          }

          console.log("PDF status:", data?.PDF || "Unknown");
          return false;
        } catch (error) {
          console.error("Error checking generation status:", error);
          return false;
        }
      };

      // Poll every 3 seconds
      const pollInterval = setInterval(async () => {
        const isReady = await checkGeneration();

        if (isReady) {
          clearInterval(pollInterval);
          setPollingStatus("Redirection vers vos recommandations...");

          // Clean up localStorage
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (error) {
            console.error("Error cleaning localStorage:", error);
          }

          navigate(`/recommandations/${projectId}`, {
            state: {
              formData: initialFormData,
              secondFormData: secondFormData,
              projectId: projectId
            }
          });
        }
      }, 3000); // Check every 3 seconds

      // Timeout after 5 minutes (300000ms)
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        console.error("Timeout: Generation took too long");

        // Clean up localStorage on timeout
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Error cleaning localStorage:", error);
        }

        alert("La génération prend plus de temps que prévu. Veuillez réessayer ultérieurement.");
        navigate("/");
      }, 300000);

      // Cleanup function
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    };

    sendWebhookAndPoll();
  }, [navigate, initialFormData, secondFormData, projectId]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center px-4">
        <h1 className="text-3xl font-bold text-primary mb-4">Génération de vos recommandations...</h1>
        <p className="text-muted-foreground mb-2">{pollingStatus}</p>
        <p className="text-sm text-muted-foreground">Veuillez patienter, cela peut prendre quelques instants.</p>
        {/* Spinner */}
        <div className="mt-8 w-16 h-16 border-4 border-t-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </AppLayout>
  );
};

export default LoadingPage;
