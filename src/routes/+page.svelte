<script>
import { goto } from "$app/navigation";
import { authStore } from "$stores/auth.stores.svelte.js";

$effect(() => {
  if (authStore.isLoading) return;
  if (authStore.isAuthenticated) {
    goto("/dashboard");
  } else {
    goto("/login");
  }
});
</script>
