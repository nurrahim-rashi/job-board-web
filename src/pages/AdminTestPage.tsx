import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { questionCount } from "../components/Admin/adminData";
import { useJobPosting } from "../hooks/api/job-posting/useJobPosting";
import { usePreSelectionTest } from "../hooks/api/pre-selection-test/usePreSelectionTest";
import { useSaveTestQuestions } from "../hooks/api/pre-selection-test/useSaveTestQuestions";
import { useSetTestActivation } from "../hooks/api/pre-selection-test/useSetTestActivation";
import { answerOptions, type TestQuestionInput } from "../types/pre-selection-test";
import { ArrowLeft, Check } from "../components/site/Icons";

type Draft = { question: string; options: string[]; answer: number };

const blankQuestion = (): Draft => ({ question: "", options: ["", "", "", ""], answer: 0 });
const blankTest = () => Array.from({ length: questionCount }, blankQuestion);

export default function AdminTestPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const job = useJobPosting(slug);
  const test = usePreSelectionTest(slug);
  const saveQuestions = useSaveTestQuestions(slug);
  const setActivation = useSetTestActivation(slug);

  const [questions, setQuestions] = useState<Draft[]>(blankTest);
  const [duration, setDuration] = useState("30");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  const saved = test.data;

  useEffect(() => {
    if (!saved) return;
    const stored = saved.questions.map((item) => ({
      question: item.question,
      options: item.options,
      answer: Math.max(0, answerOptions.indexOf(item.correctAnswer)),
    }));
    setQuestions([...stored, ...blankTest()].slice(0, questionCount));
    if (saved.testDurationMinutes) setDuration(String(saved.testDurationMinutes));
  }, [saved]);

  if (test.isPending || job.isPending) {
    return (
      <AdminShell eyebrow="Pre-selection test" title="Loading test…">
        <div className="admin-empty">
          <h2>Fetching the questions for this posting.</h2>
        </div>
      </AdminShell>
    );
  }

  if (test.isError || job.isError || !saved) {
    return (
      <AdminShell eyebrow="Pre-selection test" title="Posting not found">
        <div className="admin-empty">
          <h2>{test.error?.message ?? job.error?.message ?? "That posting is no longer in your dashboard."}</h2>
          <Link className="admin-btn ghost" to="/admin">
            Back to job postings
          </Link>
        </div>
      </AdminShell>
    );
  }

  const locked = saved.isLocked;
  const testOn = saved.hasPreSelectionTest;
  const current = questions[active];
  const complete = questions.filter(isComplete);
  const filled = complete.length;
  const busy = saveQuestions.isPending || setActivation.isPending;

  function update(patch: Partial<Draft>) {
    setQuestions((list) => list.map((item, index) => (index === active ? { ...item, ...patch } : item)));
    setNotice("");
  }

  function updateOption(index: number, value: string) {
    update({ options: current.options.map((option, position) => (position === index ? value : option)) });
  }

  async function submit() {
    if (!filled) {
      setNotice("Write at least one complete question before saving.");
      return;
    }
    const minutes = Number(duration);
    if (!Number.isInteger(minutes) || minutes < 1) {
      setNotice("Set a whole number of minutes for the time limit before saving.");
      return;
    }
    const duplicate = questions.findIndex((item) => isComplete(item) && hasDuplicateOptions(item));
    if (duplicate !== -1) {
      setActive(duplicate);
      setNotice(`Question ${duplicate + 1} repeats an answer option — each of the four must be different.`);
      return;
    }
    const payload: TestQuestionInput[] = complete.map((item) => ({
      question: item.question.trim(),
      options: item.options.map((option) => option.trim()),
      correctAnswer: answerOptions[item.answer],
    }));
    const result = await saveQuestions.mutateAsync({ questions: payload, testDurationMinutes: minutes }).catch(() => null);
    if (result) navigate(`/admin/jobs/${slug}`);
  }

  function toggleActivation() {
    if (testOn) {
      setActivation.mutate({ hasPreSelectionTest: false });
      return;
    }
    const minutes = Number(duration);
    if (!Number.isInteger(minutes) || minutes < 1) {
      setNotice("Set a whole number of minutes before activating the test.");
      return;
    }
    setActivation.mutate({ hasPreSelectionTest: true, testDurationMinutes: minutes });
  }

  return (
    <AdminShell
      eyebrow="Pre-selection test"
      title={job.data?.title ?? "Pre-selection test"}
      lead={`Write up to ${questionCount} multiple choice questions. Applicants must pass through this before their application continues.`}
      actions={
        <>
          <Link className="admin-btn ghost" to={`/admin/jobs/${slug}`}>
            <ArrowLeft /> Back
          </Link>
          <button type="button" className="admin-btn primary" onClick={submit} disabled={busy || locked}>
            {saveQuestions.isPending ? "Saving…" : "Save test"}
          </button>
        </>
      }
    >
      {locked ? <p className="admin-alert">An applicant has already answered this test, so the questions are locked and can no longer be edited.</p> : null}
      {notice ? <p className="admin-alert">{notice}</p> : null}

      <div className="admin-card">
        <div className="admin-detail-head">
          <div>
            <p className="eyebrow">Activation</p>
            <h2>{testOn ? "Test required" : "Test not required"}</h2>
            <p className="admin-note">
              {saved.totalQuestions === saved.requiredQuestions
                ? `All ${saved.requiredQuestions} questions are saved.`
                : `${saved.totalQuestions} of ${saved.requiredQuestions} questions saved — all ${saved.requiredQuestions} are needed before the test can be switched on.`}
            </p>
          </div>
          <button
            type="button"
            className={`admin-switch ${testOn ? "on" : ""}`}
            disabled={busy}
            onClick={toggleActivation}
            aria-label={testOn ? "Turn the test off" : "Turn the test on"}
          >
            <i />
          </button>
        </div>
        <div className="admin-fields">
          <label>
            Time limit (minutes)
            <input inputMode="numeric" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="30" />
          </label>
        </div>
      </div>

      <div className="admin-test">
        <aside className="admin-card">
          <p className="eyebrow">Progress</p>
          <h2>
            {filled}/{questionCount}
          </h2>
          <div className="admin-progress">
            <i style={{ width: `${(filled / questionCount) * 100}%` }} />
          </div>
          <div className="admin-question-grid">
            {questions.map((question, index) => (
              <button key={index} type="button" className={`${index === active ? "active" : ""} ${isComplete(question) ? "done" : ""}`} onClick={() => setActive(index)}>
                {index + 1}
              </button>
            ))}
          </div>
        </aside>

        <section className="admin-card">
          <p className="eyebrow">Question {active + 1}</p>
          <label className="admin-question-field">
            Question
            <textarea value={current.question} disabled={locked} onChange={(event) => update({ question: event.target.value })} placeholder="Which artifact best communicates interaction states to engineers?" />
          </label>
          <p className="admin-note">Pick the correct answer by selecting its letter.</p>
          <div className="admin-options">
            {current.options.map((option, index) => (
              <div key={index} className={current.answer === index ? "picked" : ""}>
                <button type="button" disabled={locked} onClick={() => update({ answer: index })} aria-label={`Mark option ${answerOptions[index]} as correct`}>
                  {current.answer === index ? <Check /> : answerOptions[index]}
                </button>
                <input value={option} disabled={locked} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${answerOptions[index]}`} />
              </div>
            ))}
          </div>
          <footer className="admin-test-nav">
            <button type="button" className="admin-btn ghost" disabled={active === 0} onClick={() => setActive(active - 1)}>
              Previous
            </button>
            <button type="button" className="admin-btn ghost" disabled={active === questionCount - 1} onClick={() => setActive(active + 1)}>
              Next question
            </button>
          </footer>
        </section>
      </div>
    </AdminShell>
  );
}

function isComplete(question: Draft) {
  return Boolean(question.question.trim()) && question.options.every((option) => option.trim());
}

function hasDuplicateOptions(question: Draft) {
  const options = question.options.map((option) => option.trim().toLowerCase());
  return new Set(options).size !== options.length;
}
