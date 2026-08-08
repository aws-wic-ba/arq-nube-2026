import { MainLayout } from "@/layouts/MainLayout";
import { HeroSection } from "@/features/home";
import { DiscoveryTest } from "@/features/discovery";
import { ResultsPage, useProgress } from "@/features/results";
import { GuideSection } from "@/features/guide";
import { CompaniesSection } from "@/features/companies";
import { OpportunitiesSection } from "@/features/opportunities";
import type { QuizResult } from "@/features/discovery";

/**
 * ZeroToTech — Plataforma de exploración IT.
 *
 * Flujo:
 * 1. Inicio (Hero)
 * 2. Descubrí tu pasión (Test + Roadmap)
 * 3. Roles IT
 * 4. Empresas
 * 5. Oportunidades (Fundaciones + Comunidades + Eventos)
 * 6. Roadmap (dentro de resultados)
 */
function App() {
  const {
    quizResult,
    totalXP,
    setQuizResult,
    completeNode,
    isNodeCompleted,
    resetProgress,
  } = useProgress();

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
  };

  return (
    <MainLayout>
      {/* 1. Inicio */}
      <HeroSection />

      {/* 2. Descubrí tu pasión + 6. Roadmap */}
      <div id="descubri">
        {!quizResult ? (
          <DiscoveryTest onComplete={handleQuizComplete} />
        ) : (
          <div id="roadmap">
            <ResultsPage
              result={quizResult}
              totalXP={totalXP}
              isNodeCompleted={isNodeCompleted}
              onMarkCompleted={completeNode}
              onReset={resetProgress}
            />
          </div>
        )}
      </div>

      {/* 3. Roles IT */}
      <div id="roles">
        <GuideSection />
      </div>

      {/* 4. Empresas */}
      <CompaniesSection />

      {/* 5. Oportunidades (Fundaciones + Comunidades + Eventos) */}
      <OpportunitiesSection userProfile={quizResult?.winner ?? null} />
    </MainLayout>
  );
}

export default App;
