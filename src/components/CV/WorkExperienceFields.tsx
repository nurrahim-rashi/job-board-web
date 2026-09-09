import type { CvWorkExperience } from "../../types/cv";

interface Props {
  value: CvWorkExperience[];
  onChange: (value: CvWorkExperience[]) => void;
}

const emptyExperience = (): CvWorkExperience => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
});

export function WorkExperienceFields({ value, onChange }: Props) {
  const update = (
    index: number,
    field: keyof CvWorkExperience,
    fieldValue: string | boolean,
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
      <h2>Work experience</h2>

      {value.length === 0 && (
        <p>No work experience added. Fresh graduates can leave this empty.</p>
      )}

      {value.map((experience, index) => (
        <div className="profile-fields" key={index}>
          <label>
            Job title
            <input
              value={experience.jobTitle}
              onChange={(e) => update(index, "jobTitle", e.target.value)}
              required
            />
          </label>

          <label>
            Company
            <input
              value={experience.company}
              onChange={(e) => update(index, "company", e.target.value)}
              required
            />
          </label>

          <label>
            Start date
            <input
              type="month"
              value={experience.startDate}
              onChange={(e) => update(index, "startDate", e.target.value)}
              required
            />
          </label>

          <label>
            End date
            <input
              type="month"
              value={experience.endDate ?? ""}
              disabled={experience.isCurrent}
              required={!experience.isCurrent}
              onChange={(e) => update(index, "endDate", e.target.value)}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={experience.isCurrent}
              onChange={(e) => {
                const checked = e.target.checked;

                onChange(
                  value.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          isCurrent: checked,
                          endDate: checked ? "" : item.endDate,
                        }
                      : item,
                  ),
                );
              }}
            />
            I currently work here
          </label>

          <label className="profile-wide">
            Description
            <textarea
              value={experience.description}
              onChange={(e) => update(index, "description", e.target.value)}
              required
            />
          </label>

          <button type="button" onClick={() => remove(index)}>
            Remove experience
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyExperience()])}
      >
        Add work experience
      </button>
    </section>
  );
}
