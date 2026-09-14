import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { TestBriefing } from "../components/PreSelectionTest/TestBriefing";
import { TestResult } from "../components/PreSelectionTest/TestResult";
import { TestRunner } from "../components/PreSelectionTest/TestRunner";
import { usePublicJob } from "../hooks/api/job/usePublicJob";
import { useStartTest } from "../hooks/api/pre-selection-test/useStartTest";
import type { TestScore, TestSession } from "../types/pre-selection-test";

export default function PreSelectionTestPage() {
  const { slug = "" } = useParams();
  const job = usePublicJob(slug);
  const startTest = useStartTest(slug);

  const [session, setSession] = useState<TestSession | null>(null);
  const [result, setResult] = useState<TestScore | null>(null);

  if (job.isPending) {
    return (
      <Shell>
        <article className="panel-card pretest-brief">
          <p className="eyebrow">Pre-selection test</p>
          <h1>Loading the posting…</h1>
        </article>
      </Shell>
    );
  }

  if (job.isError || !job.data) {
    return (
      <Shell>
        <article className="panel-card pretest-brief">
          <p className="eyebrow">Pre-selection test</p>
          <h1>Posting unavailable</h1>
          <p>{job.error?.message ?? "This job posting is no longer open."}</p>
          <Link className="pretest-back" to="/dashboard">
            Back to dashboard
          </Link>
        </article>
      </Shell>
    );
  }

  const { title, company, hasPreSelectionTest, testDurationMinutes } = job.data;

  if (!hasPreSelectionTest) {
    return (
      <Shell>
        <article className="panel-card pretest-brief">
          <p className="eyebrow">Pre-selection test</p>
          <h1>{title}</h1>
          <p>{company.companyName} does not screen this role with a test. Your application goes straight to review.</p>
          <Link className="pretest-back" to="/dashboard">
            Back to dashboard
          </Link>
        </article>
      </Shell>
    );
  }

  if (result) {
    return (
      <Shell>
        <TestResult title={title} company={company.companyName} result={result} />
      </Shell>
    );
  }

  if (session) {
    return (
      <Shell>
        <TestRunner slug={slug} session={session} onFinished={setResult} />
      </Shell>
    );
  }

  async function start() {
    const opened = await startTest.mutateAsync().catch(() => null);
    if (opened) setSession(opened);
  }

  return (
    <Shell>
      <TestBriefing
        title={title}
        company={company.companyName}
        durationMinutes={testDurationMinutes}
        notice={startTest.error?.message ?? ""}
        busy={startTest.isPending}
        onStart={start}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="workspace-dashboard">
      <Navbar />
      <main>
        <section className="role-panel pretest-panel">{children}</section>
      </main>
      <Footer />
    </div>
  );
}
