import { AppLayout } from "@/components/layout/AppLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const Recommandations = () => {
  const { projectId } = useParams(); // Extract projectId from URL
  const [profileClient, setProfileClient] = useState<any>(null);
  const [recommandationsClient, setRecommandationsClient] = useState<any>(null);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null); // Nouveau state pour l'URL du PDF
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => { // Renommé pour inclure la récupération du PDF
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("generation_ia")
          .select("profile_client, recommandations_client, pdf_file_url") // Ajout de pdf_file_url
          .eq("project_id", projectId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfileClient(data.profile_client);
          setRecommandationsClient(data.recommandations_client);
          setPdfFileUrl(data.pdf_file_url); // Stocker l'URL du PDF
        } else {
          setProfileClient("Aucune donnée de profil client trouvée.");
          setRecommandationsClient("Aucune donnée de recommandation client trouvée.");
          setPdfFileUrl(null);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError(`Erreur lors du chargement des données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Appel de la nouvelle fonction
  }, [projectId]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Vos Recommandations Personnalisées
          </h1>
          <p className="text-muted-foreground mt-2">
            Découvrez l'analyse de votre projet et les prochaines étapes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-2xl font-bold text-primary mb-4">Audit de votre cible</h2>
          <Accordion type="single" collapsible className="w-full">
            {loading && <p>Chargement du profil client...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {profileClient && (
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
            {!loading && !error && !profileClient && (
              <p>Aucune donnée de profil client disponible.</p>
            )}

          </Accordion>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-2xl font-bold text-primary mb-4">Audit de votre projet</h2>
          <Button
            onClick={async () => {
              if (pdfFileUrl) {
                try {
                  const response = await fetch(pdfFileUrl);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'recommandations.pdf'); // Nom du fichier téléchargé
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url); // Libérer l'URL de l'objet
                } catch (error) {
                  console.error("Error downloading PDF:", error);
                  alert("Erreur lors du téléchargement du PDF.");
                }
              } else {
                alert("Aucun fichier PDF trouvé pour ce projet.");
              }
            }}
            disabled={!pdfFileUrl} // Désactiver le bouton si pas d'URL
          >
            Accéder au PDF
          </Button>
        </div>

        <p className="text-center text-muted-foreground mt-8">
          Vous serez contacté(e) prochainement par un des administrateurs de la French Tech.
        </p>
      </div>
    </AppLayout>
  );
};

export default Recommandations;
