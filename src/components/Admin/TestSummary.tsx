import { questionCount } from "./adminData";

export function TestSummary({ saved }: { saved: number }) {
  return (
    <>
      <p className="admin-note">
        {saved} of {questionCount} questions ready
      </p>
      <div className="admin-progress">
        <i style={{ width: `${(saved / questionCount) * 100}%` }} />
      </div>
    </>
  );
}
