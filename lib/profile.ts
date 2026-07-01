// Profile fields + completion scoring — ported from inc/profile-helper.php.
// Keys are Client model field names (camelCase).

export interface ProfileField {
  key: string;
  label: string;
  weight: number;
  section: string;
  options?: string[];
}

export const PROFILE_FIELDS: ProfileField[] = [
  { key: "fullName", label: "Full Name", weight: 10, section: "personal" },
  { key: "phone", label: "Phone Number", weight: 10, section: "personal" },
  { key: "jobTitle", label: "Job Title", weight: 5, section: "professional" },
  { key: "companyName", label: "Company Name", weight: 15, section: "company" },
  {
    key: "companyType",
    label: "Company Type",
    weight: 10,
    section: "company",
    options: [
      "Architect",
      "Interior Designer",
      "General Contractor",
      "Stone Contractor",
      "Developer",
      "Importer / Distributor",
      "Wholesaler",
      "Homeowner",
      "Other",
    ],
  },
  { key: "country", label: "Country", weight: 15, section: "location" },
  { key: "city", label: "City", weight: 5, section: "location" },
  { key: "address", label: "Street Address", weight: 5, section: "location" },
  { key: "vatId", label: "VAT / Tax ID", weight: 5, section: "company" },
  { key: "website", label: "Company Website", weight: 5, section: "professional" },
  { key: "preferredPort", label: "Preferred Port", weight: 5, section: "shipping" },
  { key: "about", label: "About / Notes", weight: 10, section: "notes" },
];

/** Editable profile keys (whitelist for the update API). */
export const PROFILE_KEYS = PROFILE_FIELDS.map((f) => f.key);

export interface CompletionDetail extends ProfileField {
  filled: boolean;
  value: string;
}

export function calcCompletion(client: Record<string, unknown>): {
  percent: number;
  details: CompletionDetail[];
} {
  let filledWeight = 0;
  let totalWeight = 0;
  const details = PROFILE_FIELDS.map((f) => {
    const raw = client[f.key];
    const value = typeof raw === "string" ? raw.trim() : "";
    const filled = value !== "";
    totalWeight += f.weight;
    if (filled) filledWeight += f.weight;
    return { ...f, filled, value };
  });
  const percent = totalWeight ? Math.round((filledWeight / totalWeight) * 100) : 0;
  return { percent, details };
}
