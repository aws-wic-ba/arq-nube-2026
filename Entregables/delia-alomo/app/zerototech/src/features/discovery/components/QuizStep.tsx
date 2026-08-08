import type { QuizQuestion as QuizQuestionType } from "../types";
import { OptionCard } from "./OptionCard";

interface QuizStepProps {
  question: QuizQuestionType;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

/**
 * Quiz step — Noxora Dark Space.
 */
export function QuizStep({ question, selectedOptionId, onSelectOption }: QuizStepProps) {
  return (
    <div className="animate-fade-up">
      <h2 className="mb-3 font-display text-title-sm text-text sm:text-title">
        {question.question}
      </h2>

      {question.hint && (
        <p className="mb-8 text-body text-text-muted">{question.hint}</p>
      )}

      <div className="stagger flex flex-col gap-3">
        {question.options.map((option) => (
          <OptionCard
            key={option.id}
            text={option.text}
            icon={option.icon}
            isSelected={selectedOptionId === option.id}
            onSelect={() => onSelectOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
