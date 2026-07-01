/*
  Warnings:

  - You are about to alter the column `seller_freight` on the `Proforma` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proforma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TEXT,
    "valid_until" TEXT,
    "unit_system" TEXT,
    "client_id" TEXT,
    "client" JSONB,
    "destination_country" TEXT,
    "destination_port" TEXT,
    "incoterm" TEXT,
    "incoterm_label" TEXT,
    "payment_term" TEXT,
    "shipping_zone" TEXT,
    "shipping_rate_per_container" REAL,
    "total_containers" INTEGER,
    "container_detail" JSONB,
    "per_origin_shipping" JSONB,
    "shipping_note" TEXT,
    "shipping_disclaimer" TEXT,
    "total_m2" REAL,
    "subtotal" REAL,
    "shipping_cost" REAL,
    "seller_freight" BOOLEAN,
    "cost_breakdown" JSONB,
    "total_additional" REAL,
    "grand_total" REAL,
    "total_sqf" REAL,
    "items" JSONB,
    "notes" TEXT,
    "status" TEXT
);
INSERT INTO "new_Proforma" ("client", "client_id", "container_detail", "cost_breakdown", "created_at", "destination_country", "destination_port", "grand_total", "id", "incoterm", "incoterm_label", "items", "notes", "payment_term", "per_origin_shipping", "seller_freight", "shipping_cost", "shipping_disclaimer", "shipping_note", "shipping_rate_per_container", "shipping_zone", "status", "subtotal", "total_additional", "total_containers", "total_m2", "unit_system", "valid_until") SELECT "client", "client_id", "container_detail", "cost_breakdown", "created_at", "destination_country", "destination_port", "grand_total", "id", "incoterm", "incoterm_label", "items", "notes", "payment_term", "per_origin_shipping", "seller_freight", "shipping_cost", "shipping_disclaimer", "shipping_note", "shipping_rate_per_container", "shipping_zone", "status", "subtotal", "total_additional", "total_containers", "total_m2", "unit_system", "valid_until" FROM "Proforma";
DROP TABLE "Proforma";
ALTER TABLE "new_Proforma" RENAME TO "Proforma";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
