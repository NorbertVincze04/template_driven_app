import { Route } from '@angular/router';
import { routes } from './app.routes';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

describe('app routes', () => {
  const findRoute = (path: string): Route | undefined =>
    routes.find((route) => route.path === path);

  it('redirects the empty path to home', () => {
    expect(findRoute('')).toEqual(
      jasmine.objectContaining({ redirectTo: 'home', pathMatch: 'full' }),
    );
    expect(findRoute('home')?.component).toBe(HomeComponent);
  });

  it('protects the user profile route with the auth guard', () => {
    expect(findRoute('user-profile')?.canActivate).toEqual([AuthGuard]);
  });

  it('handles unknown paths with the not-found component last', () => {
    const wildcard = routes[routes.length - 1];

    expect(wildcard.path).toBe('**');
    expect(wildcard.component).toBe(NotFoundComponent);
  });
});
