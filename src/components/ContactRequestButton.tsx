import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface ContactRequestButtonProps {
  projectId: string | null;
}

export function ContactRequestButton({ projectId }: ContactRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const { toast } = useToast();

  const handleContactRequest = async () => {
    if (!projectId) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('form-responses')
        .update({ ask_contact: true })
        .eq('project_id', projectId);

      if (error) {
        console.error("Error updating contact request:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
      } else {
        setIsRequested(true);

        // Send webhook notification
        try {
          const webhookUrl = "https://n8n.srv906204.hstgr.cloud/webhook/formulaire-1-french-tech-recontact";
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: projectId
            }),
          });

          if (!response.ok) {
            console.error("Webhook call failed:", response.statusText);
          } else {
            console.log("Contact request webhook sent successfully!");
          }
        } catch (webhookError) {
          console.error("Error sending webhook:", webhookError);
          // Don't show error to user as the main action (DB update) succeeded
        }

        toast({
          title: "Demande enregistrée",
          description: "Nous vous recontacterons dans les plus brefs délais.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContactRequest}
      variant={isRequested ? "outline" : "default"}
      size="lg"
      className="w-full sm:w-auto"
      disabled={isLoading || isRequested}
    >
      <Phone className="mr-2 h-4 w-4" />
      {isRequested ? "Demande enregistrée" : "Je souhaite être recontacté"}
    </Button>
  );
}
