import type { AssetSelection, ReleaseAsset } from "./types";
import { escapeRegExp } from "./regex";

function archRank(assetName: string, candidates: string[]): number {
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const pattern = new RegExp(`(^|[._-])${escapeRegExp(candidate)}([._-]|$)`, "i");

    if (pattern.test(assetName)) {
      return i;
    }
  }

  return Number.POSITIVE_INFINITY;
}

function assetPenalty(name: string): number {
  let penalty = 0;

  if (/\.src\.rpm$/i.test(name)) {
    penalty += 50;
  }

  if (/debuginfo|debugsource/i.test(name)) {
    penalty += 30;
  }

  return penalty;
}

function pickBestAsset(matches: ReleaseAsset[]): ReleaseAsset[] {
  return [...matches].sort((a, b) => {
    const penaltyDelta = assetPenalty(a.name) - assetPenalty(b.name);
    if (penaltyDelta !== 0) {
      return penaltyDelta;
    }

    return a.name.localeCompare(b.name);
  });
}

export function selectAsset(params: {
  assets: ReleaseAsset[];
  pattern: string;
  flags: string;
  archCandidates: string[];
}): AssetSelection | null {
  const { assets, pattern, flags, archCandidates } = params;

  if (pattern.includes("{arch}")) {
    for (const arch of archCandidates) {
      const concrete = pattern.replace(/\{arch\}/g, escapeRegExp(arch));
      const regex = new RegExp(concrete, flags);
      const matches = assets.filter((asset) => regex.test(asset.name));

      if (matches.length > 0) {
        const sorted = pickBestAsset(matches);

        return {
          asset: sorted[0],
          matchedArch: arch,
          matchedPattern: concrete,
          allMatches: sorted,
        };
      }
    }

    return null;
  }

  const regex = new RegExp(pattern, flags);
  const matches = assets.filter((asset) => regex.test(asset.name));

  if (matches.length === 0) {
    return null;
  }

  const scored = matches
    .map((asset) => ({
      asset,
      rank: archRank(asset.name, archCandidates),
      penalty: assetPenalty(asset.name),
    }))
    .sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      if (a.penalty !== b.penalty) {
        return a.penalty - b.penalty;
      }

      return a.asset.name.localeCompare(b.asset.name);
    });

  return {
    asset: scored[0].asset,
    matchedArch: Number.isFinite(scored[0].rank) ? archCandidates[scored[0].rank] : "unknown",
    matchedPattern: pattern,
    allMatches: scored.map((entry) => entry.asset),
  };
}
