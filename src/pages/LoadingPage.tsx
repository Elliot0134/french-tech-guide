import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialFormData, secondFormData, projectId } = location.state || {};

  useEffect(() => {
    const sendWebhookAndRedirect = async () => {
      if (!projectId || !initialFormData || !secondFormData) {
        console.error("Missing data for webhook call.");
        navigate("/"); // Redirect to home if data is missing
        return;
      }

      try {
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
        } else {
          console.log("Data sent to webhook successfully!");
        }
      } catch (webhookError) {
        console.error("Error calling webhook:", webhookError);
        alert("Une erreur est survenue lors de l'envoi des données au webhook.");
      } finally {
        // Always redirect to recommendations page after webhook attempt
        navigate(`/recommandations/${projectId}`, { state: { formData: initialFormData, secondFormData: secondFormData, projectId: projectId } });
      }
    };

    sendWebhookAndRedirect();
  }, [navigate, initialFormData, secondFormData, projectId]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Chargement de vos recommandations...</h1>
        <p className="text-muted-foreground">Veuillez patienter un instant.</p>
        {/* You can add a spinner component here if you have one */}
        <div className="mt-8 w-16 h-16 border-4 border-t-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </AppLayout>
  );
};

export default LoadingPage;
