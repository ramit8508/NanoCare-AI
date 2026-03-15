import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const parseCloudinaryUrl = (value: string): CloudinaryConfig => {
  const url = new URL(value);

  return {
    cloudName: url.hostname,
    apiKey: url.username,
    apiSecret: url.password,
  };
};

const sign = (params: Record<string, string>, apiSecret: string) => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
};

export async function POST(request: Request) {
  const configValue = process.env.CLOUDINARY_URL || "";

  if (!configValue) {
    return NextResponse.json(
      { error: "Missing CLOUDINARY_URL" },
      { status: 500 }
    );
  }

  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(configValue);
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "exercise-sessions";
  const signature = sign({ folder, timestamp }, apiSecret);

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", timestamp);
  uploadForm.append("folder", folder);
  uploadForm.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: uploadForm,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Cloudinary upload failed", details: errorText },
      { status: 500 }
    );
  }

  const payload = await response.json();

  return NextResponse.json({
    url: payload.secure_url,
    publicId: payload.public_id,
  });
}
