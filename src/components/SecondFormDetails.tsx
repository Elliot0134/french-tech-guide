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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("projectId");
    setProjectId(id);
  }, [location.search]);

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

    const dataToInsert = {
      project_id: projectId, // Add project_id to the data
      email: initialFormData.email, // Get email from the first form's data
      clients: data.clients,
      problem: data.problem,
      additional_info: data.additional_info,
    };

    try {
      // Insert data into Supabase
      const { error: supabaseError } = await supabase
        .from('second_form_responses')
        .insert([dataToInsert]);

      if (supabaseError) {
        console.error("Error inserting data into second form:", supabaseError);
        alert("Une erreur est survenue lors de l'enregistrement de vos réponses complémentaires.");
        return;
      }

      console.log("Second form data inserted successfully!");

      // Send webhook (fire-and-forget, don't wait for response)
      const webhookUrl = "https://n8n.srv906204.hstgr.cloud/webhook/formulaire-french-tech-idea";
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: projectId }),
      }).then(response => {
        if (response.ok) {
          console.log("Webhook sent successfully!");
        } else {
          console.error("Webhook call failed:", response.statusText);
        }
      }).catch(error => {
        console.error("Error sending webhook:", error);
      });

      // Redirect to results page instead of showing loading dialog
      navigate(`/results/submitted?projectId=${projectId}`);

    } catch (overallError) {
      console.error("An unexpected error occurred:", overallError);
      alert("Une erreur inattendue est survenue.");
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
                    <Button type="submit" variant="default">
                      Soumettre
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}
