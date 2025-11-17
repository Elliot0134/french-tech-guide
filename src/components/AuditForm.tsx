
import { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Send, RotateCcw } from "lucide-react";

const formSteps = [
  {
    id: "adherent",
    title: "Adhésion French Tech",
  },
  {
    id: "hasProject",
    title: "Projet entrepreneurial",
  },
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
  {
    id: "message",
    title: "Message complémentaire",
  },
];

// Form schemas for each step
const adherentSchema = z.object({
  isAdherent: z.enum(["yes", "no", ""], { required_error: "Veuillez sélectionner une option" }).refine(val => val !== "", { message: "Veuillez sélectionner une option" }),
  adherentCode: z.string().optional(),
});

const hasProjectSchema = z.object({
  hasProject: z.enum(["yes", "no", ""], { required_error: "Veuillez sélectionner une option" }).refine(val => val !== "", { message: "Veuillez sélectionner une option" }),
});

const generalSchema = z.object({
  projectName: z.string().optional(),
  sector: z.string().optional(),
  sectorOther: z.string().optional(),
  stage: z.string().optional(),
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
  aidesFinancieres: z.array(z.string()).optional(),
  autreAideFinanciere: z.string().optional(),
});

const legalSchema = z.object({
  companyCreated: z.string().optional(),
  legalForm: z.string().optional(),
  creationDate: z.string().optional(),
  intellectualProperty: z.string().optional(),
});

const productSchema = z.object({
  projectDescription: z.string().optional(),
  productDescription: z.string().optional(),
  hasUsers: z.string().optional(),
  userCount: z.string().optional(),
});

const financeSchema = z.object({
  fundraising: z.string().optional(),
  amountRaised: z.string().optional(),
  teamSize: z.string().optional(),
});

const contactSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom est requis" }),
  lastName: z.string().min(2, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }),
  phone: z.string().min(10, { message: "Le numéro de téléphone est requis" }),
});

const messageSchema = z.object({
  userAddMessage: z.string().optional(),
});

// Combined schema for the entire form
const formSchema = z.object({
  ...adherentSchema.shape,
  ...hasProjectSchema.shape,
  ...generalSchema.shape,
  ...motivationsSchema.shape,
  ...budgetSchema.shape,
  ...legalSchema.shape,
  ...productSchema.shape,
  ...financeSchema.shape,
  ...contactSchema.shape,
  ...messageSchema.shape,
});

type FormData = z.infer<typeof formSchema>;

interface AuditFormProps {
  setFormData: (data: FormData) => void;
  initialData?: Partial<FormData>;
  startStepId?: string;
}

export function AuditForm({ setFormData, initialData, startStepId }: AuditFormProps) {
  const navigate = useNavigate();

  const STORAGE_KEY = "frenchTechAuditForm";
  const STORAGE_STEP_KEY = "frenchTechAuditFormStep";

  // Load saved data from localStorage
  const getSavedData = (): Partial<FormData> => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Error loading saved form data:", error);
      return {};
    }
  };

  // Load saved step from localStorage
  const getSavedStep = (): number => {
    try {
      const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
      return savedStep ? parseInt(savedStep, 10) : 0;
    } catch (error) {
      console.error("Error loading saved step:", error);
      return 0;
    }
  };

  const savedData = getSavedData();
  const savedStep = getSavedStep();

  const initialStepIndex = startStepId
    ? formSteps.findIndex(step => step.id === startStepId)
    : savedStep;
  const [currentStep, setCurrentStep] = useState(initialStepIndex >= 0 ? initialStepIndex : 0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAdherent: "",
      adherentCode: "",
      hasProject: "",
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
      aidesFinancieres: [],
      autreAideFinanciere: "",
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
      userAddMessage: "",
      ...savedData, // Apply saved data from localStorage
      ...initialData, // Apply initial data (takes precedence)
    },
    mode: "onChange",
  });

  const { watch } = form;
  const isAdherent = watch("isAdherent");
  const adherentCode = watch("adherentCode");
  const hasProject = watch("hasProject");
  const companyCreated = watch("companyCreated");
  const hasUsers = watch("hasUsers");
  const fundraising = watch("fundraising");
  const sector = watch("sector");
  const stage = watch("stage");
  const frenchTechMotivations = watch("frenchTechMotivations");
  const aidesFinancieres = watch("aidesFinancieres");

  // State for adherent code validation
  const [codeError, setCodeError] = useState<string>("");
  const [codeValid, setCodeValid] = useState<boolean>(false);

  // Real-time validation of adherent code
  useEffect(() => {
    const validCode = "FTGP-ADH-2025";
    if (isAdherent === "yes" && adherentCode) {
      if (adherentCode.trim().toUpperCase() === validCode) {
        setCodeValid(true);
        setCodeError("");
      } else {
        setCodeValid(false);
      }
    } else {
      setCodeValid(false);
      setCodeError("");
    }
  }, [adherentCode, isAdherent]);

  // Auto-save form data to localStorage
  useEffect(() => {
    const subscription = watch((formData) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Save current step to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
    } catch (error) {
      console.error("Error saving current step:", error);
    }
  }, [currentStep]);

  // Check if budget step should be shown
  const shouldShowBudgetStep = () => {
    return frenchTechMotivations?.includes("accompagnement") ||
           frenchTechMotivations?.includes("formation") ||
           frenchTechMotivations?.includes("ressources");
  };

  // Get visible steps based on conditions
  const getVisibleSteps = () => {
    const steps = [...formSteps];

    // If hasProject is "no", show only: adherent, hasProject, general (with limited motivations), motivations (details), contact, message
    if (hasProject === "no") {
      return steps.filter(step =>
        step.id === "adherent" ||
        step.id === "hasProject" ||
        step.id === "general" ||
        step.id === "motivations" ||
        step.id === "contact" ||
        step.id === "message"
      );
    }

    // If hasProject is "yes", show all steps except message
    if (hasProject === "yes") {
      let filteredSteps = steps.filter(step => step.id !== "message");

      // Also filter budget step if conditions not met
      if (!shouldShowBudgetStep()) {
        filteredSteps = filteredSteps.filter(step => step.id !== "budget");
      }

      return filteredSteps;
    }

    // If hasProject not selected yet, only show adherent and hasProject steps
    return steps.filter(step => step.id === "adherent" || step.id === "hasProject");
  };

  const visibleSteps = getVisibleSteps();

  const nextStep = async () => {
    const stepSchemas = [
      adherentSchema,
      hasProjectSchema,
      generalSchema,
      motivationsSchema,
      budgetSchema,
      legalSchema,
      productSchema,
      financeSchema,
      contactSchema,
      messageSchema,
    ];

    const currentStepId = visibleSteps[currentStep]?.id;
    let schemaIndex = formSteps.findIndex(step => step.id === currentStepId);

    // Special validation for adherent step
    if (currentStepId === "adherent") {
      const currentValues = form.getValues();

      if (!currentValues.isAdherent || currentValues.isAdherent === "") {
        form.setError("isAdherent", {
          type: "manual",
          message: "Veuillez sélectionner une option",
        });
        return;
      }

      // If user said yes, validate the code
      if (currentValues.isAdherent === "yes") {
        const enteredCode = currentValues.adherentCode?.trim() || "";
        const validCode = "FTGP-ADH-2025";

        if (enteredCode.toUpperCase() !== validCode) {
          setCodeError("Code invalide");
          return;
        }
      }

      // Clear code error if validation passed
      setCodeError("");
    }

    // Special validation for hasProject step
    if (currentStepId === "hasProject") {
      const currentValues = form.getValues();

      if (!currentValues.hasProject || currentValues.hasProject === "") {
        form.setError("hasProject", {
          type: "manual",
          message: "Veuillez sélectionner une option",
        });
        return;
      }
    }

    // Special validation for general step
    if (currentStepId === "general") {
      const currentValues = form.getValues();

      // Validate frenchTechMotivations for both cases
      if (!currentValues.frenchTechMotivations || currentValues.frenchTechMotivations.length === 0) {
        form.setError("frenchTechMotivations", {
          type: "manual",
          message: "Veuillez sélectionner au moins une motivation",
        });
        return;
      }

      // When hasProject is "yes", validate additional fields
      if (hasProject === "yes") {
        let hasError = false;

        if (!currentValues.projectName || currentValues.projectName.length < 2) {
          form.setError("projectName", {
            type: "manual",
            message: "Le nom du projet est requis",
          });
          hasError = true;
        }

        if (!currentValues.sector || currentValues.sector === "") {
          form.setError("sector", {
            type: "manual",
            message: "Le secteur d'activité est requis",
          });
          hasError = true;
        }

        if (!currentValues.stage || currentValues.stage === "") {
          form.setError("stage", {
            type: "manual",
            message: "Le stade de développement est requis",
          });
          hasError = true;
        }

        if (hasError) {
          return;
        }
      }

      // Validation passed, move to next step
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
      return;
    }

    // Special validation for legal step when hasProject is "yes"
    if (currentStepId === "legal" && hasProject === "yes") {
      const currentValues = form.getValues();
      let hasError = false;

      if (!currentValues.companyCreated || currentValues.companyCreated === "") {
        form.setError("companyCreated", {
          type: "manual",
          message: "Ce champ est requis",
        });
        hasError = true;
      }

      if (!currentValues.intellectualProperty || currentValues.intellectualProperty === "") {
        form.setError("intellectualProperty", {
          type: "manual",
          message: "Ce champ est requis",
        });
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Validation passed, move to next step
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
      return;
    }

    // Special validation for product step when hasProject is "yes"
    if (currentStepId === "product" && hasProject === "yes") {
      const currentValues = form.getValues();
      let hasError = false;

      if (!currentValues.projectDescription || currentValues.projectDescription.length < 10) {
        form.setError("projectDescription", {
          type: "manual",
          message: "Veuillez fournir une description d'au moins 10 caractères",
        });
        hasError = true;
      }

      if (!currentValues.productDescription || currentValues.productDescription.length < 10) {
        form.setError("productDescription", {
          type: "manual",
          message: "Veuillez fournir une description d'au moins 10 caractères",
        });
        hasError = true;
      }

      if (!currentValues.hasUsers || currentValues.hasUsers === "") {
        form.setError("hasUsers", {
          type: "manual",
          message: "Ce champ est requis",
        });
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Validation passed, move to next step
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
      return;
    }

    // Special validation for finance step when hasProject is "yes"
    if (currentStepId === "finance" && hasProject === "yes") {
      const currentValues = form.getValues();
      let hasError = false;

      if (!currentValues.fundraising || currentValues.fundraising === "") {
        form.setError("fundraising", {
          type: "manual",
          message: "Ce champ est requis",
        });
        hasError = true;
      }

      if (!currentValues.teamSize || currentValues.teamSize === "") {
        form.setError("teamSize", {
          type: "manual",
          message: "Ce champ est requis",
        });
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Validation passed, move to next step
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
      return;
    }

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

  const resetForm = () => {
    if (confirm("Êtes-vous sûr de vouloir recommencer le formulaire depuis le début ? Toutes vos réponses seront effacées.")) {
      // Clear localStorage
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_STEP_KEY);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }

      // Reset form to initial state
      form.reset({
        isAdherent: "",
        adherentCode: "",
        hasProject: "",
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
        aidesFinancieres: [],
        autreAideFinanciere: "",
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
        userAddMessage: "",
      });

      // Reset to first step
      setCurrentStep(0);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = async (data: FormData) => {
    setFormData(data);

    const projectId = crypto.randomUUID(); // Generate a unique project ID

    // Determine if user is adherent (yes with valid code)
    const isValidAdherent = data.isAdherent === "yes" &&
                            data.adherentCode?.trim().toUpperCase() === "FTGP-ADH-2025";

    // Convert date from YYYY-MM-DD to DD/MM/YYYY
    const formatDateToFrench = (dateStr: string): string | null => {
      if (!dateStr || dateStr === "") return null;
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    const dataToInsert = {
      project_id: projectId, // Add project_id to the data
      adherant: isValidAdherent,
      has_project: data.hasProject === "yes",
      nom_projet: data.projectName || "",
      secteur_activite: data.sector || "",
      secteur_autre: data.sectorOther || "",
      stade_developpement: data.stage || "",
      site_web: data.website || "",
      motivations_french_tech: data.frenchTechMotivations ? JSON.stringify(data.frenchTechMotivations) : null,
      accompagnement_projet: data.accompagnementProject ? JSON.stringify(data.accompagnementProject) : null,
      reseau_communaute: data.reseauCommunaute ? JSON.stringify(data.reseauCommunaute) : null,
      formation_competences: data.formationCompetences ? JSON.stringify(data.formationCompetences) : null,
      financement_business: data.financementBusiness ? JSON.stringify(data.financementBusiness) : null,
      ressources_support: data.ressourcesSupport ? JSON.stringify(data.ressourcesSupport) : null,
      visibilite_opportunites: data.visibiliteOpportunites ? JSON.stringify(data.visibiliteOpportunites) : null,
      budget_formation: data.budgetFormation || "",
      disponibilite: data.disponibilite || "",
      aides_financieres: data.aidesFinancieres ? JSON.stringify(data.aidesFinancieres) : null,
      autre_aide_financiere: data.autreAideFinanciere || "",
      entreprise_creee: data.companyCreated || "",
      forme_juridique: data.legalForm || "",
      date_creation: formatDateToFrench(data.creationDate || ""),
      propriete_intellectuelle: data.intellectualProperty || "",
      description_projet: data.projectDescription || "",
      description_produits_services: data.productDescription || "",
      a_utilisateurs: data.hasUsers || "",
      nombre_utilisateurs: data.userCount ? parseInt(data.userCount) : null,
      levee_fonds: data.fundraising || "",
      montant_leve: data.amountRaised ? parseInt(data.amountRaised) : null,
      taille_equipe: data.teamSize || "",
      prenom: data.firstName,
      nom: data.lastName,
      email: data.email,
      telephone: data.phone,
      user_add_message: data.userAddMessage || "",
    };

    const { error } = await supabase
      .from('form-responses')
      .insert([dataToInsert]);

    if (error) {
      console.error("Error inserting data:", error);
      alert("Une erreur est survenue lors de l'enregistrement de vos réponses.");
    } else {
      console.log("Data inserted successfully!");

      // Clear localStorage after successful submission
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_STEP_KEY);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }

      // Send projectId, aidesFinancieres, autreAideFinanciere and userAddMessage to webhook
      try {
        const webhookUrl = "https://n8n.srv906204.hstgr.cloud/webhook/formulaire-1-french-tech";
        const webhookPayload = {
          projectId: projectId,
          aidesFinancieres: data.aidesFinancieres || [],
          autreAideFinanciere: data.autreAideFinanciere || "",
          userAddMessage: data.userAddMessage || ""
        };

        console.log("Calling webhook:", webhookUrl);
        console.log("Webhook payload:", webhookPayload);

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        });

        console.log("Webhook response status:", response.status);
        console.log("Webhook response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Webhook call failed:", response.statusText, errorText);
        } else {
          console.log("ProjectId, aidesFinancieres and userAddMessage sent to webhook successfully!");
        }
      } catch (webhookError) {
        console.error("Error sending data to webhook:", webhookError);
        console.error("Webhook error details:", webhookError);
      }

      // Determine which results page to navigate to based on the stage
      // If user has no project (hasProject = "no"), treat as early stage
      const isEarlyStage = data.hasProject === "no" || ["idea", "mvp", "prototype"].includes(data.stage || "");

      // If this is the second form submission, navigate to the submitted results page
      if (startStepId) {
        navigate(`/results/submitted?projectId=${projectId}`, { state: { formData: data, isSecondFormSubmitted: true, isAdherent: isValidAdherent } });
      } else {
        navigate(`/results?projectId=${projectId}`, { state: { formData: data, isEarlyStage: isEarlyStage, isAdherent: isValidAdherent } });
      }
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
        {(currentStep > 0 || Object.keys(savedData).length > 0) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="mt-4"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer le formulaire
          </Button>
        )}
      </div>

      <ProgressBar
        currentStep={currentStep + 1}
        totalSteps={visibleSteps.length}
      />

      <Card className="border-primary/20">
        {visibleSteps[currentStep]?.id !== "adherent" && (
          <CardHeader>
            <CardTitle>{visibleSteps[currentStep]?.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {visibleSteps[currentStep]?.id === "adherent" && (
                <div className="space-y-6">
                  <div className="text-center mb-6 mt-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Êtes-vous adhérent French Tech Grande Provence ?
                    </h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="isAdherent"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                              type="button"
                              variant={field.value === "yes" ? "default" : "outline"}
                              size="lg"
                              className="w-full sm:w-40"
                              onClick={() => {
                                field.onChange("yes");
                                setCodeError("");
                              }}
                            >
                              Oui
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "no" ? "default" : "outline"}
                              size="lg"
                              className="w-full sm:w-40"
                              onClick={() => {
                                field.onChange("no");
                                form.setValue("adherentCode", "");
                                setCodeError("");
                              }}
                            >
                              Non
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isAdherent === "yes" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="adherentCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code adhérent *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Entrez votre code adhérent"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setCodeError("");
                                }}
                              />
                            </FormControl>
                            {codeValid && (
                              <p className="text-sm font-medium text-green-600">✓ Code valide</p>
                            )}
                            {codeError && (
                              <p className="text-sm font-medium text-destructive">{codeError}</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {visibleSteps[currentStep]?.id === "hasProject" && (
                <div className="space-y-6">
                  <div className="text-center mb-6 mt-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Avez-vous un projet entrepreneurial ?
                    </h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="hasProject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                              type="button"
                              variant={field.value === "yes" ? "default" : "outline"}
                              size="lg"
                              className="w-full sm:w-40"
                              onClick={() => field.onChange("yes")}
                            >
                              Oui
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "no" ? "default" : "outline"}
                              size="lg"
                              className="w-full sm:w-40"
                              onClick={() => field.onChange("no")}
                            >
                              Non
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {visibleSteps[currentStep]?.id === "general" && (
                <div className="space-y-6">
                  {hasProject === "yes" && (
                    <>
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
                                <SelectItem value="agrotech">AgroTech</SelectItem>
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
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="frenchTechMotivations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pourquoi souhaitez-vous rejoindre la French Tech ? *</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {frenchTechMotivationOptions
                            .filter(option =>
                              hasProject === "yes" ||
                              option.value === "reseau" ||
                              option.value === "visibilite"
                            )
                            .map((option) => (
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
                            <SelectItem value="1jour_sem">1 jour/sem</SelectItem>
                            <SelectItem value="quelques_jours_mois">Quelques jours/mois</SelectItem>
                            <SelectItem value="semaine">1 semaine intensive</SelectItem>
                            <SelectItem value="soirs">Soirs et weekends</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aidesFinancieres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous des aides financières ?</FormLabel>
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          {[
                            { value: "Pôle emploi", label: "Pôle emploi" },
                            { value: "UpCo", label: "UpCo" },
                            { value: "Autre", label: "Autre" },
                          ].map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="aidesFinancieres"
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

                  {aidesFinancieres?.includes("Autre") && (
                    <FormField
                      control={form.control}
                      name="autreAideFinanciere"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Précisez l'aide financière</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'aide financière..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
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

              {visibleSteps[currentStep]?.id === "message" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userAddMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Souhaitez-vous ajouter un message à votre demande ?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Votre message..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
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
