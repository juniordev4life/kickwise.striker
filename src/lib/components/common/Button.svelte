<script>
let {
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onclick,
  children,
  ...rest
} = $props();

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm"
};

const variants = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-strong",
  secondary: "bg-surface text-ink border border-edge hover:bg-panel",
  ghost: "text-muted hover:bg-panel hover:text-ink",
  gold: "bg-gold text-[#0F1F3D] shadow-sm hover:brightness-110",
  danger: "bg-danger text-white shadow-sm hover:brightness-110"
};
</script>

<button
  {type}
  class="{base} {sizes[size]} {variants[variant]}"
  disabled={disabled || loading}
  {onclick}
  {...rest}
>
  {#if loading}
    <span
      class="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    ></span>
  {/if}
  {@render children?.()}
</button>
