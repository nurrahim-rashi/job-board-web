import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useApplicants } from "../../../hooks/api/applicant/useApplicants";
import { useAssignTest } from "../../../hooks/api/pre-selection-test/useAssignTest";
import { maxAssignPerRequest } from "../../../types/pre-selection-test";
import { Close, Search } from "../../site/Icons";
import { ApplicantAvatar } from "./ApplicantAvatar";
import { formatDate } from "../adminData";

type AssignTestModalProps = { slug: string; open: boolean; durationMinutes: number | null; onClose: () => void };

const APPLICANT_PAGE_SIZE = 50;

export function AssignTestModal({ slug, open, durationMinutes, onClose }: AssignTestModalProps) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number[]>([]);

  const assignTest = useAssignTest(slug);
  const { data, isPending, isError, error } = useApplicants(open ? slug : undefined, {
    status: "PENDING",
    limit: APPLICANT_PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "asc",
  });

  useEffect(() => {
    if (open) return;
    setSearch("");
    setPicked([]);
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.applicants ?? []).filter((item) => !term || item.applicant.name.toLowerCase().includes(term));
  }, [data?.applicants, search]);

  if (!open) return null;

  function toggle(applicationId: number) {
    setPicked((current) => {
      if (current.includes(applicationId)) return current.filter((id) => id !== applicationId);
      if (current.length >= maxAssignPerRequest) return current;
      return [...current, applicationId];
    });
  }

  function pickAll() {
    setPicked(candidates.slice(0, maxAssignPerRequest).map((item) => item.id));
  }

  function send() {
    if (!picked.length) return;
    assignTest.mutate(picked, { onSuccess: onClose });
  }

  return createPortal(
    <div
      className="admin-dialog assign-dialog"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Close />
        </button>

        <header className="interview-dialog-head">
          <p className="eyebrow">Pre-selection test</p>
          <h2>Send the test to applicants</h2>
          <p className="admin-note">
            Only applicants still on Pending can be sent the test — anyone you have already moved on is left out. They get{" "}
            {durationMinutes ?? 30} minutes once they open it, and the clock keeps running after that.
          </p>
        </header>

        <div className="interview-dialog-body">
          <label className="admin-search">
            <Search />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant name" />
          </label>

          {isPending ? (
            <div className="applicant-dialog-state">Loading applicants…</div>
          ) : isError ? (
            <div className="applicant-dialog-state">{error.message}</div>
          ) : candidates.length ? (
            <ul className="interview-picker">
              {candidates.map((item) => {
                const checked = picked.includes(item.id);
                const full = !checked && picked.length >= maxAssignPerRequest;

                return (
                  <li key={item.id} className={checked ? "picked" : ""}>
                    <label>
                      <input type="checkbox" checked={checked} disabled={full} onChange={() => toggle(item.id)} />
                      <ApplicantAvatar name={item.applicant.name} avatar={item.applicant.avatar} />
                      <span className="interview-picker-name">
                        <b>{item.applicant.name}</b>
                        <small>Applied {formatDate(item.appliedAt)}</small>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="applicant-dialog-state">
              {search.trim() ? "Nobody matches that name." : "Every applicant has already been moved past Pending."}
            </div>
          )}
        </div>

        <footer className="interview-dialog-footer">
          <small>
            {picked.length} of {maxAssignPerRequest} selected
          </small>
          {candidates.length ? (
            <button type="button" className="admin-btn ghost" onClick={pickAll}>
              Select all
            </button>
          ) : null}
          <button type="button" className="admin-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn primary"
            disabled={!picked.length || assignTest.isPending}
            onClick={send}
          >
            {assignTest.isPending ? "Sending…" : `Send test to ${picked.length}`}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
