
export interface ProfileData {
  name: string;
  jobTitle: string;
  companyName: string;
  industry: string;
  activityOrAchievement: string;
  mutualConnection: string;
  additionalContext?: string;
  urls?: string[];
  wordCount?: number;
}

export type MessageType = 'linkedin' | 'email';

export type TargetRole = 'director_ti' | 'director_financiero' | 'gerente_compras' | 'ceo_gerente_general' | 'otro';

export interface RolePrompt {
  role: TargetRole;
  name: string;
  description: string;
  linkedinPrompt: string;
  emailPrompt: string;
}

export interface GeneratedMessageResponse {
  shouldGenerate: boolean;
  message: string;
}

export interface SentMessage {
  name: string;
  message: string;
  sentAt: string;
  id?: string;
}
