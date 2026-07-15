import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  ElderReminderResponse,
  ReminderRuleResponse,
  ReminderRuleType,
} from "../types/api";

export async function getElderReminders(
  elderId: number,
): Promise<ElderReminderResponse[]> {
  const res = await apiClient.get<ApiResponse<ElderReminderResponse[]>>(
    `/elders/${elderId}/reminders`,
  );
  return unwrap(res.data) ?? [];
}

export async function listReminderRules(params?: {
  ruleType?: ReminderRuleType;
  isActive?: boolean;
}): Promise<ReminderRuleResponse[]> {
  const res = await apiClient.get<ApiResponse<ReminderRuleResponse[]>>("/reminder-rules", {
    params,
  });
  return unwrap(res.data) ?? [];
}
