<script>
let { entries } = $props();
</script>

<table class="w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
  <thead class="bg-slate-50 text-left text-xs font-medium text-slate-500">
    <tr>
      <th class="px-3 py-2">#</th>
      <th class="px-3 py-2">Manager</th>
      <th class="px-3 py-2 text-right">Punkte</th>
      <th class="px-3 py-2 text-right">Kaderwert</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-slate-100">
    {#each entries as entry (entry.userId)}
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-2 font-mono text-slate-500">{entry.rank}</td>
        <td class="px-3 py-2 font-medium text-slate-900">{entry.name}</td>
        <td class="px-3 py-2 text-right tabular-nums">{entry.totalPoints}</td>
        <td class="px-3 py-2 text-right text-slate-500 tabular-nums">
          {entry.teamValue
            ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(entry.teamValue)
            : "—"}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
