import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <img 
          src="/public/french-tech-image.png"
          alt="French Tech Logo" 
          className="h-28 w-auto mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Inscription <br className="sm:hidden" />French Tech
        </h1>
      </div>

      <Card className="border-primary/20 mb-6">
        <CardHeader>
          <CardTitle>Inscrivez votre projet</CardTitle>
          <CardDescription>
            Un service exclusif de La French Tech pour accompagner les entrepreneurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Ce formulaire d'inscription vous permet de présenter votre projet entrepreneurial. Si votre entreprise est en cours de création, vous recevrez des recommandations stratégiques personnalisées.
            </p>
            
            <div className="space-y-2">
              {[
                "Identifier et qualifier votre projet entrepreneurial",
                "Être redirigé vers les services adaptés à votre situation",
                "Valider votre éligibilité en tant qu'adhérent à la French Tech",
                "Recevoir un plan d'action personnalisé basé sur votre situation actuelle"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center p-4 bg-secondary rounded-lg mt-6">
              <span className="text-primary font-medium">
                Durée estimée : 5-7 minutes
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full" 
            onClick={() => navigate("/audit")}
          >
            Commencer l'inscription
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Vos données resteront confidentielles et ne seront utilisées que dans le cadre de votre accompagnement.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
