"use client";

import { apiRoutes } from "@/app/api/apiRoutes";
import RoadmapApiAxiosInstance from "@/app/api/axiosInstance";
import NotFoundQuizResults from "@/app/components/Quiz/NotFoundQuizResults";
import QuizResults from "@/app/components/Quiz/QuizResults";
import QuizResultsLoading from "@/app/components/Quiz/QuizResultsLoading";
import { quizResultsProps } from "@/app/types/api";
import { AxiosError } from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "devmap_quiz_answers";

const Page = () => {
  const { quizId }   = useParams();
  const searchParams = useSearchParams();
  const roadmapId    = searchParams.get("roadmapId");
  const minPassPct   = Number(searchParams.get("minPassPct") ?? "50");

  const [loading,    setLoading]    = useState(false);
  const [quizResult, setQuizResult] = useState<quizResultsProps>();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Read stored answers in { questionId, answer } format
        const stored: { questionId: string; answer: string }[] =
          JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        const res = await RoadmapApiAxiosInstance.post(
          apiRoutes.Question.submitQuizAnswers.route(String(quizId)),
          { answers: stored }           // API expects: { answers: [{questionId, answer}] }
        );

        if (res.data.success) {
          const result: quizResultsProps = { ...res.data.result, roadmapId, minPassPct };
          setQuizResult(result);

          // Store pass/fail for roadmap project-unlock gate
          if (roadmapId) {
            if ((result.percentage ?? 0) >= minPassPct) {
              localStorage.setItem(`roadmap-quiz-passed-${roadmapId}`, "true");
            } else {
              localStorage.removeItem(`roadmap-quiz-passed-${roadmapId}`);
            }
          }

          // Clear answers after successful submit
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        const e = error as AxiosError<{ message: string }>;
        toast.error(e.response?.data?.message || e.message || "Submission failed");
      } finally { setLoading(false); }
    };

    if (quizId) fetchResults();
  }, [quizId, roadmapId, minPassPct]);

  if (loading)     return <QuizResultsLoading />;
  if (!quizResult) return <NotFoundQuizResults />;

  return (
    <QuizResults
      answerDetails={quizResult.answerDetails ?? []}
      correctAnswers={quizResult.correctAnswers ?? 0}
      grade={quizResult.grade ?? "F"}
      percentage={quizResult.percentage ?? 0}
      quizTitle={quizResult.quizTitle ?? ""}
      status={quizResult.status ?? "Failed"}
      totalQuestions={quizResult.totalQuestions ?? 0}
      wrongAnswers={quizResult.wrongAnswers ?? 0}
      quizId={String(quizId)}
      roadmapId={roadmapId}
      minPassPct={minPassPct}
    />
  );
};

export default Page;
