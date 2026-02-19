import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBaseSKU(
  categoryName: string,
  productName: string,
  attributes?: Record<string, any>,
): string {
  // 1. Process Category (First 3-4 chars, uppercase)
  const catCode = categoryName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 3);

  // 2. Process Product Name (First 2 words, combined, first 3 chars each or meaningful truncation)
  // Clean special chars first
  const cleanName = productName.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
  const words = cleanName.split(/\s+/);

  let nameCode = "";
  if (words.length >= 2) {
    // Take first 3 chars of first word + first 3 chars of second word
    nameCode = words[0].substring(0, 3) + words[1].substring(0, 3);
  } else {
    // Only one word, take up to 6 chars
    nameCode = words[0].substring(0, 6);
  }

  // 3. Process Attributes (Optional)
  let attrCode = "";
  if (attributes) {
    // Prioritize specific keys like 'color', 'storage', 'brand' if they exist,
    // or just take the first available value.
    // For this specific requirement: "Si el JSON de attributes contiene llaves como color, storage o brand, toma sus primeras letras"
    const relevantKeys = ["storage", "color", "brand", "capacity", "size"];

    for (const key of relevantKeys) {
      if (attributes[key]) {
        const val = String(attributes[key])
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase();
        // If it's something like "256GB", take it all, or limit?
        // Example says "256GB" -> "256G". Let's take up to 4 chars.
        attrCode += val.substring(0, 4);
        break; // Take only the most relevant one to keep it short? Or combine?
        // Example: CBL-CABUSB-256G (Singular attribute part).
        // The instructions imply taking one "key" part. "toma sus primeras letras".
      }
    }

    // Fallback if no specific key found but attributes exist
    if (!attrCode && Object.keys(attributes).length > 0) {
      const firstVal = String(Object.values(attributes)[0])
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      attrCode = firstVal.substring(0, 4);
    }
  }

  // Construct parts
  const parts = [catCode, nameCode];
  if (attrCode) parts.push(attrCode);

  return parts.join("-");
}
