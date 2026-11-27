import { describe, expect, it } from 'vitest';
import 'reflect-metadata';

import {
  ALL_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
} from '../../common/access/access.policy.js';

import {
  ROLES_KEY,
} from '../../common/decorators/permissions.decorator.js';

import {
  REQUIRED_PERMISSIONS_KEY,
} from '../../common/access/access.decorator.js';

import {
  buildRoleCatalog,
  RoleCatalogController,
} from './role-catalog.controller.js';

describe('Stage 6C Role Catalog', () => {
  it('memuat 7 role berdasarkan backend policy', () => {
    const catalog = buildRoleCatalog();

    expect(catalog.readOnly).toBe(true);

    expect(
      new Set(catalog.roles.map((r) => r.code)).size
    ).toBe(7);

    expect(catalog.permissions).toEqual(ALL_PERMISSIONS);

    for (const role of catalog.roles) {
      expect(role.permissions.length).toBeGreaterThan(0);

      if (role.code === 'SUPER_ADMIN') {
        expect(role.scope).toBe('global');
        expect(role.permissions).toEqual(ALL_PERMISSIONS);
      } else {
        expect(role.scope).toBe('organization');
        expect(role.permissions).toEqual(
          ORGANIZATION_PERMISSIONS[role.code]
        );
      }
    }
  });

  it('katalog hanya boleh diakses SUPER_ADMIN', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        RoleCatalogController
      )
    ).toEqual(['SUPER_ADMIN']);

    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        RoleCatalogController
      )
    ).toEqual(['roles.read']);
  });
});
