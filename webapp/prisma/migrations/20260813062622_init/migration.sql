-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "login_id" TEXT,
    "password_hash" TEXT,
    "lineworks_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sites" (
    "site_id" SERIAL NOT NULL,
    "order_number" TEXT,
    "site_name" TEXT NOT NULL,
    "client_name" TEXT,
    "site_address" TEXT,
    "delivery_due_date" DATE,
    "manager_user_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT '進行中',
    "note" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("site_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "order_number" TEXT,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER,
    "material" TEXT,
    "thickness" TEXT,
    "finish" TEXT,
    "drawing_number" TEXT,
    "process_due_date" DATE,
    "delivery_date" DATE,
    "material_status" TEXT DEFAULT '未発注',
    "material_arrival_date" DATE,
    "surface_type" TEXT,
    "vendor_name" TEXT,
    "vendor_send_date" DATE,
    "vendor_return_planned" DATE,
    "vendor_return_actual" DATE,
    "status" TEXT NOT NULL DEFAULT '未着手',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "process_templates" (
    "template_id" SERIAL NOT NULL,
    "template_name" TEXT NOT NULL,
    "process_name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "alert_message" TEXT,

    CONSTRAINT "process_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "processes" (
    "process_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "process_name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "started_by" TEXT,
    "completed_at" TIMESTAMP(3),
    "completed_by" TEXT,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("process_id")
);

-- CreateTable
CREATE TABLE "check_items" (
    "item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "check_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "check_records" (
    "record_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "checker_name" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "check_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "material_masters" (
    "material_id" SERIAL NOT NULL,
    "material_code" TEXT,
    "material_type" TEXT,
    "material_grade" TEXT,
    "size_spec" TEXT,
    "unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "material_masters_pkey" PRIMARY KEY ("material_id")
);

-- CreateTable
CREATE TABLE "material_details" (
    "detail_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "material_id" INTEGER,
    "part_name" TEXT,
    "material_grade" TEXT,
    "size_spec" TEXT,
    "length" DECIMAL(65,30),
    "unit" TEXT,
    "quantity_estimated" DECIMAL(65,30),
    "quantity_actual" DECIMAL(65,30),
    "source" TEXT,
    "note" TEXT,

    CONSTRAINT "material_details_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "files" (
    "file_id" SERIAL NOT NULL,
    "site_id" INTEGER,
    "product_id" INTEGER,
    "file_name" TEXT,
    "file_type" TEXT,
    "file_path" TEXT NOT NULL,
    "category" TEXT,
    "original_name" TEXT,
    "extracted_text" TEXT,
    "match_status" TEXT,
    "match_confidence" DECIMAL(65,30),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "notify_type" TEXT NOT NULL,
    "target" TEXT,
    "message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "products_site_id_idx" ON "products"("site_id");

-- CreateIndex
CREATE INDEX "products_drawing_number_idx" ON "products"("drawing_number");

-- CreateIndex
CREATE INDEX "processes_product_id_idx" ON "processes"("product_id");

-- CreateIndex
CREATE INDEX "check_records_product_id_idx" ON "check_records"("product_id");

-- CreateIndex
CREATE INDEX "material_details_product_id_idx" ON "material_details"("product_id");

-- CreateIndex
CREATE INDEX "files_site_id_idx" ON "files"("site_id");

-- CreateIndex
CREATE INDEX "files_product_id_idx" ON "files"("product_id");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_manager_user_id_fkey" FOREIGN KEY ("manager_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("site_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_records" ADD CONSTRAINT "check_records_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_details" ADD CONSTRAINT "material_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_details" ADD CONSTRAINT "material_details_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material_masters"("material_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("site_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;
