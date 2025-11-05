import { AppLayout } from "@/components/layout/AppLayout";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ContactRequestButton } from "@/components/ContactRequestButton";

interface ResultsAdvancedStageProps {
  projectId: string | null;
}

const ResultsAdvancedStage = ({ projectId }: ResultsAdvancedStageProps) => {
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
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Merci pour vos réponses !</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Votre audit a été complété avec succès
            </p>
          </div>

        {isAdherent ? (
          // Section pour les adhérents : uniquement l'analyse approfondie
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Complétez votre analyse pour des recommandations approfondies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Pour vous proposer un plan d'action vraiment personnalisé et des recommandations stratégiques,
                  nous avons besoin de quelques informations supplémentaires sur votre projet.
                </p>
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

export default ResultsAdvancedStage;
