import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';

import { AuthGuard } from './auth.guard.js';

import type {
  AuthService,
  LedgerUser,
} from '../../modules/auth/auth.service.js';

const user: LedgerUser = {
  id: 'test-account',
  email: null,
  name: null,
  role: 'AUDITOR',
  roleScope: 'organization',
  organizationId:
    '11111111-1111-4111-8111-111111111111',
};

function requestContext(
  authorization?: string
) {
  const request = {
    headers: { authorization },
    ledgerUser:
      undefined as LedgerUser | undefined,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('Stage 6D - AuthGuard', () => {
  it.each([
    undefined,
    '',
    'Basic credentials',
    'Bearer ',
  ])(
    'menolak header tanpa Bearer token: %s',
    async (header) => {
      const service = {
        authenticate: vi.fn(
          async () => user
        ),
      } as unknown as AuthService;

      const { context } = requestContext(header);

      await expect(
        new AuthGuard(service).canActivate(context)
      ).rejects.toThrow(UnauthorizedException);
    }
  );

  it('memuat identitas setelah autentikasi', async () => {
    const authenticate = vi.fn(
      async (_token: string) => user
    );

    const service = {
      authenticate,
    } as unknown as AuthService;

    const { context, request } =
      requestContext('Bearer test-token');

    await expect(
      new AuthGuard(service).canActivate(context)
    ).resolves.toBe(true);

    expect(authenticate).toHaveBeenCalledWith(
      'test-token'
    );

    expect(request.ledgerUser).toEqual(user);
  });

  it('menolak token yang tidak valid', async () => {
    const authenticate = vi.fn(async () => {
      throw new UnauthorizedException(
        'Sesi tidak valid'
      );
    });

    const service = {
      authenticate,
    } as unknown as AuthService;

    const { context } =
      requestContext('Bearer invalid-token');

    await expect(
      new AuthGuard(service).canActivate(context)
    ).rejects.toThrow(UnauthorizedException);
  });
});
