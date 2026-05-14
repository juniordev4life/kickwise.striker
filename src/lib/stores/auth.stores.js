/**
 * Auth-Store als reaktives Svelte-5-State-Modul.
 *
 * Konsumenten importieren `authStore` und greifen direkt auf die Properties
 * `currentUser`, `isAuthenticated`, `isLoading` zu. Da alles als `$state`
 * deklariert ist, propagieren Änderungen automatisch in alle abhängigen
 * Komponenten.
 */

import { ApiError } from "$services/api.services.js";
import { login as apiLogin, logout as apiLogout, getMe } from "$services/auth.services.js";

function createAuthStore() {
  let currentUser = $state(null);
  let isAuthenticated = $state(false);
  let isLoading = $state(true);
  let error = $state(null);

  return {
    get currentUser() {
      return currentUser;
    },
    get isAuthenticated() {
      return isAuthenticated;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },

    async refresh() {
      isLoading = true;
      error = null;
      try {
        const me = await getMe();
        currentUser = me;
        isAuthenticated = true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          currentUser = null;
          isAuthenticated = false;
        } else {
          error = err;
        }
      } finally {
        isLoading = false;
      }
    },

    async login(email, password) {
      isLoading = true;
      error = null;
      try {
        const result = await apiLogin({ email, password });
        currentUser = {
          kickbaseUserId: result.user.id,
          leagueIds: result.user.leagues.map((l) => l.id),
          profile: result.user
        };
        isAuthenticated = true;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        isLoading = false;
      }
    },

    async logout() {
      try {
        await apiLogout();
      } catch (_e) {
        // ignore — we still want to clear local state
      }
      currentUser = null;
      isAuthenticated = false;
    }
  };
}

export const authStore = createAuthStore();
