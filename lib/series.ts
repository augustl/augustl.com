export const SERIES = {
  datomic: {
    title: "Datomic",
    description: "Anything and everything about the Datomic database",
  },
  advent_calendar_2019: {
    title: "Advent Calendar 2019",
    description: "A glorious series of blog posts, one each day, for the advent of 2019! The posts are about anything and everything.",
  },
} as const;

export type SeriesName = keyof typeof SERIES;

export function isSeriesName(value: string): value is SeriesName {
  return value in SERIES;
}
