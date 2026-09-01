/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';

describe('AuthService', () => {
  let service: AuthService;

  function createToken(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        exp,
        email: 'user@example.com',
      }),
    );
    return `${header}.${payload}.signature`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: {} },
        {
          provide: TenantService,
          useValue: {
            config: () => ({ tenantId: 'default' }),
            setUserThemeContext: () => undefined,
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('treats expired JWTs as invalid', () => {
    const expiredUser = {
      name: 'Test User',
      email: 'user@example.com',
      password: '',
      type: 'ADMIN',
      tenantId: 'default',
      token: createToken(Math.floor(Date.now() / 1000) - 60),
    };

    expect(service.isTokenValid(expiredUser)).toBeFalse();
  });
});
