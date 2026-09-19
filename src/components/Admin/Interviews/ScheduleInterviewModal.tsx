import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import { useApplicants } from "../../../hooks/api/applicant/useApplicants";
import { useCreateInterviews } from "../../../hooks/api/interview/useCreateInterviews";
import { type ApplicantListItem } from "../../../types/applicant";
import { MAX_SCHEDULES_PER_REQUEST, type ScheduleInput } from "../../../types/interview";
import { Calendar, Check, Close, Search, Users } from "../../site/Icons";
import { StatusBadge } from "../../site/StatusBadge";
import { ApplicantAvatar } from "../Applicants/ApplicantAvatar";
import { defaultSlot, minDateTime, toIso } from "./interviewHelpers";

type Draft = { applicationId: number; name: string; when: string; where: string; notes: string };

export type PreselectedApplicant = { applicationId: number; name: string };

type ScheduleInterviewModalProps = {
  slug: string;
  open: boolean;
  scheduledIds: number[];
  preselect?: PreselectedApplicant | null;
  onClose: () => void;
};

const APPLICANT_PAGE_SIZE = 50;

export function ScheduleInterviewModal({ slug, open, scheduledIds, preselect, onClose }: ScheduleInterviewModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [sharedPlace, setSharedPlace] = useState("");
  const [touched, setTouched] = useState(false);

  const createInterviews = useCreateInterviews();
  const { data, isPending, isError, error } = useApplicants(open ? slug : undefined, {
    limit: APPLICANT_PAGE_SIZE,
    sortOrder: "asc",
    sortBy: "createdAt",
  });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSearch("");
      setDrafts([]);
      setSharedPlace("");
      setTouched(false);
      return;
    }
    if (!preselect) return;
    setDrafts([
      { applicationId: preselect.applicationId, name: preselect.name, when: defaultSlot(0, []), where: "", notes: "" },
    ]);
    setStep(2);
  }, [open, preselect]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const alreadyScheduled = useMemo(() => new Set(scheduledIds), [scheduledIds]);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.applicants ?? []).filter(
      (item) => item.status !== "REJECTED" && (!term || item.applicant.name.toLowerCase().includes(term)),
    );
  }, [data?.applicants, search]);

  const picked = useMemo(() => new Set(drafts.map((draft) => draft.applicationId)), [drafts]);

  function toggle(item: ApplicantListItem) {
    setDrafts((current) => {
      if (current.some((draft) => draft.applicationId === item.id)) {
        return current.filter((draft) => draft.applicationId !== item.id);
      }
      if (current.length >= MAX_SCHEDULES_PER_REQUEST) return current;
      return [
        ...current,
        {
          applicationId: item.id,
          name: item.applicant.name,
          when: defaultSlot(
            current.length,
            current.map((draft) => draft.when),
          ),
          where: sharedPlace,
          notes: "",
        },
      ];
    });
  }

  const set = (applicationId: number, patch: Partial<Draft>) =>
    setDrafts((current) =>
      current.map((draft) => (draft.applicationId === applicationId ? { ...draft, ...patch } : draft)),
    );

  function applyPlaceToAll(value: string) {
    setSharedPlace(value);
    setDrafts((current) => current.map((draft) => ({ ...draft, where: value })));
  }

  function autoSpace() {
    setDrafts((current) => {
      const spaced: Draft[] = [];
      current.forEach((draft, index) => {
        spaced.push({
          ...draft,
          when: defaultSlot(
            index,
            spaced.map((entry) => entry.when),
          ),
        });
      });
      return spaced;
    });
  }

  const duplicates = useMemo(() => {
    const seen = new Map<number, number>();
    drafts.forEach((draft) => {
      const time = new Date(draft.when).getTime();
      if (Number.isNaN(time)) return;
      seen.set(time, (seen.get(time) ?? 0) + 1);
    });
    return new Set(
      drafts
        .filter((draft) => (seen.get(new Date(draft.when).getTime()) ?? 0) > 1)
        .map((draft) => draft.applicationId),
    );
  }, [drafts]);

  function issuesFor(draft: Draft) {
    const problems: string[] = [];
    const time = new Date(draft.when).getTime();
    if (!draft.when || Number.isNaN(time)) problems.push("Pick a date and time.");
    else if (time <= Date.now()) problems.push("The interview must be in the future.");
    if (duplicates.has(draft.applicationId)) problems.push("Another applicant already has this exact slot.");
    if (!draft.where.trim()) problems.push("Add a location or meeting link.");
    return problems;
  }

  const incomplete = drafts.filter((draft) => issuesFor(draft).length > 0);
  const blocking = incomplete.length > 0;

  function submit() {
    setTouched(true);
    if (!drafts.length) return;

    if (blocking) {
      toast.error(issuesFor(incomplete[0])[0] ?? "Check the highlighted rows before saving.");
      return;
    }

    const schedules: ScheduleInput[] = drafts.map((draft) => ({
      applicationId: draft.applicationId,
      interviewDate: toIso(draft.when),
      locationOrLink: draft.where.trim(),
      ...(draft.notes.trim() && { notes: draft.notes.trim() }),
    }));

    createInterviews.mutate({ slug, schedules }, { onSuccess: onClose });
  }

  if (!open) return null;

  return createPortal(
    <div
      className="admin-dialog interview-dialog"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Close />
        </button>

        <header className="interview-dialog-head">
          <p className="eyebrow">Interview scheduling</p>
          <h2>{step === 1 ? "Choose who you want to interview" : "Give everyone their own slot"}</h2>
          <p className="admin-note">
            {step === 1
              ? "Pick up to 20 applicants in one go. Rejected applicants and anyone already booked are left out."
              : "Each applicant needs a different date and time. Everyone is emailed their schedule as soon as you save, and a reminder goes out H-1."}
          </p>
        </header>

        <nav className="interview-steps">
          <button type="button" className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>
            <Users /> 1 · Applicants
            {drafts.length ? <em>{drafts.length}</em> : null}
          </button>
          <button
            type="button"
            className={step === 2 ? "active" : ""}
            disabled={!drafts.length}
            onClick={() => setStep(2)}
          >
            <Calendar /> 2 · Schedules
          </button>
        </nav>

        <div className="interview-dialog-body">
          {step === 1 ? (
            <>
              <label className="admin-search">
                <Search />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search applicant name"
                />
              </label>

              {isPending ? (
                <div className="applicant-dialog-state">Loading applicants…</div>
              ) : isError ? (
                <div className="applicant-dialog-state">{error.message}</div>
              ) : candidates.length ? (
                <ul className="interview-picker">
                  {candidates.map((item) => {
                    const booked = alreadyScheduled.has(item.id);
                    const checked = picked.has(item.id);
                    const full = !checked && drafts.length >= MAX_SCHEDULES_PER_REQUEST;

                    return (
                      <li key={item.id} className={checked ? "picked" : ""}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={booked || full}
                            onChange={() => toggle(item)}
                          />
                          <ApplicantAvatar name={item.applicant.name} avatar={item.applicant.avatar} />
                          <span className="interview-picker-name">
                            <b>{item.applicant.name}</b>
                            <small>
                              {booked
                                ? "Already has an interview"
                                : item.testScore != null
                                  ? `Test score ${item.testScore}`
                                  : "No pre-selection test"}
                            </small>
                          </span>
                          <StatusBadge status={item.status} />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="applicant-dialog-state">
                  {search.trim() ? "Nobody matches that name." : "No applicants are eligible for an interview yet."}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="interview-bulk">
                <label>
                  <span>
                    Location or meeting link <small>Applies to everyone</small>
                  </span>
                  <input
                    value={sharedPlace}
                    maxLength={255}
                    placeholder="https://meet.google.com/… or Polaris HQ, 4th floor"
                    onChange={(event) => applyPlaceToAll(event.target.value)}
                  />
                </label>
                <button type="button" className="admin-btn ghost" onClick={autoSpace}>
                  Space 30 min apart
                </button>
              </div>

              <ul className="interview-drafts">
                {drafts.map((draft) => {
                  const problems = touched ? issuesFor(draft) : [];

                  return (
                    <li key={draft.applicationId} className={problems.length ? "invalid" : ""}>
                      <div className="interview-draft-head">
                        <b>{draft.name}</b>
                        <button
                          type="button"
                          className="link"
                          onClick={() =>
                            setDrafts((current) =>
                              current.filter((entry) => entry.applicationId !== draft.applicationId),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>

                      <div className="interview-draft-fields">
                        <label>
                          <span>Date and time</span>
                          <input
                            type="datetime-local"
                            value={draft.when}
                            min={minDateTime()}
                            onChange={(event) => set(draft.applicationId, { when: event.target.value })}
                          />
                        </label>
                        <label>
                          <span>Location or link</span>
                          <input
                            value={draft.where}
                            maxLength={255}
                            placeholder="Meeting link or address"
                            onChange={(event) => set(draft.applicationId, { where: event.target.value })}
                          />
                        </label>
                        <label className="wide">
                          <span>
                            Notes <small>Optional · shown in the email</small>
                          </span>
                          <input
                            value={draft.notes}
                            maxLength={500}
                            placeholder="e.g. Technical round with the engineering lead"
                            onChange={(event) => set(draft.applicationId, { notes: event.target.value })}
                          />
                        </label>
                      </div>

                      {problems.map((problem) => (
                        <p key={problem} className="interview-draft-error">
                          {problem}
                        </p>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <footer className="interview-dialog-footer">
          <small>
            {drafts.length}/{MAX_SCHEDULES_PER_REQUEST} selected
            {step === 2 && blocking
              ? ` · ${incomplete.length} row${incomplete.length === 1 ? "" : "s"} still need a date and a location`
              : ""}
          </small>
          <button type="button" className="admin-btn ghost" onClick={step === 1 ? onClose : () => setStep(1)}>
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step === 1 ? (
            <button
              type="button"
              className="admin-btn primary"
              disabled={!drafts.length}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="admin-btn primary"
              disabled={createInterviews.isPending}
              onClick={submit}
            >
              <Check />
              {createInterviews.isPending
                ? "Sending invitations…"
                : `Schedule ${drafts.length} interview${drafts.length === 1 ? "" : "s"}`}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
