export enum StatisticsAxlePitch {
  DAY = 'D',
  MONTH = 'M',
  YEAR = 'Y',
}

export const AXLE_PITCH_DATE_FORMAT: Record<StatisticsAxlePitch, string> = {
  [StatisticsAxlePitch.DAY]: '%Y-%m-%d',
  [StatisticsAxlePitch.MONTH]: '%Y-%m',
  [StatisticsAxlePitch.YEAR]: '%Y',
};
