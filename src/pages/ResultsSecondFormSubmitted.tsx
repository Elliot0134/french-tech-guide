import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ResultsSecondFormSubmitted = () => {
  const location = useLocation();
  const [projectId, setProjectId] = useState<string | null>(null);

  // Status tracking
  const [pdfStatus, setPdfStatus] = useState<string>("En cours");
  const [profilClientStatus, setProfilClientStatus] = useState<string>("En cours");

  // Data states
  const [profileClient, setProfileClient] = useState<any>(null);
  const [recommandationsClient, setRecommandationsClient] = useState<any>(null);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Get projectId from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("projectId");
    setProjectId(id);
  }, [location.search]);

  // Polling function to check statuses
  useEffect(() => {
    if (!projectId) return;

    const pollStatuses = async () => {
      try {
        console.log("🔍 Starting poll for project:", projectId);
        console.log("🔍 Project ID type:", typeof projectId);

        // First, let's try to get all rows to check if RLS is the issue
        const { data: allData, error: allError } = await supabase
          .from('statut_generation')
          .select('*');

        console.log("📊 All Status Data (no filter):", allData);
        console.log("📊 All Status Error:", allError);

        // Check statut_generation table with filter
        const { data: statusData, error: statusError } = await supabase
          .from('statut_generation')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        console.log("📊 Filtered Status Data:", statusData);
        console.log("📊 Filtered Status Error:", statusError);
        console.log("📊 Project ID used in query:", projectId);

        if (statusError) {
          console.error("❌ Error fetching status:", statusError);
          return;
        }

        if (statusData) {
          // Update statuses
          console.log("✅ PDF Status:", statusData.PDF);
          console.log("✅ Profile Client Status:", statusData.profile_client);

          setPdfStatus(statusData.PDF || "En cours");
          setProfilClientStatus(statusData.profile_client || "En cours");

          // If both are completed, fetch the actual data
          if (statusData.PDF === "Terminé") {
            console.log("🔍 Fetching PDF data...");
            const { data: genData, error: genError } = await supabase
              .from('generation_ia')
              .select('pdf_file_url')
              .eq('project_id', projectId)
              .maybeSingle();

            console.log("📄 PDF Gen Data:", genData);
            if (genData && genData.pdf_file_url) {
              setPdfFileUrl(genData.pdf_file_url);
            }
          }

          if (statusData.profile_client === "Terminé") {
            console.log("🔍 Fetching Profile Client data...");
            const { data: genData, error: genError } = await supabase
              .from('generation_ia')
              .select('profile_client, recommandations_client')
              .eq('project_id', projectId)
              .maybeSingle();

            console.log("👤 Profile Gen Data:", genData);
            if (genData) {
              setProfileClient(genData.profile_client);
              setRecommandationsClient(genData.recommandations_client);
            }
          }
        } else {
          // No status data found yet - keep showing loading state
          console.log("⚠️ No status data found for project:", projectId);
          console.log("ℹ️ This is normal if the webhook hasn't created the row yet. Continuing to poll...");
          // Keep default "En cours" state so the UI shows loading
        }
      } catch (err: any) {
        console.error("Error polling statuses:", err);
        setError(err.message);
      }
    };

    // Initial poll
    pollStatuses();

    // Set up polling interval
    const pollInterval = setInterval(pollStatuses, 3000); // Poll every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [projectId]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Merci pour vos réponses !</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Vos recommandations sont en cours de génération
          </p>
        </div>

        {error && (
          <Card className="border-destructive/20 mb-6 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Profile Client Section */}
        <Card className="border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Audit de votre cible</span>
              {profilClientStatus === "En cours" && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {profilClientStatus === "Terminé" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(profilClientStatus === "En cours" || (profilClientStatus === "Terminé" && !profileClient)) && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {profilClientStatus === "En cours"
                    ? "Génération du profil client en cours..."
                    : "Chargement des données..."}
                </p>
              </div>
            )}

            {profilClientStatus === "Terminé" && profileClient && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sub-item-1">
                  <AccordionTrigger>Informations sur votre cible</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="w-full md:w-1/2 flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Identité du client</h3>
                        <div className="flex flex-col gap-4 flex-grow">
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Identité du client</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.identite || "N/A"}
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Situation personnelle</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.contexte_personnel || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Psychologie client</h3>
                        <div className="flex flex-col gap-4 flex-grow">
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Motivations principales et valeurs</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.motivations_valeurs || "N/A"}
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Défis rencontrés et frustrations</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.defis_frustrations || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2 flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Comportement d'achat</h3>
                        <div className="flex flex-col gap-4 flex-grow">
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Habitudes et comportements d'achat</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.comportement_achat || "N/A"}
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Présence et activité sur les canaux digitaux</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.presence_digitale || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Stratégies recommandées</h3>
                        <div className="flex flex-col gap-4 flex-grow">
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Stratégies marketing</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.strategies_marketing || "N/A"}
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded-lg shadow-sm flex-grow flex flex-col min-h-[100px]">
                            <h4 className="font-semibold text-md mb-1">Approche de vente</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {profileClient.approche_vente || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sub-item-2">
                  <AccordionTrigger>Recommandations de la cible</AccordionTrigger>
                  <AccordionContent>
                    {recommandationsClient ? (
                      <div dangerouslySetInnerHTML={{ __html: recommandationsClient.replace(/\n\n/g, '<br /><br />').replace(/\n/g, '<br />') }} />
                    ) : (
                      "N/A"
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* PDF Section */}
        <Card className="border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Audit de votre projet (PDF)</span>
              {pdfStatus === "En cours" && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {pdfStatus === "Terminé" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(pdfStatus === "En cours" || (pdfStatus === "Terminé" && !pdfFileUrl)) && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {pdfStatus === "En cours"
                    ? "Génération du PDF en cours..."
                    : "Chargement des données..."}
                </p>
              </div>
            )}

            {pdfStatus === "Terminé" && pdfFileUrl && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Votre PDF est prêt !
                </p>
                <Button
                  onClick={async () => {
                    if (pdfFileUrl) {
                      try {
                        const response = await fetch(pdfFileUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'recommandations.pdf');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Error downloading PDF:", error);
                        alert("Erreur lors du téléchargement du PDF.");
                      }
                    }
                  }}
                >
                  Télécharger le PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 mb-6 bg-secondary/30">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Et après ?</h3>
            <p className="text-muted-foreground">
              Un membre de notre équipe vous contactera dans les prochains jours pour discuter
              des possibilités d'accompagnement adaptées à votre projet.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ResultsSecondFormSubmitted;
