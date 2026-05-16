<script>
  /**
   * One player slot on the pitch. Renders avatar + name + status pill +
   * optional captain badge. Empty slots render as a dashed placeholder.
   *
   * @prop player - optional, the player to render. When null the slot is empty.
   * @prop isCaptain - draws the "C" badge.
   * @prop notOwned - dim + red ring around the avatar when the player isn't in the user's actual Kickbase squad.
   * @prop onclick - optional click handler, invoked with the player object.
   */
  let { player, isCaptain = false, notOwned = false, onclick } = $props();

  function handleClick() {
    onclick?.(player);
  }

  const imgSrc = $derived(
    player?.imageUrl ? `https://kickbase.b-cdn.net/${player.imageUrl}` : null
  );

  const statusInfo = $derived.by(() => {
    const status = player?.status;
    if (status === "fit") return { color: "bg-emerald-500", icon: "✓", label: "Fit" };
    if (status === "injured") return { color: "bg-red-500", icon: "!", label: "Verletzt" };
    if (status === "questionable") return { color: "bg-amber-500", icon: "?", label: "Fraglich" };
    if (status === "out") return { color: "bg-slate-500", icon: "✕", label: "Raus" };
    return null;
  });

  // Kickbase S11 scale: 1 = Sicher, 5 = Ausgeschlossen.
  const s11Info = $derived.by(() => {
    const prob = Number(player?.startingProbability);
    if (!Number.isFinite(prob)) return null;
    if (prob <= 1) return { color: "bg-blue-500", icon: "★", label: "Sicher" };
    if (prob <= 2) return { color: "bg-emerald-500", icon: "✓", label: "Erwartet" };
    if (prob <= 3) return { color: "bg-amber-500", icon: "?", label: "Unsicher" };
    if (prob <= 4) return { color: "bg-orange-500", icon: "!", label: "Unwahrscheinlich" };
    return { color: "bg-slate-700", icon: "✕", label: "Ausgeschlossen" };
  });

  const shortName = $derived(player?.name ? shortify(player.name) : "");

  function shortify(name) {
    if (name.length <= 12) return name;
    const parts = name.split(" ");
    if (parts.length > 1) return parts[parts.length - 1];
    return `${name.slice(0, 11)}…`;
  }
</script>

{#if player}
  <button
    type="button"
    onclick={handleClick}
    class="flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 text-inherit transition hover:scale-105"
  >
    <div class="relative">
      {#if imgSrc}
        <img
          src={imgSrc}
          alt={player.name}
          class="size-14 rounded-full border-2 bg-slate-100 object-cover shadow-sm {notOwned ? 'border-red-400 opacity-70 ring-2 ring-red-300' : 'border-white'}"
        />
      {:else}
        <div class="flex size-14 items-center justify-center rounded-full border-2 bg-slate-200 text-sm font-semibold text-slate-500 shadow-sm {notOwned ? 'border-red-400 opacity-70 ring-2 ring-red-300' : 'border-white'}">
          {player.name?.slice(0, 2) ?? "?"}
        </div>
      {/if}

      {#if notOwned}
        <div
          class="absolute -bottom-1 -left-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white"
          title="Nicht in deinem Kader — du müsstest ihn erst in Kickbase kaufen"
        >
          €
        </div>
      {/if}

      {#if s11Info}
        <div
          class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow {s11Info.color}"
          title="S11: {s11Info.label}"
        >
          {s11Info.icon}
        </div>
      {:else if statusInfo}
        <div
          class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow {statusInfo.color}"
          title={statusInfo.label}
        >
          {statusInfo.icon}
        </div>
      {/if}

      {#if isCaptain}
        <div
          class="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shadow ring-2 ring-white"
          title="Kapitän (×2 Punkte)"
        >
          C
        </div>
      {/if}
    </div>

    <div class="rounded-md bg-black/50 px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight text-white">
      <div>{shortName}</div>
      {#if Number.isFinite(player.expectedPoints)}
        <div class="font-mono tabular-nums text-amber-300">
          {Math.round(player.expectedPoints)} pts
        </div>
      {/if}
    </div>
  </button>
{:else}
  <button
    type="button"
    onclick={handleClick}
    class="flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-white/40 bg-white/10 transition hover:bg-white/20"
  >
    <span class="text-xl text-white/40">+</span>
  </button>
{/if}
