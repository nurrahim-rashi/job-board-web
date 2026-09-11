import type { UserDemographics } from "../../types/analytics";
import { formatCompact, formatNumber, genderLabels } from "./analyticsData";
import { BarList } from "./charts/BarList";
import { ChartCard, ChartEmpty } from "./charts/ChartCard";
import { ColumnChart } from "./charts/ColumnChart";
import { DonutChart } from "./charts/DonutChart";
import { seriesColors } from "./charts/chartUtils";

export function DemographicsSection({ data }: { data: UserDemographics }) {
  const genders = data.genders.filter((entry) => entry.count > 0);

  return (
    <section className="analytics-section">
      <header className="analytics-heading">
        <div>
          <p className="eyebrow">User demographics</p>
          <h2>Who is looking for work</h2>
        </div>
        <p>
          Based on {formatNumber(data.total)} job seeker profiles, {data.profileCompletion.rate}% of
          which have filled in age, gender, city and education.
        </p>
      </header>

      <div className="chart-grid">
        <ChartCard
          title="Age distribution"
          note={
            data.averageAge
              ? `Average age ${data.averageAge} · ${formatNumber(data.ageSamples)} profiles with a birth date`
              : "No birth dates recorded yet"
          }
          footer="Bands get darker with age so the shape of the cohort reads at a glance."
        >
          {data.ageSamples > 0 ? (
            <ColumnChart
              name="Job seekers"
              format={formatCompact}
              data={data.ageGroups.map((group) => ({
                label: group.label,
                value: group.count,
                note: `${group.share}% of profiles`,
              }))}
            />
          ) : (
            <ChartEmpty label="No job seeker has added a birth date in this range." />
          )}
        </ChartCard>

        <ChartCard
          title="Gender split"
          note="Profiles that chose to disclose it"
          footer={`${formatNumber(data.profileCompletion.completed)} of ${formatNumber(data.profileCompletion.total)} profiles are complete.`}
        >
          {genders.length ? (
            <DonutChart
              centerValue={formatCompact(data.total)}
              centerLabel="job seekers"
              data={genders.map((entry) => ({
                label: genderLabels[entry.gender] ?? entry.gender,
                value: entry.count,
                share: entry.share,
              }))}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Top cities"
          note="Where job seekers say they live"
          footer="Free text entries are merged case insensitively before counting."
        >
          {data.cities.length ? (
            <BarList
              series={[{ name: "Job seekers", color: seriesColors[0] }]}
              format={formatNumber}
              items={data.cities.map((city) => ({
                label: city.label,
                values: [city.count],
                note: `${city.share}% of profiles`,
              }))}
            />
          ) : (
            <ChartEmpty label="No city recorded yet." />
          )}
        </ChartCard>

        <ChartCard
          title="Last education"
          note="Highest level reported on the profile"
          footer={
            data.provinces.length
              ? `Spread across ${data.provinces.length} province${data.provinces.length === 1 ? "" : "s"}, led by ${data.provinces[0].label}.`
              : "No province recorded yet."
          }
        >
          {data.educations.length ? (
            <BarList
              series={[{ name: "Job seekers", color: seriesColors[2] }]}
              format={formatNumber}
              items={data.educations.map((education) => ({
                label: education.label,
                values: [education.count],
                note: `${education.share}% of profiles`,
              }))}
            />
          ) : (
            <ChartEmpty label="No education level recorded yet." />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
