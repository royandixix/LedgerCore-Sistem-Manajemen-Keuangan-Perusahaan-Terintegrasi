import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from './access.policy.js';

export const REQUIRED_PERMISSIONS_KEY =
  'ledgercore:permissions';

export const ORGANIZATION_PARAM_KEY =
  'ledgercore:organization-param';

export const RequiredPermissions = (
  ...permissions: PermissionCode[]
) => SetMetadata(
  REQUIRED_PERMISSIONS_KEY,
  permissions,
);

export const OrganizationParam = (
  parameterName: string
) => SetMetadata(
  ORGANIZATION_PARAM_KEY,
  parameterName,
);
