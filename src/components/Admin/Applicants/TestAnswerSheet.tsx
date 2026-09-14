import { useTestResult } from "../../../hooks/api/pre-selection-test/useTestResult";
import { answerOptions } from "../../../types/pre-selection-test";
import { formatDateTime } from "./applicantHelpers";

type TestAnswerSheetProps = { slug: string; applicationId: number };

export function TestAnswerSheet({ slug, applicationId }: TestAnswerSheetProps) {
  const { data, isPending, isError, error } = useTestResult(slug, applicationId);

  if (isPending) return <div className="applicant-dialog-state">Loading the answer sheet…</div>;
  if (isError || !data) return <div className="applicant-dialog-state">{error?.message ?? "No test result yet."}</div>;

  return (
    <div className="test-sheet">
      <div className="test-sheet-head">
        <div>
          <p className="eyebrow">Score</p>
          <b>{data.score}</b>
          <small>
            {data.correctCount} of {data.totalQuestions} correct
          </small>
        </div>
        <div>
          <p className="eyebrow">Started</p>
          <small>{data.startedAt ? formatDateTime(data.startedAt) : "Not recorded"}</small>
          <p className="eyebrow">Submitted</p>
          <small>{data.submittedAt ? formatDateTime(data.submittedAt) : "Ran out of time"}</small>
        </div>
      </div>

      <ol className="test-sheet-list">
        {data.details.map((item) => (
          <li key={item.questionId} className={item.isCorrect ? "right" : item.selectedAnswer ? "wrong" : "blank"}>
            <p className="test-sheet-question">
              <em>{item.number}</em>
              {item.question}
            </p>
            <ul>
              {item.options.map((option, index) => {
                const letter = answerOptions[index];
                const chosen = item.selectedAnswer === letter;
                const key = item.correctAnswer === letter;

                return (
                  <li key={letter} className={`${key ? "key" : ""} ${chosen ? "chosen" : ""}`}>
                    <b>{letter}</b>
                    <span>{option}</span>
                    {key ? <small>Correct answer</small> : chosen ? <small>Their pick</small> : null}
                  </li>
                );
              })}
            </ul>
            {!item.selectedAnswer ? <p className="admin-note">Left blank.</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
