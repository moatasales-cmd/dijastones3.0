-- CreateTable
CREATE TABLE "Stone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "n" TEXT NOT NULL,
    "c" TEXT NOT NULL,
    "r" TEXT,
    "ci" TEXT,
    "ty" TEXT,
    "to" TEXT,
    "cn" TEXT,
    "d" TEXT,
    "no" TEXT,
    "p" INTEGER,
    "p_premium" INTEGER,
    "sizes" TEXT,
    "thicknesses" TEXT,
    "finishes" TEXT,
    "applications" TEXT,
    "absorption" TEXT,
    "density" TEXT,
    "strength" TEXT,
    "slip" TEXT,
    "age" TEXT,
    "g" JSONB,
    "col" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "n" TEXT NOT NULL,
    "d" TEXT,
    "cov" TEXT
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "t" TEXT NOT NULL,
    "t_fr" TEXT,
    "y" TEXT,
    "c" TEXT,
    "c_fr" TEXT,
    "a" TEXT,
    "l" TEXT,
    "st" TEXT,
    "to" TEXT,
    "p" TEXT,
    "d" TEXT,
    "b" TEXT,
    "b_fr" TEXT,
    "bo" TEXT,
    "bo_fr" TEXT,
    "q" TEXT,
    "q_fr" TEXT,
    "qb" TEXT,
    "qb_fr" TEXT,
    "g" JSONB
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "t" TEXT NOT NULL,
    "t_fr" TEXT,
    "c" TEXT,
    "c_fr" TEXT,
    "a" TEXT,
    "dt" TEXT,
    "r" TEXT,
    "e" TEXT,
    "e_fr" TEXT,
    "img" TEXT,
    "b" TEXT,
    "b_fr" TEXT
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "created_at" TEXT,
    "last_login" TEXT,
    "last_activity" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "activity_log" JSONB,
    "full_name" TEXT,
    "phone" TEXT,
    "job_title" TEXT,
    "company_name" TEXT,
    "company_type" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "vat_id" TEXT,
    "website" TEXT,
    "preferred_port" TEXT,
    "about" TEXT
);

-- CreateTable
CREATE TABLE "Favorite" (
    "client_id" TEXT NOT NULL,
    "stone_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("client_id", "stone_id"),
    CONSTRAINT "Favorite_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proforma" (
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
    "seller_freight" REAL,
    "cost_breakdown" JSONB,
    "total_additional" REAL,
    "grand_total" REAL,
    "items" JSONB,
    "notes" TEXT,
    "status" TEXT
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "received" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "office" TEXT,
    "message" TEXT
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "received" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "phone_country" TEXT,
    "stone_id" TEXT,
    "stone_name" TEXT,
    "area" TEXT,
    "area_unit" TEXT,
    "message" TEXT
);

-- CreateTable
CREATE TABLE "TradeApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "received" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "role" TEXT,
    "referral" TEXT,
    "values" JSONB,
    "project_example" TEXT,
    "volume" TEXT,
    "stone_interest" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT,
    "role" TEXT,
    "city" TEXT,
    "country" TEXT,
    "flag" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "phone" JSONB,
    "email" TEXT,
    "hours" TEXT,
    "lat" REAL,
    "lng" REAL,
    "image" TEXT,
    "whatsapp" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
