export type ReleaseAsset = {
  id: number;
  name: string;
};

export type Release = {
  tag_name?: string;
  assets?: ReleaseAsset[];
};

export type AssetSelection = {
  asset: ReleaseAsset;
  matchedArch: string;
  matchedPattern: string;
  allMatches: ReleaseAsset[];
};
