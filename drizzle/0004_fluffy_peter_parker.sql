CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_items" ADD COLUMN "owner_type" text DEFAULT 'masterplay' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_items" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "product_items" ADD COLUMN "base_cost" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_items" ADD COLUMN "condition_details" jsonb;--> statement-breakpoint
ALTER TABLE "product_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "sale_details" ADD COLUMN "commission_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;