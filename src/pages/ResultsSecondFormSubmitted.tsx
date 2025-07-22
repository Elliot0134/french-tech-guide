import { AppLayout } from "@/components/layout/AppLayout";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ResultsSecondFormSubmitted = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Merci pour vos réponses !</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Votre audit a été complété avec succès
          </p>
        </div>

        <Card className="border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center">
              Vous recevrez vos documents dans votre boîte mail d'ici quelques instants...
            </p>
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
