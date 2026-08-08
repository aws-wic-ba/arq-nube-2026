import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import type { ITCategory, QuizResult } from "./types";
import { quizQuestions } from "./data";
import { XPTracker, QuizStep, DiscoveryLoader } from "./components";

type QuizPhase = "quiz" | "loading" | "done";

interface DiscoveryTestProps {
  onComplete?: (result: QuizResult) => void;
}

/**
 * Discovery Test — Noxora Dark Space.
 */
export function DiscoveryTest({ onComplete }: DiscoveryTestProps) {
  const [phase, setPhase] = useState<QuizPhase>("quiz");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const totalSteps = quizQuestions.length;
  const currentQuestion = quizQuestions[currentStep];
  const selectedOptionId = answers[currentStep] ?? null;

  const handleSelectOption = useCallback((optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: optionId }));
  }, [currentStep]);

  const calculateResult = useCallback((): QuizResult => {
    const scores: Record<ITCategory, number> = {
      soporte: 0, cloud: 0, ciberseguridad: 0, "ux-ui": 0, desarrollo: 0,
    };
    for (const [stepIndex, optionId] of Object.entries(answers)) {
      const question = quizQuestions[Number(stepIndex)];
      const selectedOption = question?.options.find((o) => o.id === optionId);
      if (selectedOption) scores[selectedOption.category] += 1;
    }
    const winner = (Object.entries(scores) as [ITCategory, number][]).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max)
    )[0];
    return { winner, scores };
  }, [answers]);

  const handleNext = useCallback(() => {
    if (!selectedOptionId) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setPhase("loading");
      setTimeout(() => {
        const result = calculateResult();
        setPhase("done");
        onComplete?.(result);
      }, 3200);
    }
  }, [currentStep, totalSteps, selectedOptionId, calculateResult, onComplete]);

  if (phase === "loading" || phase === "done") {
    return (
      <section id="discovery-test" className="mx-auto max-w-xl px-6 py-22">
        <DiscoveryLoader />
      </section>
    );
  }

  return (
    <section id="discovery-test" className="mx-auto max-w-xl px-6 py-22" aria-label="Test de descubrimiento IT">
      <div className="glass-card rounded-2xl p-8 sm:p-10">
        <XPTracker current={currentStep + 1} total={totalSteps} className="mb-10" />

        <QuizStep
          key={currentQuestion.id}
          question={currentQuestion}
          selectedOptionId={selectedOptionId}
          onSelectOption={handleSelectOption}
        />

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedOptionId}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-brand px-7 py-4 text-body font-semibold text-background shadow-glow transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(127,255,208,0.2)] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
          >
            {currentStep < totalSteps - 1 ? "Siguiente" : "Ver mi perfil"}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
