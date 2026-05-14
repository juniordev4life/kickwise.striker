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
    <span class="text-sm font-medium text-slate-700">{label}</span>
  {/if}
  <input
    {id}
    {type}
    {placeholder}
    {required}
    {autocomplete}
    bind:value
    class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-pitch)] focus:outline-none focus:ring-1 focus:ring-[var(--color-pitch)]"
    class:border-red-500={error}
    {...rest}
  />
  {#if error}
    <span class="text-xs text-red-600">{error}</span>
  {/if}
</label>
