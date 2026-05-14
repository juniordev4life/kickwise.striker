<script>
import { goto } from "$app/navigation";
import { authStore } from "$stores/auth.stores.js";

$effect(() => {
  if (authStore.isLoading) return;
  if (authStore.isAuthenticated) {
    goto("/matchday");
  } else {
    goto("/login");
  }
});
</script>
