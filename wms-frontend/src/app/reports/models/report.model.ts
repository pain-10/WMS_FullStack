export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  search?: string;
}

export interface KpiCard {
  label: string;
  value: number | string;
  subtext?: string;
  icon: string;
  color: string;
}
