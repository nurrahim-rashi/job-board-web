import { useEffect, useRef, useState } from "react";
import { useSaveAnswer } from "../../hooks/api/pre-selection-test/useSaveAnswer";
import { useSubmitTest } from "../../hooks/api/pre-selection-test/useSubmitTest";
import { answerOptions, type AnswerOption, type TestScore, type TestSession } from "../../types/pre-selection-test";
import { formatCountdown, toAnswerMap, warningSeconds } from "./preSelectionTestData";

type TestRunnerProps = { slug: string; session: TestSession; onFinished: (result: TestScore) => void };

export function TestRunner({ slug, session, onFinished }: TestRunnerProps) {
  const saveAnswer = useSaveAnswer(slug);
  const submitTest = useSubmitTest(slug);

  const [answers, setAnswers] = useState(() => toAnswerMap(session.savedAnswers));
  const [active, setActive] = useState(0);
  const [remaining, setRemaining] = useState(session.remainingSeconds);
  const [notice, setNotice] = useState("");
  const finishing = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining > 0 || finishing.current) return;
    finishing.current = true;
    submitTest
      .mutateAsync()
      .then(onFinished)
      .catch(() => {
        finishing.current = false;
      });
  }, [remaining, submitTest, onFinished]);

  const total = session.questions.length;
  const current = session.questions[active];
  const picked = answers[current.id];
  const answered = session.questions.filter((question) => answers[question.id]).length;
  const blank = total - answered;

  function pick(option: AnswerOption) {
    setAnswers((saved) => ({ ...saved, [current.id]: option }));
    setNotice("");
    saveAnswer.mutate(
      { questionId: current.id, selectedAnswer: option },
      { onSuccess: (receipt) => setRemaining(receipt.remainingSeconds) },
    );
  }

  async function finish() {
    if (blank && !notice) {
      setNotice(`${blank} question${blank > 1 ? "s are" : " is"} still blank. They count as wrong once you submit.`);
      return;
    }
    if (finishing.current) return;
    finishing.current = true;
    const result = await submitTest.mutateAsync().catch(() => null);
    if (result) onFinished(result);
    else finishing.current = false;
  }

  return (
    <div className="pretest-layout">
      <aside className="panel-card pretest-side">
        <p className="eyebrow">Time left</p>
        <h2 className={remaining <= warningSeconds ? "low" : ""}>{formatCountdown(remaining)}</h2>
        <div className="pretest-meter">
          <i style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <p className="pretest-count">
          {answered} of {total} answered
        </p>
        <div className="pretest-grid">
          {session.questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              className={`${index === active ? "active" : ""} ${answers[question.id] ? "done" : ""}`}
              onClick={() => setActive(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </aside>

      <section className="panel-card pretest-question">
        <p className="eyebrow">
          Question {active + 1} of {total}
        </p>
        <h2>{current.question}</h2>
        <div className="pretest-options">
          {current.options.map((option, index) => (
            <button
              key={index}
              type="button"
              className={picked === answerOptions[index] ? "picked" : ""}
              onClick={() => pick(answerOptions[index])}
            >
              <b>{answerOptions[index]}</b>
              <span>{option}</span>
            </button>
          ))}
        </div>
        {notice ? <p className="pretest-note">{notice}</p> : null}
        <footer className="pretest-nav">
          <button type="button" className="pretest-step" disabled={active === 0} onClick={() => setActive(active - 1)}>
            Previous
          </button>
          <button type="button" className="pretest-step" disabled={active === total - 1} onClick={() => setActive(active + 1)}>
            Next question
          </button>
          <button type="button" className="button button-primary pretest-submit" disabled={submitTest.isPending} onClick={finish}>
            {submitTest.isPending ? "Submitting…" : notice ? "Submit anyway" : "Submit test"}
          </button>
        </footer>
      </section>
    </div>
  );
}
