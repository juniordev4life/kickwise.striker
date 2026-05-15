<script>
  let { player } = $props();

  // Kickbase player images use the host kickbase.b-cdn.net
  const imgSrc = $derived(
    player.imageUrl ? `https://kickbase.b-cdn.net/${player.imageUrl}` : null
  );

  const statusClass = $derived(
    player.status === "fit"
      ? "bg-emerald-50 text-emerald-700"
      : player.status === "injured"
        ? "bg-red-50 text-red-700"
        : player.status === "questionable"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-50 text-slate-500"
  );

  const mvFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  const trendIcon = $derived.by(() => {
    const delta = player.marketValueTrend24h;
    if (delta === null || delta === undefined) return null;
    if (delta > 0) return { icon: "▲", color: "text-emerald-600" };
    if (delta < 0) return { icon: "▼", color: "text-red-600" };
    return { icon: "■", color: "text-slate-400" };
  });
</script>

<tr class="border-b border-slate-100 hover:bg-slate-50">
  <td class="px-3 py-2">
    {#if imgSrc}
      <img src={imgSrc} alt="" width="36" height="36" class="rounded-full bg-slate-200 object-cover" loading="lazy" />
    {:else}
      <span class="inline-flex size-9 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500">
        {player.name?.slice(0, 2) ?? "?"}
      </span>
    {/if}
  </td>
  <td class="px-3 py-2">
    <div class="font-medium text-slate-900">{player.name}</div>
    <div class="text-xs text-slate-500">{player.teamName ?? "—"}</div>
  </td>
  <td class="px-3 py-2 text-center">
    <span class="inline-flex size-7 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-700">
      {player.position}
    </span>
  </td>
  <td class="px-3 py-2 text-right tabular-nums">
    <div class="font-medium text-slate-900">{mvFormatter.format(player.marketValue ?? 0)}</div>
    {#if trendIcon}
      <div class="text-xs {trendIcon.color}">
        {trendIcon.icon} {mvFormatter.format(Math.abs(player.marketValueTrend24h))}
      </div>
    {/if}
  </td>
  <td class="px-3 py-2 text-right tabular-nums">
    <div class="font-medium text-slate-900">
      {player.averagePoints !== null && player.averagePoints !== undefined ? player.averagePoints : "—"}
    </div>
    <div class="text-xs text-slate-500">Σ {player.totalPoints ?? "—"}</div>
  </td>
  <td class="px-3 py-2 text-center">
    <span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClass}">{player.status}</span>
  </td>
</tr>
