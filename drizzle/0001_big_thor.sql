CREATE TABLE "referentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_tps" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"tp_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tps" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'General',
	"color" text DEFAULT 'bg-slate-100',
	"group_id" integer
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plate" text,
	"status" text DEFAULT 'available'
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "referential_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "color" text DEFAULT 'white' NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poles" ADD COLUMN "referential_id" integer;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "current_tp_id" integer;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "current_vehicle_id" integer;--> statement-breakpoint
ALTER TABLE "student_tps" ADD CONSTRAINT "student_tps_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tps" ADD CONSTRAINT "student_tps_tp_id_tps_id_fk" FOREIGN KEY ("tp_id") REFERENCES "public"."tps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tps" ADD CONSTRAINT "tps_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_referential_id_referentials_id_fk" FOREIGN KEY ("referential_id") REFERENCES "public"."referentials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poles" ADD CONSTRAINT "poles_referential_id_referentials_id_fk" FOREIGN KEY ("referential_id") REFERENCES "public"."referentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_current_tp_id_tps_id_fk" FOREIGN KEY ("current_tp_id") REFERENCES "public"."tps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_current_vehicle_id_vehicles_id_fk" FOREIGN KEY ("current_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;