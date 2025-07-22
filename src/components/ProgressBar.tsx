import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8 w-full">
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Étape {currentStep} sur {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% complété</span>
      </div>
    </div>
  );
}