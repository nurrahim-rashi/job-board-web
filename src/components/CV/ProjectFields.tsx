import type { CvProject } from "../../types/cv";

interface Props {
  value: CvProject[];
  onChange: (value: CvProject[]) => void;
}

const emptyProject = (): CvProject => ({
  name: "",
  description: "",
  technologies: [],
});

export function ProjectFields({ value, onChange }: Props) {
  const update = (
    index: number,
    field: keyof CvProject,
    fieldValue: string | string[],
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
      <h2>Projects</h2>

      {value.map((project, index) => (
        <div className="profile-fields" key={index}>
          <label>
            Project name
            <input
              value={project.name}
              onChange={(e) => update(index, "name", e.target.value)}
              required
            />
          </label>

          <label className="profile-wide">
            Description
            <textarea
              value={project.description}
              onChange={(e) => update(index, "description", e.target.value)}
              required
            />
          </label>

          <label className="profile-wide">
            Technologies
            <input
              value={project.technologies?.join(", ") ?? ""}
              placeholder="React, TypeScript, PostgreSQL"
              onChange={(e) =>
                update(
                  index,
                  "technologies",
                  e.target.value
                    .split(",")
                    .map((technology) => technology.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>

          <button type="button" onClick={() => remove(index)}>
            Remove project
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyProject()])}
      >
        Add project
      </button>
    </section>
  );
}
