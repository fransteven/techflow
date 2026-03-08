CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" text,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "layaway_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"layaway_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_item_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"agreed_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layaways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" text NOT NULL,
	"reference_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "layaway_details" ADD CONSTRAINT "layaway_details_layaway_id_layaways_id_fk" FOREIGN KEY ("layaway_id") REFERENCES "public"."layaways"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layaway_details" ADD CONSTRAINT "layaway_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layaway_details" ADD CONSTRAINT "layaway_details_product_item_id_product_items_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."product_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layaways" ADD CONSTRAINT "layaways_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;