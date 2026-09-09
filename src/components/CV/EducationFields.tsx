import type { CvEducation } from "../../types/cv";

interface Props {
  value: CvEducation[];
  onChange: (value: CvEducation[]) => void;
}

export const emptyEducation = (): CvEducation => ({
  institution: "",
  degree: "",
  fieldOfStudy: "",
});

export function EducationFields({ value, onChange }: Props) {
  const update = (
    index: number,
    field: keyof CvEducation,
    fieldValue: string | number | undefined,
  ) => {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: fieldValue } : item,
      ),
    );
  };

  const remove = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section>
      <h2>Education</h2>

      {value.map((education, index) => (
        <div className="profile-fields" key={index}>
          <label>
            Institution
            <input
              value={education.institution}
              onChange={(e) => update(index, "institution", e.target.value)}
              required
            />
          </label>

          <label>
            Degree
            <input
              value={education.degree}
              onChange={(e) => update(index, "degree", e.target.value)}
              required
            />
          </label>

          <label>
            Field of study
            <input
              value={education.fieldOfStudy ?? ""}
              onChange={(e) => update(index, "fieldOfStudy", e.target.value)}
            />
          </label>

          <label>
            Start year
            <input
              type="number"
              min="1900"
              max="2100"
              value={education.startYear ?? ""}
              onChange={(e) =>
                update(
                  index,
                  "startYear",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </label>

          <label>
            End year
            <input
              type="number"
              min="1900"
              max="2100"
              value={education.endYear ?? ""}
              onChange={(e) =>
                update(
                  index,
                  "endYear",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </label>

          {value.length > 1 && (
            <button type="button" onClick={() => remove(index)}>
              Remove education
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyEducation()])}
      >
        Add education
      </button>
    </section>
  );
}
