import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import frenchTechLogo from "../assets/french-tech-logo.png";

interface PDFGeneratorProps {
  formData: any;
}

// Helper function to generate recommendations based on form data
const generateRecommendations = (formData: any) => {
  const recommendations = [];
  
  // Administrative and legal recommendations
  if (formData.companyCreated === "no") {
    recommendations.push({
      category: "Administratif & Légal",
      title: "Créer votre structure juridique",
      description: "Nous recommandons de créer votre entreprise rapidement pour sécuriser votre projet.",
      resources: ["Guide de création d'entreprise French Tech", "Mise en relation avec des experts juridiques"]
    });
  }
  
  if (formData.intellectualProperty === "no") {
    recommendations.push({
      category: "Administratif & Légal",
      title: "Protéger votre propriété intellectuelle",
      description: "Envisagez de protéger vos innovations par des brevets, marques ou droits d'auteur.",
      resources: ["Atelier propriété intellectuelle", "Consultation avec un expert en PI"]
    });
  }
  
  // Product and service recommendations
  if (formData.techLevel === "concept" || formData.techLevel === "prototype") {
    recommendations.push({
      category: "Produit & Service",
      title: "Accélérer le développement de votre produit",
      description: "Passez rapidement à un MVP fonctionnel pour valider votre concept sur le marché.",
      resources: ["Programme d'accélération technique", "Mentoring produit"]
    });
  }
  
  if (formData.hasUsers === "no") {
    recommendations.push({
      category: "Produit & Service",
      title: "Valider votre produit auprès d'utilisateurs pilotes",
      description: "Identifiez et engagez un groupe d'utilisateurs pilotes pour tester votre solution.",
      resources: ["Atelier user testing", "Base de données d'early adopters"]
    });
  }
  
  // Marketing recommendations
  if (formData.marketingStrategy === "no") {
    recommendations.push({
      category: "Marketing & Acquisition",
      title: "Développer une stratégie marketing",
      description: "Définissez votre stratégie d'acquisition client et votre positionnement concurrentiel.",
      resources: ["Atelier stratégie marketing", "Templates de plan marketing"]
    });
  }
  
  if (formData.targetMarket === "no" || formData.targetMarket === "partially") {
    recommendations.push({
      category: "Marketing & Acquisition",
      title: "Définir précisément votre marché cible",
      description: "Affinez votre compréhension de vos clients idéaux et de leurs besoins spécifiques.",
      resources: ["Atelier personas", "Études de marché sectorielles"]
    });
  }
  
  // Financing and team recommendations
  if (formData.fundraising === "no" && formData.currentNeeds?.includes("funding")) {
    recommendations.push({
      category: "Financement & Équipe",
      title: "Préparer une stratégie de levée de fonds",
      description: "Structurez votre approche de financement et préparez vos documents investisseurs.",
      resources: ["Programme de préparation à la levée de fonds", "Mise en relation avec des investisseurs"]
    });
  }
  
  if (formData.teamSize === "solo" || formData.teamSize === "2-5") {
    recommendations.push({
      category: "Financement & Équipe",
      title: "Renforcer votre équipe sur les compétences clés",
      description: "Identifiez les compétences manquantes critiques pour votre croissance.",
      resources: ["Jobboard French Tech", "Événements networking", "Programmes de recrutement"]
    });
  }
  
  return recommendations;
};

// Map sector values to human-readable names
const sectorMap: Record<string, string> = {
  "fintech": "FinTech",
  "healthtech": "HealthTech",
  "edtech": "EdTech",
  "ai": "Intelligence Artificielle",
  "saas": "SaaS",
  "ecommerce": "E-commerce",
  "other": "Autre"
};

// Map stage values to human-readable names
const stageMap: Record<string, string> = {
  "idea": "Idée",
  "prototype": "Prototype",
  "mvp": "MVP",
  "market": "Sur le marché",
  "scaling": "En phase de croissance"
};

// Map team size values to human-readable names
const teamSizeMap: Record<string, string> = {
  "solo": "Solo-entrepreneur",
  "2-5": "2-5 personnes",
  "6-10": "6-10 personnes",
  "11-20": "11-20 personnes",
  "20+": "Plus de 20 personnes"
};

export function PDFGenerator({ formData }: PDFGeneratorProps) {
  const recommendations = generateRecommendations(formData);
  
  // Helper function to format needs array into readable string
  const formatNeeds = (needs: string[]) => {
    if (!needs || needs.length === 0) return "Non spécifié";
    
    const needsMap: Record<string, string> = {
      "funding": "Financement",
      "technical": "Développement technique",
      "marketing": "Marketing & Acquisition",
      "legal": "Conseil juridique",
      "networking": "Mise en réseau",
      "mentoring": "Mentorat",
      "recruitment": "Recrutement"
    };
    
    return needs.map(need => needsMap[need] || need).join(", ");
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <img src={frenchTechLogo} alt="French Tech Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-[#0053B3]">Plan d'action personnalisé</h1>
            <p className="text-sm text-gray-600">Document généré le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
      
      {/* Project Info */}
      <Card className="mb-8 border-[#0053B3]/20">
        <CardHeader className="bg-[#0053B3]/10 pb-4">
          <h2 className="text-xl font-bold text-[#0053B3]">
            Projet : {formData.projectName || "Non spécifié"}
          </h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm text-gray-500">Secteur</p>
            <p className="font-medium">{sectorMap[formData.sector] || formData.sector || "Non spécifié"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stade de développement</p>
            <p className="font-medium">{stageMap[formData.stage] || formData.stage || "Non spécifié"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Entreprise créée</p>
            <p className="font-medium">
              {formData.companyCreated === "yes" ? "Oui" : 
               formData.companyCreated === "no" ? "Non" : 
               formData.companyCreated === "inProgress" ? "En cours" : "Non spécifié"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Taille de l'équipe</p>
            <p className="font-medium">{teamSizeMap[formData.teamSize] || formData.teamSize || "Non spécifié"}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#0053B3] mb-4">Synthèse de votre situation</h2>
        <p className="mb-4">
          Votre projet {formData.projectName || ""} se situe au stade {stageMap[formData.stage] || formData.stage || "de développement"} avec une équipe de taille {teamSizeMap[formData.teamSize] || formData.teamSize || "non spécifiée"}.
          {formData.companyCreated === "yes" ? " Votre entreprise est déjà créée." : 
           formData.companyCreated === "no" ? " Votre entreprise n'est pas encore créée." : 
           formData.companyCreated === "inProgress" ? " La création de votre entreprise est en cours." : ""}
          {formData.hasUsers === "yes" ? " Vous avez déjà des utilisateurs/clients." : 
           formData.hasUsers === "no" ? " Vous n'avez pas encore d'utilisateurs/clients." : ""}
        </p>
        <p>
          Vos besoins prioritaires actuels sont centrés sur : {formatNeeds(formData.currentNeeds)}.
        </p>
      </div>
      
      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#0053B3] mb-4">Recommandations prioritaires</h2>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="border-[#0053B3]/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-[#0053B3] text-white">
                      {rec.category}
                    </span>
                  </div>
                  <h3 className="font-bold mt-2">{rec.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{rec.description}</p>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium text-sm mb-2">Ressources French Tech disponibles :</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {rec.resources.map((resource, i) => (
                        <li key={i}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Aucune recommandation spécifique n'a pu être générée avec les informations fournies.
          </p>
        )}
      </div>
      
      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#0053B3] mb-4">Prochaines étapes</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Un membre de notre équipe vous contactera dans les 5 jours ouvrés pour planifier un entretien individuel</li>
          <li>Vous serez invité(e) aux prochains événements French Tech correspondant à vos besoins</li>
          <li>Vous aurez accès à notre plateforme de ressources et notre communauté d'entrepreneurs</li>
        </ol>
      </div>
      
      {/* Contact Info */}
      <div className="mb-8 bg-gray-50 p-4 rounded-md">
        <h2 className="text-xl font-bold text-[#0053B3] mb-4">Votre contact French Tech</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Email :</p>
            <p>contact@frenchtech.com</p>
          </div>
          <div>
            <p className="font-medium">Téléphone :</p>
            <p>01 23 45 67 89</p>
          </div>
          <div>
            <p className="font-medium">Site web :</p>
            <p>www.frenchtech.com</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Separator className="my-4" />
      <div className="text-center text-sm text-gray-500">
        <p>Document généré le {new Date().toLocaleDateString('fr-FR')} - French Tech © {new Date().getFullYear()}</p>
        <p>Toutes les informations contenues dans ce document sont confidentielles.</p>
      </div>
    </div>
  );
}