import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  clients: z.string().min(10, { message: "Veuillez décrire vos clients cibles (au moins 10 caractères)." }),
  problem: z.string().min(10, { message: "Veuillez décrire le problème que vous résolvez (au moins 10 caractères)." }),
  additional_info: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SecondFormDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFormData = location.state?.formData || {}; // Data from the first form
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [generationStatuses, setGenerationStatuses] = useState({
    profil_client: "En attente",
    plan_action: "En attente",
    recommandations_strategiques: "En attente", // Changed from 'recommandations'
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("projectId");
    setProjectId(id);
  }, [location.search]);

  // Removed useEffect for polling statuses as per user request

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clients: "",
      problem: "",
      additional_info: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!projectId) {
      alert("Project ID non trouvé. Veuillez remplir le premier formulaire d'abord.");
      navigate("/"); // Redirect to home or first form
      return;
    }

    setIsLoading(true); // Set loading to true
    setShowLoadingDialog(true); // Show loading dialog immediately

    const dataToInsert = {
      project_id: projectId, // Add project_id to the data
      email: initialFormData.email, // Get email from the first form's data
      clients: data.clients,
      problem: data.problem,
      additional_info: data.additional_info,
    };

    try { // Main try block for Supabase insertion
      const { error: supabaseError } = await supabase
        .from('second_form_responses')
        .insert([dataToInsert]);

      if (supabaseError) {
        console.error("Error inserting data into second form:", supabaseError);
        alert("Une erreur est survenue lors de l'enregistrement de vos réponses complémentaires.");
        return; // Stop execution if Supabase insertion fails
        } else {
          console.log("Second form data inserted successfully!");

          // Send projectId to webhook
          try {
            const webhookUrl = "https://n8n.srv906204.hstgr.cloud/webhook/formulaire-french-tech-idea";
            const response = await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ projectId: projectId }),
            });

            if (!response.ok) {
              console.error("Webhook call failed:", response.statusText);
            } else {
              console.log("ProjectId sent to webhook successfully!");
            }
          } catch (webhookError) {
            console.error("Error sending projectId to webhook:", webhookError);
            alert("Une erreur est survenue lors de l'envoi des données au webhook.");
            setShowLoadingDialog(false); // Hide dialog on webhook error
            setIsLoading(false); // Reset loading state
            return; // Stop execution
          }

          // Navigate after successful webhook call
          setShowLoadingDialog(false); // Hide dialog
          navigate(`/recommandations/${projectId}`, { state: { projectId: projectId } });
        }
    } catch (overallError) { // Catch for any errors during Supabase insertion or initial navigation
      console.error("An unexpected error occurred:", overallError);
      alert("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false); // Ensure loading is false after all operations
    }
  };

  return (
    <>
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Informations Complémentaires sur votre Projet
            </h1>
            <p className="text-muted-foreground mt-2">
              Afin de vous fournir une analyse plus précise, veuillez répondre aux questions suivantes.
            </p>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Détails du Projet</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="clients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décrivez vos clients cibles *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Qui sont vos clients idéaux ? Quels sont leurs besoins ?" 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="problem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quel problème résolvez-vous pour eux ? *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez le problème principal que votre solution adresse." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additional_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informations supplémentaires (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Toute autre information pertinente sur votre projet, votre marché, ou vos objectifs." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <CardFooter className="flex justify-end pt-2">
                    <Button type="submit" variant="default" disabled={isLoading}>
                      {isLoading ? "Envoi en cours..." : "Soumettre"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>

      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Génération de vos recommandations en cours...</DialogTitle>
            <DialogDescription>
              Veuillez patienter pendant que nous préparons votre analyse personnalisée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">
              Vos recommandations sont en cours de préparation. Veuillez patienter...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
