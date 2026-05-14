<script>
let {
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  onclick,
  children,
  ...rest
} = $props();

const base =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-[var(--color-pitch)] text-white hover:bg-[var(--color-pitch-dark)]",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100"
};
</script>

<button
  {type}
  class="{base} {variants[variant]}"
  disabled={disabled || loading}
  onclick={onclick}
  {...rest}
>
  {#if loading}
    <span class="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
  {/if}
  {@render children?.()}
</button>
