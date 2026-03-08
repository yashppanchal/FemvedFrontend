type CloudinaryCropMode = "fill" | "fit" | "limit" | "scale";

type CloudinaryOptions = {
  width?: number;
  quality?: string | number;
  crop?: CloudinaryCropMode;
};

function isCloudinaryDeliveryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com") && url.includes("/image/upload/");
}

function normalizeImageUrl(url: string | undefined): string {
  return (url ?? "").trim();
}

export function optimizeCloudinaryImageUrl(
  sourceUrl: string | undefined,
  options: CloudinaryOptions = {},
): string {
  const url = normalizeImageUrl(sourceUrl);
  if (!url || !isCloudinaryDeliveryUrl(url)) return url;

  const transforms: string[] = ["f_auto", "dpr_auto"];
  const quality = options.quality ?? "auto";
  transforms.push(`q_${quality}`);

  if (options.width && Number.isFinite(options.width) && options.width > 0) {
    transforms.push(`w_${Math.round(options.width)}`);
  }

  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }

  return url.replace(
    "/image/upload/",
    `/image/upload/${transforms.join(",")}/`,
  );
}

export function buildCloudinarySrcSet(
  sourceUrl: string | undefined,
  widths: number[],
  options: Omit<CloudinaryOptions, "width"> = {},
): string | undefined {
  const url = normalizeImageUrl(sourceUrl);
  if (!url || !isCloudinaryDeliveryUrl(url)) return undefined;

  const entries = widths
    .filter((width) => Number.isFinite(width) && width > 0)
    .map((width) => {
      const transformed = optimizeCloudinaryImageUrl(url, {
        ...options,
        width,
      });
      return `${transformed} ${width}w`;
    });

  return entries.length ? entries.join(", ") : undefined;
}
