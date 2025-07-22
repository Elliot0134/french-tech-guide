
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "./ProgressBar";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

const formSteps = [
  {
    id: "general",
    title: "Informations générales",
  },
  {
    id: "motivations",
    title: "Vos motivations détaillées",
  },
  {
    id: "budget",
    title: "Budget et disponibilités",
  },
  {
    id: "legal",
    title: "Administratif & Légal",
  },
  {
    id: "product",
    title: "Produit & Service",
  },
  {
    id: "finance",
    title: "Financement & Équipe",
  },
  {
    id: "contact",
    title: "Informations de contact",
  },
];

// Form schemas for each step
const generalSchema = z.object({
  projectName: z.string().min(2, { message: "Le nom du projet est requis" }),
  sector: z.string().min(1, { message: "Le secteur d'activité est requis" }),
  sectorOther: z.string().optional(),
  stage: z.string().min(1, { message: "Le stade de développement est requis" }),
  website: z.string().optional(),
  frenchTechMotivations: z.array(z.string()).min(1, { message: "Veuillez sélectionner au moins une motivation" }),
});

const motivationsSchema = z.object({
  accompagnementProject: z.array(z.string()).optional(),
  reseauCommunaute: z.array(z.string()).optional(),
  formationCompetences: z.array(z.string()).optional(),
  financementBusiness: z.array(z.string()).optional(),
  ressourcesSupport: z.array(z.string()).optional(),
  visibiliteOpportunites: z.array(z.string()).optional(),
});

const budgetSchema = z.object({
  budgetFormation: z.string().optional(),
  disponibilite: z.string().optional(),
});

const legalSchema = z.object({
  companyCreated: z.string().min(1, { message: "Ce champ est requis" }),
  legalForm: z.string().optional(),
  creationDate: z.string().optional(),
  intellectualProperty: z.string().min(1, { message: "Ce champ est requis" }),
});

const productSchema = z.object({
  projectDescription: z.string().min(10, { message: "Veuillez fournir une description d'au moins 10 caractères" }),
  productDescription: z.string().min(10, { message: "Veuillez fournir une description d'au moins 10 caractères" }),
  hasUsers: z.string().min(1, { message: "Ce champ est requis" }),
  userCount: z.string().optional(),
});

const financeSchema = z.object({
  fundraising: z.string().min(1, { message: "Ce champ est requis" }),
  amountRaised: z.string().optional(),
  teamSize: z.string().min(1, { message: "Ce champ est requis" }),
});

const contactSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom est requis" }),
  lastName: z.string().min(2, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }),
  phone: z.string().min(10, { message: "Le numéro de téléphone est requis" }),
});

// Combined schema for the entire form
const formSchema = z.object({
  ...generalSchema.shape,
  ...motivationsSchema.shape,
  ...budgetSchema.shape,
  ...legalSchema.shape,
  ...productSchema.shape,
  ...financeSchema.shape,
  ...contactSchema.shape,
});

type FormData = z.infer<typeof formSchema>;

interface AuditFormProps {
  setFormData: (data: FormData) => void;
}

export function AuditForm({ setFormData }: AuditFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      sector: "",
      sectorOther: "",
      stage: "",
      website: "",
      frenchTechMotivations: [],
      accompagnementProject: [],
      reseauCommunaute: [],
      formationCompetences: [],
      financementBusiness: [],
      ressourcesSupport: [],
      visibiliteOpportunites: [],
      budgetFormation: "",
      disponibilite: "",
      companyCreated: "",
      legalForm: "",
      creationDate: "",
      intellectualProperty: "",
      projectDescription: "",
      productDescription: "",
      hasUsers: "",
      userCount: "",
      fundraising: "",
      amountRaised: "",
      teamSize: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  const { watch } = form;
  const companyCreated = watch("companyCreated");
  const hasUsers = watch("hasUsers");
  const fundraising = watch("fundraising");
  const sector = watch("sector");
  const stage = watch("stage");
  const frenchTechMotivations = watch("frenchTechMotivations");

  // Check if budget step should be shown
  const shouldShowBudgetStep = () => {
    return frenchTechMotivations?.includes("accompagnement") || frenchTechMotivations?.includes("formation");
  };

  // Get visible steps based on conditions
  const getVisibleSteps = () => {
    const steps = [...formSteps];
    if (!shouldShowBudgetStep()) {
      return steps.filter(step => step.id !== "budget");
    }
    return steps;
  };

  const visibleSteps = getVisibleSteps();

  const nextStep = async () => {
    const stepSchemas = [
      generalSchema,
      motivationsSchema,
      budgetSchema,
      legalSchema,
      productSchema,
      financeSchema,
      contactSchema,
    ];
    
    const currentStepId = visibleSteps[currentStep]?.id;
    let schemaIndex = formSteps.findIndex(step => step.id === currentStepId);
    
    const currentSchema = stepSchemas[schemaIndex];
    const currentValues = form.getValues();
    
    // Validate only the current step's fields
    const result = await currentSchema.safeParseAsync(currentValues);
    
    if (result.success) {
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      // Show errors for the current step
      result.error.errors.forEach((error) => {
        form.setError(error.path[0] as any, {
          type: "manual",
          message: error.message,
        });
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = async (data: FormData) => {
    setFormData(data);

    const dataToInsert = {
      nom_projet: data.projectName,
      secteur_activite: data.sector,
      secteur_autre: data.sectorOther,
      stade_developpement: data.stage,
      site_web: data.website,
      motivations_french_tech: data.frenchTechMotivations ? JSON.stringify(data.frenchTechMotivations) : null,
      accompagnement_projet: data.accompagnementProject ? JSON.stringify(data.accompagnementProject) : null,
      reseau_communaute: data.reseauCommunaute ? JSON.stringify(data.reseauCommunaute) : null,
      formation_competences: data.formationCompetences ? JSON.stringify(data.formationCompetences) : null,
      financement_business: data.financementBusiness ? JSON.stringify(data.financementBusiness) : null,
      ressources_support: data.ressourcesSupport ? JSON.stringify(data.ressourcesSupport) : null,
      visibilite_opportunites: data.visibiliteOpportunites ? JSON.stringify(data.visibiliteOpportunites) : null,
      budget_formation: data.budgetFormation,
      disponibilite: data.disponibilite,
      entreprise_creee: data.companyCreated,
      forme_juridique: data.legalForm,
      date_creation: data.creationDate === "" ? null : data.creationDate,
      propriete_intellectuelle: data.intellectualProperty,
      description_projet: data.projectDescription,
      description_produits_services: data.productDescription,
      a_utilisateurs: data.hasUsers,
      nombre_utilisateurs: data.userCount ? parseInt(data.userCount) : null,
      levee_fonds: data.fundraising,
      montant_leve: data.amountRaised ? parseInt(data.amountRaised) : null,
      taille_equipe: data.teamSize,
      prenom: data.firstName,
      nom: data.lastName,
      email: data.email,
      telephone: data.phone,
    };

    const { error } = await supabase
      .from('form-responses')
      .insert([dataToInsert]);

    if (error) {
      console.error("Error inserting data:", error);
      alert("Une erreur est survenue lors de l'enregistrement de vos réponses.");
    } else {
      console.log("Data inserted successfully!");
      // Determine which results page to navigate to based on the stage
      const isEarlyStage = ["idea", "mvp", "prototype"].includes(data.stage);
      navigate("/results", { state: { formData: data, isEarlyStage: isEarlyStage } });
    }
  };

  const frenchTechMotivationOptions = [
    { value: "accompagnement", label: "💡 Accompagnement Projet" },
    { value: "reseau", label: "🤝 Réseau & Communauté" },
    { value: "formation", label: "📚 Formation & Compétences" },
    { value: "financement", label: "💰 Financement & Business" },
    { value: "ressources", label: "🏢 Ressources & Support" },
    { value: "visibilite", label: "🎯 Visibilité & Opportunités" },
  ];

  const accompagnementOptions = [
    { value: "creation", label: "Aide à la création d'entreprise" },
    { value: "structurer", label: "Structurer mon idée/projet" },
    { value: "valider", label: "Valider mon business model" },
    { value: "accelerer", label: "Accélérer mon développement" },
    { value: "pivoter", label: "Pivôter/réorienter mon activité" },
  ];

  const reseauOptions = [
    { value: "entrepreneurs", label: "Rencontrer d'autres entrepreneurs" },
    { value: "associes", label: "Trouver des associés/cofondateurs" },
    { value: "echanger", label: "Échanger avec des pairs" },
    { value: "isolement", label: "Sortir de l'isolement" },
    { value: "ecosysteme", label: "Intégrer un écosystème dynamique" },
  ];

  const formationOptions = [
    { value: "competences", label: "Acquérir de nouvelles compétences" },
    { value: "outils", label: "Me former aux outils digitaux" },
    { value: "pitcher", label: "Apprendre à pitcher" },
    { value: "startups", label: "Comprendre le monde des startups" },
    { value: "monter", label: "Monter en compétence rapidement" },
  ];

  const financementOptions = [
    { value: "financements", label: "Accéder à des financements" },
    { value: "investisseurs", label: "Rencontrer des investisseurs" },
    { value: "subventions", label: "Obtenir des subventions" },
    { value: "clients", label: "Trouver mes premiers clients" },
    { value: "ca", label: "Développer mon chiffre d'affaires" },
  ];

  const ressourcesOptions = [
    { value: "espace", label: "Accéder à un espace de travail" },
    { value: "accompagnement", label: "Bénéficier d'un accompagnement personnalisé" },
    { value: "mentors", label: "Avoir des mentors/experts" },
    { value: "outils", label: "Utiliser des outils/ressources" },
    { value: "credibilite", label: "Gagner en crédibilité" },
  ];

  const visibiliteOptions = [
    { value: "visibilite", label: "Augmenter ma visibilité" },
    { value: "evenements", label: "Accéder à des événements exclusifs" },
    { value: "concours", label: "Participer à des concours" },
    { value: "partenariats", label: "Développer des partenariats" },
    { value: "international", label: "M'ouvrir à l'international" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Audit de votre projet entrepreneurial
        </h1>
        <p className="text-muted-foreground mt-2">
          Remplissez ce formulaire pour obtenir une analyse personnalisée
        </p>
      </div>

      <ProgressBar 
        currentStep={currentStep + 1} 
        totalSteps={visibleSteps.length} 
      />

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{visibleSteps[currentStep]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {visibleSteps[currentStep]?.id === "general" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de votre projet/entreprise *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. NomDeVotreStartup" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secteur d'activité *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fintech">FinTech</SelectItem>
                            <SelectItem value="healthtech">HealthTech</SelectItem>
                            <SelectItem value="edtech">EdTech</SelectItem>
                            <SelectItem value="ai">Intelligence Artificielle</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {sector === "other" && (
                    <FormField
                      control={form.control}
                      name="sectorOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Précisez votre secteur d'activité</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre secteur d'activité..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stade de développement *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="idea">Idée</SelectItem>
                            <SelectItem value="prototype">Prototype</SelectItem>
                            <SelectItem value="mvp">MVP</SelectItem>
                            <SelectItem value="market">Sur le marché</SelectItem>
                            <SelectItem value="scaling">En phase de croissance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(stage === "market" || stage === "scaling") && (
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lien vers votre site</FormLabel>
                          <FormControl>
                            <Input placeholder="https://votre-site.com" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="frenchTechMotivations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pourquoi souhaitez-vous rejoindre la French Tech ? *</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {frenchTechMotivationOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="frenchTechMotivations"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), option.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {visibleSteps[currentStep]?.id === "motivations" && (
                <div className="space-y-6">
                  {frenchTechMotivations?.includes("accompagnement") && (
                    <FormField
                      control={form.control}
                      name="accompagnementProject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">💡 Accompagnement Projet</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {accompagnementOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="accompagnementProject"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {frenchTechMotivations?.includes("reseau") && (
                    <FormField
                      control={form.control}
                      name="reseauCommunaute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">🤝 Réseau & Communauté</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {reseauOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="reseauCommunaute"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {frenchTechMotivations?.includes("formation") && (
                    <FormField
                      control={form.control}
                      name="formationCompetences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">📚 Formation & Compétences</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {formationOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="formationCompetences"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {frenchTechMotivations?.includes("financement") && (
                    <FormField
                      control={form.control}
                      name="financementBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">💰 Financement & Business</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {financementOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="financementBusiness"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {frenchTechMotivations?.includes("ressources") && (
                    <FormField
                      control={form.control}
                      name="ressourcesSupport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">🏢 Ressources & Support</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {ressourcesOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="ressourcesSupport"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {frenchTechMotivations?.includes("visibilite") && (
                    <FormField
                      control={form.control}
                      name="visibiliteOpportunites"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">🎯 Visibilité & Opportunités</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {visibiliteOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="visibiliteOpportunites"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {visibleSteps[currentStep]?.id === "budget" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="budgetFormation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget formation disponible :</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="<500">&lt; 500€</SelectItem>
                            <SelectItem value="500-1000">500-1000€</SelectItem>
                            <SelectItem value="1000-3000">1000-3000€</SelectItem>
                            <SelectItem value=">3000">&gt; 3000€</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disponibilite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilité :</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1jour">1 jour/mois</SelectItem>
                            <SelectItem value="2jours">2 jours/mois</SelectItem>
                            <SelectItem value="semaine">1 semaine intensive</SelectItem>
                            <SelectItem value="soirs">Soirs et weekends</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {visibleSteps[currentStep]?.id === "legal" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="companyCreated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous déjà créé votre entreprise ? *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Oui</SelectItem>
                            <SelectItem value="no">Non</SelectItem>
                            <SelectItem value="inProgress">En cours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {companyCreated === "yes" && (
                    <>
                      <FormField
                        control={form.control}
                        name="legalForm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forme juridique</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sasu">SASU</SelectItem>
                                <SelectItem value="sas">SAS</SelectItem>
                                <SelectItem value="eurl">EURL</SelectItem>
                                <SelectItem value="sarl">SARL</SelectItem>
                                <SelectItem value="ei">Entreprise Individuelle</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de création</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="intellectualProperty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous déposé des brevets ou marques ? *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Oui</SelectItem>
                            <SelectItem value="no">Non</SelectItem>
                            <SelectItem value="inProgress">En cours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {visibleSteps[currentStep]?.id === "product" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décrivez votre projet *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description de votre projet..." 
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
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décrivez vos produits et services *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description de vos produits et services..." 
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
                    name="hasUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous déjà des utilisateurs/clients ? *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Oui</SelectItem>
                            <SelectItem value="no">Non</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {hasUsers === "yes" && (
                    <FormField
                      control={form.control}
                      name="userCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combien d'utilisateurs/clients actifs avez-vous ?</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {visibleSteps[currentStep]?.id === "finance" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fundraising"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous déjà levé des fonds ? *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Oui</SelectItem>
                            <SelectItem value="no">Non</SelectItem>
                            <SelectItem value="inProgress">En cours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fundraising === "yes" && (
                    <FormField
                      control={form.control}
                      name="amountRaised"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant total levé (en €)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille de votre équipe *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="solo">Solo-entrepreneur</SelectItem>
                            <SelectItem value="2-5">2-5 personnes</SelectItem>
                            <SelectItem value="6-10">6-10 personnes</SelectItem>
                            <SelectItem value="11-20">11-20 personnes</SelectItem>
                            <SelectItem value="20+">Plus de 20 personnes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {visibleSteps[currentStep]?.id === "contact" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < visibleSteps.length - 1 ? (
            <Button 
              type="button" 
              onClick={nextStep}
              variant="default"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              variant="accent"
            >
              Soumettre
              <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
