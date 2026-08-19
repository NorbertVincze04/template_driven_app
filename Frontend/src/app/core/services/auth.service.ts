import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  login(user: User): void {
    this._currentUser.set(user);
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
