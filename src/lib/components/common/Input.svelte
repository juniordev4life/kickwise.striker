<script>
let {
  id,
  label,
  type = "text",
  value = $bindable(""),
  placeholder,
  required = false,
  autocomplete,
  error,
  ...rest
} = $props();
</script>

<label for={id} class="flex flex-col gap-1.5">
  {#if label}
    <span class="text-xs font-semibold text-ink">{label}</span>
  {/if}
  <input
    {id}
    {type}
    {placeholder}
    {required}
    {autocomplete}
    bind:value
    class="rounded-xl border border-edge bg-surface px-3 py-2 text-sm text-ink shadow-sm transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
    class:border-danger={error}
    class:focus:ring-danger={error}
    {...rest}
  />
  {#if error}
    <span class="text-xs text-danger">{error}</span>
  {/if}
</label>
