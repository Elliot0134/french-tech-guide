import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { ContactRequestButton } from "@/components/ContactRequestButton";

interface ResultsEarlyStageProps {
  projectId: string | null;
}

const ResultsEarlyStage = ({ projectId }: ResultsEarlyStageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};
  const isAdherent = location.state?.isAdherent || false;

  const handleCompleteAnalysis = () => {
    navigate(`/results/second-form?projectId=${projectId}`, { state: { formData: formData } });
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full px-4">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl font-bold text-primary">Merci pour vos réponses !</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Votre audit a été complété avec succès
            </p>
          </div>

        {isAdherent ? (
          // Section pour les adhérents : uniquement l'analyse approfondie
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Obtenez votre analyse personnalisée approfondie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Votre projet est en phase de développement initial. Pour vous proposer un plan d'action
                  vraiment personnalisé, nous avons besoin de quelques informations supplémentaires.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {[
                    "Analyse de votre cible",
                    "Recommandations stratégiques",
                    "Plan d'action détaillé"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2 bg-secondary p-3 rounded-md">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-center">
              <Button
                onClick={handleCompleteAnalysis}
                variant="accent"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Compléter mon analyse
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Section pour les non-adhérents : uniquement le contact + "Et après ?"
          <>
            <Card className="border-primary/20 mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <h3 className="text-lg font-medium">Souhaitez-vous être recontacté ?</h3>
                  <p className="text-muted-foreground">
                    Un membre de notre équipe peut vous contacter pour discuter de votre projet et des solutions adaptées.
                  </p>
                  <ContactRequestButton projectId={projectId} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 mb-6 bg-secondary/30">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Et après ?</h3>
                <p className="text-muted-foreground">
                  Nous analyserons votre projet et vous proposerons des recommandations personnalisées
                  pour vous aider à atteindre vos objectifs.
                </p>
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ResultsEarlyStage;
