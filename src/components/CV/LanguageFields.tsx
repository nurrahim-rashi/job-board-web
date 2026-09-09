import type { CvLanguage } from "../../types/cv";

interface Props {
  value: CvLanguage[];
  onChange: (value: CvLanguage[]) => void;
}

const emptyLanguage = (): CvLanguage => ({
  language: "",
  proficiency: "",
});

export function LanguageFields({ value, onChange }: Props) {
  const update = (
    index: number,
    field: keyof CvLanguage,
    fieldValue: string,
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
      <h2>Languages</h2>

      {value.map((language, index) => (
        <div className="profile-fields" key={index}>
          <label>
            Language
            <input
              value={language.language}
              onChange={(e) => update(index, "language", e.target.value)}
              required
            />
          </label>

          <label>
            Proficiency
            <input
              value={language.proficiency ?? ""}
              placeholder="Native, Professional, Intermediate..."
              onChange={(e) => update(index, "proficiency", e.target.value)}
            />
          </label>

          <button type="button" onClick={() => remove(index)}>
            Remove language
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyLanguage()])}
      >
        Add language
      </button>
    </section>
  );
}
