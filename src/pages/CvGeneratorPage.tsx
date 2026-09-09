import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { WorkExperienceFields } from "../components/CV/WorkExperienceFields";
import {
  EducationFields,
  emptyEducation,
} from "../components/CV/EducationFields";
import { ProjectFields } from "../components/CV/ProjectFields";
import { LanguageFields } from "../components/CV/LanguageFields";
import { generateCv } from "../lib/cv-api";
import type {
  CvEducation,
  CvLanguage,
  CvProject,
  CvWorkExperience,
  GenerateCvInput,
} from "../types/cv";

export default function CvGeneratorPage() {
  const [workExperiences, setWorkExperiences] = useState<CvWorkExperience[]>(
    [],
  );
  const [educations, setEducations] = useState<CvEducation[]>([
    emptyEducation(),
  ]);
  const [projects, setProjects] = useState<CvProject[]>([]);
  const [languages, setLanguages] = useState<CvLanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const input: GenerateCvInput = {
      professionalSummary: String(form.get("professionalSummary") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || undefined,
      skills: String(form.get("skills") ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      workExperiences,
      educations,
      projects: projects.length ? projects : undefined,
      languages: languages.length ? languages : undefined,
    };

    try {
      const blob = await generateCv(input);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "cv.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate CV.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-shell">
        <header>
          <p className="eyebrow">CV Generator</p>
          <h1>Create your ATS-friendly CV</h1>
          <p>
            Your name, email, city, and province will be taken from your profile
            automatically.
          </p>

          <Link to="/profile">Back to profile</Link>
        </header>

        {error && <p className="profile-error">{error}</p>}

        <form className="profile-card" onSubmit={handleSubmit}>
          <h2>Professional information</h2>

          <div className="profile-fields">
            <label className="profile-wide">
              Professional summary
              <textarea
                name="professionalSummary"
                placeholder="Briefly describe your experience, strengths, and career focus."
                required
              />
            </label>

            <label>
              Phone
              <input name="phone" type="tel" />
            </label>

            <label className="profile-wide">
              Skills
              <input
                name="skills"
                placeholder="TypeScript, React, Express, PostgreSQL"
                required
              />
              <small>Separate skills with commas.</small>
            </label>
          </div>

          <WorkExperienceFields
            value={workExperiences}
            onChange={setWorkExperiences}
          />

          <EducationFields value={educations} onChange={setEducations} />

          <ProjectFields value={projects} onChange={setProjects} />

          <LanguageFields value={languages} onChange={setLanguages} />

          <button className="profile-submit" type="submit" disabled={loading}>
            {loading ? "Generating CV..." : "Generate and download CV"}
          </button>
        </form>
      </main>
    </div>
  );
}
