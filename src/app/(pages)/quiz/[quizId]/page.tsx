"use client";

import QuestionItem from "@/app/components/Quiz/QuestionItem";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import QuizDetailsLoading from "@/app/components/Quiz/QuizDetailsLoading";
import RoadmapApiAxiosInstance from "@/app/api/axiosInstance";
import { apiRoutes } from "@/app/api/apiRoutes";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { QuestionItemProps } from "@/app/types/quiz";
import { QuestionProps } from "@/app/types/api";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import UnauthorizedPage from "@/app/components/Auth/UnauthorizedPage";
import { randomizeAnswers } from "@/app/helper";

// API expects: { answers: [{ questionId: string, answer: string }] }
const STORAGE_KEY = "devmap_quiz_answers";

const Page = () => {
  const searchParams    = useSearchParams();
  const { quizId }      = useParams();
  const router          = useRouter();
  const quizTitle       = searchParams.get("quizTitle");
  const quizDescription = searchParams.get("quizDescription");
  const roadmapId       = searchParams.get("roadmapId");
  const QUESTION_PER_PAGE = 10;

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [questionDetails, setQuestionDetails] = useState<QuestionProps>();
  const [loading, setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // { [questionId]: answerText }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = useMemo(() => {
    const total = questionDetails?.questions.length ?? 0;
    return total ? (answeredCount / total) * 100 : 0;
  }, [answeredCount, questionDetails]);

  // Save answer in { questionId, answer } format that the API expects
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    const stored: { questionId: string; answer: string }[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    const idx = stored.findIndex((q) => q.questionId === questionId);
    if (idx !== -1) stored[idx].answer = answer;
    else stored.push({ questionId, answer });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  };

  // Fetch questions for current page
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await RoadmapApiAxiosInstance.get(
          apiRoutes.Question.getAllQuestionsByQuiz.route(String(quizId), {
            page: currentPage, random: false, limit: QUESTION_PER_PAGE,
          })
        );
        if (res.data.success) {
          const shuffled = res.data.questions.map((q: QuestionItemProps) => ({
            ...q, options: q.options ? randomizeAnswers([...q.options]) : q.options,
          }));
          setQuestionDetails({ ...res.data, questions: shuffled });
        }
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        toast.error(e.message || "Something went wrong");
      } finally { setLoading(false); }
    };
    fetch();
  }, [quizId, isAuthenticated, currentPage]);

  // Restore answers from localStorage when page loads
  useEffect(() => {
    if (!questionDetails?.questions) return;
    const stored: { questionId: string; answer: string }[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    const restored: Record<string, string> = {};
    questionDetails.questions.forEach((q) => {
      const found = stored.find((s) => s.questionId === String(q._id));
      if (found) restored[String(q._id)] = found.answer;
    });
    setSelectedAnswers(restored);
  }, [questionDetails]);

  const handleNext = () => {
    if (currentPage < (questionDetails?.totalPages ?? 1)) {
      setCurrentPage((p) => p + 1);
    } else {
      const params = new URLSearchParams();
      if (quizTitle)  params.set("quizTitle", quizTitle);
      if (roadmapId)  params.set("roadmapId", roadmapId);
      router.push(`/quiz/${quizId}/submit?${params.toString()}`);
    }
  };

  if (!isAuthenticated) return <UnauthorizedPage mode="authenticate" />;
  if (loading) return <QuizDetailsLoading />;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="devmap-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{quizTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">{quizDescription}</p>
            </div>
            <div className="devmap-card bg-muted shrink-0 text-center px-4 py-2">
              <p className="text-xs text-muted-foreground">Answered</p>
              <p className="text-lg font-bold text-primary">{answeredCount}/{questionDetails?.questions.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Page {currentPage} of {questionDetails?.totalPages}</span>
              <span className="text-primary font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <div className="devmap-progress">
              <div className="devmap-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {questionDetails?.questions?.map((q: QuestionItemProps, i) => (
            <QuestionItem
              key={q._id}
              _id={String(q._id)}
              questionNumber={(currentPage - 1) * QUESTION_PER_PAGE + (i + 1)}
              question={q.question}
              answers={q.options!}
              selectedAnswer={selectedAnswers[String(q._id)]}
              onSelectAnswer={handleSelectAnswer}
            />
          ))}
        </div>

        <div className="devmap-card flex items-center justify-between">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="btn-secondary text-sm px-4 py-2.5 rounded-xl gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={15} /> Previous
          </button>
          <button disabled={answeredCount !== questionDetails?.questions.length} onClick={handleNext}
            className="btn-primary text-sm px-6 py-2.5 rounded-xl gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {currentPage === questionDetails?.totalPages
              ? <><Check size={15} /> Submit Quiz</>
              : <>Submit & Next <ChevronRight size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
