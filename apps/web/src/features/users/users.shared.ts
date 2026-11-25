export const MEMBER_ROLES = [
  'FINANCE_ADMIN', 'ACCOUNTANT', 'FINANCE_MANAGER',
  'AP_OFFICER', 'AR_OFFICER', 'AUDITOR',
] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export interface UserMember {
  id: string;
  authUserId: string;
  role: MemberRole | 'SUPER_ADMIN';
  createdAt: string;
  email: string;
  name: string;
  banned: boolean;
  protected: boolean;
  organization: { id: string; name: string; slug: string };
}
export interface UserOrg { id: string; name: string; slug: string }
