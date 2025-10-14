import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_herbs_botanical_info_common_names_language" AS ENUM('en', 'zh-pinyin', 'zh', 'es', 'native', 'other');
  CREATE TYPE "public"."enum_herbs_botanical_info_parts_used" AS ENUM('root', 'leaf', 'stem', 'flower', 'seed', 'bark', 'fruit', 'whole_plant', 'rhizome', 'bulb', 'resin');
  CREATE TYPE "public"."enum_herbs_tcm_properties_tcm_taste" AS ENUM('sweet', 'bitter', 'sour', 'pungent', 'salty', 'bland');
  CREATE TYPE "public"."enum_herbs_tcm_properties_tcm_meridians" AS ENUM('lung', 'large_intestine', 'stomach', 'spleen', 'heart', 'small_intestine', 'bladder', 'kidney', 'pericardium', 'triple_burner', 'gallbladder', 'liver');
  CREATE TYPE "public"."enum_herbs_western_properties" AS ENUM('adaptogen', 'alterative', 'analgesic', 'anti_inflammatory', 'antimicrobial', 'antioxidant', 'antispasmodic', 'astringent', 'bitter', 'carminative', 'demulcent', 'diaphoretic', 'diuretic', 'expectorant', 'hepatic', 'nervine', 'sedative', 'stimulant', 'tonic', 'vulnerary');
  CREATE TYPE "public"."enum_herbs_dosage_forms" AS ENUM('tincture', 'tea', 'decoction', 'capsule', 'tablet', 'powder', 'extract', 'essential_oil', 'poultice', 'salve', 'syrup', 'compress');
  CREATE TYPE "public"."enum_herbs_recommended_dosage_form" AS ENUM('tincture', 'tea', 'decoction', 'capsule', 'tablet', 'powder', 'extract');
  CREATE TYPE "public"."enum_herbs_preparation_methods_method_type" AS ENUM('decoction', 'infusion', 'tincture', 'powder', 'poultice', 'extract', 'oil_infusion');
  CREATE TYPE "public"."type" AS ENUM('major', 'moderate', 'minor');
  CREATE TYPE "public"."enum_herbs_images_image_type" AS ENUM('whole_plant', 'flower', 'leaf', 'root', 'bark', 'seed', 'dried', 'habitat', 'preparation');
  CREATE TYPE "public"."enum_herbs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_herbs_botanical_info_plant_type" AS ENUM('herb', 'shrub', 'tree', 'vine', 'grass', 'fern', 'moss', 'fungus', 'lichen');
  CREATE TYPE "public"."enum_herbs_cultivation_sunlight_needs" AS ENUM('full_sun', 'partial_shade', 'full_shade');
  CREATE TYPE "public"."enum_herbs_cultivation_water_needs" AS ENUM('low', 'moderate', 'high');
  CREATE TYPE "public"."enum_herbs_conservation_status" AS ENUM('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_wild', 'not_evaluated', 'data_deficient');
  CREATE TYPE "public"."enum_herbs_tcm_properties_tcm_temperature" AS ENUM('hot', 'warm', 'neutral', 'cool', 'cold');
  CREATE TYPE "public"."enum_herbs_safety_info_toxicity_level" AS ENUM('none', 'low', 'moderate', 'high', 'severe');
  CREATE TYPE "public"."enum_herbs_safety_info_allergenic_potential" AS ENUM('none', 'low', 'moderate', 'high');
  CREATE TYPE "public"."enum_herbs_peer_review_status" AS ENUM('draft', 'in_review', 'peer_reviewed', 'expert_verified', 'published', 'needs_update');
  CREATE TYPE "public"."enum__herbs_v_version_botanical_info_common_names_language" AS ENUM('en', 'zh-pinyin', 'zh', 'es', 'native', 'other');
  CREATE TYPE "public"."enum__herbs_v_version_botanical_info_parts_used" AS ENUM('root', 'leaf', 'stem', 'flower', 'seed', 'bark', 'fruit', 'whole_plant', 'rhizome', 'bulb', 'resin');
  CREATE TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_taste" AS ENUM('sweet', 'bitter', 'sour', 'pungent', 'salty', 'bland');
  CREATE TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_meridians" AS ENUM('lung', 'large_intestine', 'stomach', 'spleen', 'heart', 'small_intestine', 'bladder', 'kidney', 'pericardium', 'triple_burner', 'gallbladder', 'liver');
  CREATE TYPE "public"."enum__herbs_v_version_western_properties" AS ENUM('adaptogen', 'alterative', 'analgesic', 'anti_inflammatory', 'antimicrobial', 'antioxidant', 'antispasmodic', 'astringent', 'bitter', 'carminative', 'demulcent', 'diaphoretic', 'diuretic', 'expectorant', 'hepatic', 'nervine', 'sedative', 'stimulant', 'tonic', 'vulnerary');
  CREATE TYPE "public"."enum__herbs_v_version_dosage_forms" AS ENUM('tincture', 'tea', 'decoction', 'capsule', 'tablet', 'powder', 'extract', 'essential_oil', 'poultice', 'salve', 'syrup', 'compress');
  CREATE TYPE "public"."enum__herbs_v_version_recommended_dosage_form" AS ENUM('tincture', 'tea', 'decoction', 'capsule', 'tablet', 'powder', 'extract');
  CREATE TYPE "public"."enum__herbs_v_version_preparation_methods_method_type" AS ENUM('decoction', 'infusion', 'tincture', 'powder', 'poultice', 'extract', 'oil_infusion');
  CREATE TYPE "public"."enum__herbs_v_version_images_image_type" AS ENUM('whole_plant', 'flower', 'leaf', 'root', 'bark', 'seed', 'dried', 'habitat', 'preparation');
  CREATE TYPE "public"."enum__herbs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__herbs_v_version_botanical_info_plant_type" AS ENUM('herb', 'shrub', 'tree', 'vine', 'grass', 'fern', 'moss', 'fungus', 'lichen');
  CREATE TYPE "public"."enum__herbs_v_version_cultivation_sunlight_needs" AS ENUM('full_sun', 'partial_shade', 'full_shade');
  CREATE TYPE "public"."enum__herbs_v_version_cultivation_water_needs" AS ENUM('low', 'moderate', 'high');
  CREATE TYPE "public"."enum__herbs_v_version_conservation_status" AS ENUM('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_wild', 'not_evaluated', 'data_deficient');
  CREATE TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_temperature" AS ENUM('hot', 'warm', 'neutral', 'cool', 'cold');
  CREATE TYPE "public"."enum__herbs_v_version_safety_info_toxicity_level" AS ENUM('none', 'low', 'moderate', 'high', 'severe');
  CREATE TYPE "public"."enum__herbs_v_version_safety_info_allergenic_potential" AS ENUM('none', 'low', 'moderate', 'high');
  CREATE TYPE "public"."enum__herbs_v_version_peer_review_status" AS ENUM('draft', 'in_review', 'peer_reviewed', 'expert_verified', 'published', 'needs_update');
  CREATE TYPE "public"."enum_formulas_ingredients_unit" AS ENUM('g', 'mg', 'oz', 'ml', 'tsp', 'tbsp', 'drops', 'parts');
  CREATE TYPE "public"."enum_formulas_ingredients_role" AS ENUM('chief', 'deputy', 'assistant', 'envoy');
  CREATE TYPE "public"."enum_formulas_total_weight_unit" AS ENUM('g', 'mg', 'oz', 'ml');
  CREATE TYPE "public"."enum_formulas_tradition" AS ENUM('tcm', 'ayurveda', 'western', 'native_american', 'modern', 'other');
  CREATE TYPE "public"."enum_formulas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__formulas_v_version_ingredients_unit" AS ENUM('g', 'mg', 'oz', 'ml', 'tsp', 'tbsp', 'drops', 'parts');
  CREATE TYPE "public"."enum__formulas_v_version_ingredients_role" AS ENUM('chief', 'deputy', 'assistant', 'envoy');
  CREATE TYPE "public"."enum__formulas_v_version_total_weight_unit" AS ENUM('g', 'mg', 'oz', 'ml');
  CREATE TYPE "public"."enum__formulas_v_version_tradition" AS ENUM('tcm', 'ayurveda', 'western', 'native_american', 'modern', 'other');
  CREATE TYPE "public"."enum__formulas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_conditions_severity" AS ENUM('mild', 'moderate', 'severe', 'life_threatening');
  CREATE TYPE "public"."enum_conditions_category" AS ENUM('digestive', 'respiratory', 'cardiovascular', 'musculoskeletal', 'nervous', 'immune', 'endocrine', 'skin', 'mental', 'other');
  CREATE TYPE "public"."enum_conditions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__conditions_v_version_severity" AS ENUM('mild', 'moderate', 'severe', 'life_threatening');
  CREATE TYPE "public"."enum__conditions_v_version_category" AS ENUM('digestive', 'respiratory', 'cardiovascular', 'musculoskeletal', 'nervous', 'immune', 'endocrine', 'skin', 'mental', 'other');
  CREATE TYPE "public"."enum__conditions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_symptoms_severity" AS ENUM('mild', 'moderate', 'severe');
  CREATE TYPE "public"."enum_symptoms_duration" AS ENUM('acute', 'subacute', 'chronic');
  CREATE TYPE "public"."enum_symptoms_category" AS ENUM('physical', 'mental', 'digestive', 'respiratory', 'pain', 'skin', 'sleep', 'energy', 'other');
  CREATE TYPE "public"."enum_symptoms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__symptoms_v_version_severity" AS ENUM('mild', 'moderate', 'severe');
  CREATE TYPE "public"."enum__symptoms_v_version_duration" AS ENUM('acute', 'subacute', 'chronic');
  CREATE TYPE "public"."enum__symptoms_v_version_category" AS ENUM('physical', 'mental', 'digestive', 'respiratory', 'pain', 'skin', 'sleep', 'energy', 'other');
  CREATE TYPE "public"."enum__symptoms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_modalities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__modalities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_practitioners_practice_type" AS ENUM('solo', 'group', 'clinic', 'hospital', 'online');
  CREATE TYPE "public"."enum_practitioners_pricing_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD');
  CREATE TYPE "public"."enum_practitioners_verification_status" AS ENUM('pending', 'verified', 'suspended');
  CREATE TYPE "public"."enum_practitioners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__practitioners_v_version_practice_type" AS ENUM('solo', 'group', 'clinic', 'hospital', 'online');
  CREATE TYPE "public"."enum__practitioners_v_version_pricing_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD');
  CREATE TYPE "public"."enum__practitioners_v_version_verification_status" AS ENUM('pending', 'verified', 'suspended');
  CREATE TYPE "public"."enum__practitioners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_reviewed_entity_type" AS ENUM('herb', 'formula', 'practitioner', 'modality');
  CREATE TYPE "public"."enum_reviews_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__reviews_v_version_reviewed_entity_type" AS ENUM('herb', 'formula', 'practitioner', 'modality');
  CREATE TYPE "public"."enum__reviews_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');
  CREATE TYPE "public"."enum__reviews_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_grok_insights_recommendations_type" AS ENUM('herb', 'formula', 'modality', 'practitioner', 'lifestyle');
  CREATE TYPE "public"."enum_media_license" AS ENUM('public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'cc_by_nc', 'all_rights_reserved', 'other');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'peer_reviewer', 'herbalist', 'practitioner', 'user');
  CREATE TYPE "public"."enum_users_preferences_language" AS ENUM('en', 'es', 'zh-CN', 'zh-TW');
  CREATE TYPE "public"."enum_users_preferences_theme" AS ENUM('light', 'dark', 'system');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'MFA_ENABLED', 'MFA_DISABLED', 'PHI_VIEW', 'PHI_CREATE', 'PHI_UPDATE', 'PHI_DELETE', 'PHI_EXPORT', 'SYMPTOM_SUBMIT', 'SYMPTOM_RESULT_VIEW', 'PROFILE_VIEW', 'PROFILE_UPDATE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CHANGE', 'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY');
  CREATE TYPE "public"."enum_audit_logs_method" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE');
  CREATE TYPE "public"."enum_audit_logs_severity" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL');
  CREATE TYPE "public"."enum_import_logs_type" AS ENUM('trefle-sync', 'trefle-progressive-import', 'trefle-sync-error', 'perenual-progressive-import', 'perenual-sync-error', 'external-import', 'algolia-sync', 'database-backup', 'cache-cleanup', 'other');
  CREATE TYPE "public"."enum_validation_reports_issues_severity" AS ENUM('error', 'warning', 'info');
  CREATE TYPE "public"."enum_validation_reports_type" AS ENUM('herb-validation', 'trefle-name-mismatch', 'formula-validation', 'image-validation', 'scientific-name-validation', 'other');
  CREATE TABLE IF NOT EXISTS "herbs_botanical_info_common_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"language" "enum_herbs_botanical_info_common_names_language",
  	"region" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_botanical_info_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"synonym" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_botanical_info_native_region" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_botanical_info_parts_used" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_herbs_botanical_info_parts_used",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_tcm_properties_tcm_taste" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_herbs_tcm_properties_tcm_taste",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_tcm_properties_tcm_meridians" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_herbs_tcm_properties_tcm_meridians",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_western_properties" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_herbs_western_properties",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_active_constituents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"compound_name" varchar,
  	"compound_class" varchar,
  	"percentage" numeric,
  	"effects" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_clinical_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"year" numeric,
  	"summary" jsonb,
  	"url" varchar,
  	"doi" varchar,
  	"conclusion" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_dosage_forms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_herbs_dosage_forms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_recommended_dosage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" "enum_herbs_recommended_dosage_form",
  	"amount" varchar,
  	"frequency" varchar,
  	"duration" varchar,
  	"population" varchar,
  	"notes" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_preparation_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"method_type" "enum_herbs_preparation_methods_method_type",
  	"instructions" jsonb,
  	"time" varchar,
  	"yield" varchar,
  	"storage" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "drug_int" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"drug_name" varchar,
  	"interaction_type" "type",
  	"description" varchar,
  	"mechanism" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_type" "enum_herbs_images_image_type"
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"youtube_id" varchar,
  	"description" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_search_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "herbs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"status" "enum_herbs_status" DEFAULT 'draft',
  	"featured_image_id" integer,
  	"botanical_info_scientific_name" varchar,
  	"botanical_info_family" varchar,
  	"botanical_info_genus" varchar,
  	"botanical_info_species" varchar,
  	"botanical_info_plant_type" "enum_herbs_botanical_info_plant_type",
  	"botanical_info_habitat" varchar,
  	"botanical_info_botanical_description" jsonb,
  	"cultivation_soil_type" varchar,
  	"cultivation_climate_zone" varchar,
  	"cultivation_sunlight_needs" "enum_herbs_cultivation_sunlight_needs",
  	"cultivation_water_needs" "enum_herbs_cultivation_water_needs",
  	"cultivation_hardiness_zone" varchar,
  	"cultivation_propagation_method" varchar,
  	"cultivation_growing_season" varchar,
  	"conservation_status" "enum_herbs_conservation_status",
  	"conservation_notes" jsonb,
  	"tcm_properties_tcm_temperature" "enum_herbs_tcm_properties_tcm_temperature",
  	"tcm_properties_tcm_functions" jsonb,
  	"tcm_properties_tcm_category" varchar,
  	"tcm_properties_tcm_traditional_uses" jsonb,
  	"therapeutic_uses" jsonb,
  	"traditional_american_uses" jsonb,
  	"native_american_uses" jsonb,
  	"pharmacological_effects" jsonb,
  	"safety_info_contraindications" jsonb,
  	"safety_info_side_effects" jsonb,
  	"safety_info_toxicity_level" "enum_herbs_safety_info_toxicity_level",
  	"safety_info_toxicity_notes" jsonb,
  	"safety_info_allergenic_potential" "enum_herbs_safety_info_allergenic_potential",
  	"average_rating" numeric,
  	"review_count" numeric,
  	"herb_id" varchar,
  	"peer_review_status" "enum_herbs_peer_review_status" DEFAULT 'draft',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_herbs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "herbs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_botanical_info_common_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"language" "enum__herbs_v_version_botanical_info_common_names_language",
  	"region" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_botanical_info_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"synonym" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_botanical_info_native_region" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"region" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_botanical_info_parts_used" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__herbs_v_version_botanical_info_parts_used",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_taste" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__herbs_v_version_tcm_properties_tcm_taste",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_meridians" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__herbs_v_version_tcm_properties_tcm_meridians",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_western_properties" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__herbs_v_version_western_properties",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_active_constituents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"compound_name" varchar,
  	"compound_class" varchar,
  	"percentage" numeric,
  	"effects" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_clinical_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"year" numeric,
  	"summary" jsonb,
  	"url" varchar,
  	"doi" varchar,
  	"conclusion" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_dosage_forms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__herbs_v_version_dosage_forms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_recommended_dosage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" "enum__herbs_v_version_recommended_dosage_form",
  	"amount" varchar,
  	"frequency" varchar,
  	"duration" varchar,
  	"population" varchar,
  	"notes" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_preparation_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"method_type" "enum__herbs_v_version_preparation_methods_method_type",
  	"instructions" jsonb,
  	"time" varchar,
  	"yield" varchar,
  	"storage" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_drug_int_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"drug_name" varchar,
  	"interaction_type" "type",
  	"description" varchar,
  	"mechanism" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_type" "enum__herbs_v_version_images_image_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"youtube_id" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_version_search_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_status" "enum__herbs_v_version_status" DEFAULT 'draft',
  	"version_featured_image_id" integer,
  	"version_botanical_info_scientific_name" varchar,
  	"version_botanical_info_family" varchar,
  	"version_botanical_info_genus" varchar,
  	"version_botanical_info_species" varchar,
  	"version_botanical_info_plant_type" "enum__herbs_v_version_botanical_info_plant_type",
  	"version_botanical_info_habitat" varchar,
  	"version_botanical_info_botanical_description" jsonb,
  	"version_cultivation_soil_type" varchar,
  	"version_cultivation_climate_zone" varchar,
  	"version_cultivation_sunlight_needs" "enum__herbs_v_version_cultivation_sunlight_needs",
  	"version_cultivation_water_needs" "enum__herbs_v_version_cultivation_water_needs",
  	"version_cultivation_hardiness_zone" varchar,
  	"version_cultivation_propagation_method" varchar,
  	"version_cultivation_growing_season" varchar,
  	"version_conservation_status" "enum__herbs_v_version_conservation_status",
  	"version_conservation_notes" jsonb,
  	"version_tcm_properties_tcm_temperature" "enum__herbs_v_version_tcm_properties_tcm_temperature",
  	"version_tcm_properties_tcm_functions" jsonb,
  	"version_tcm_properties_tcm_category" varchar,
  	"version_tcm_properties_tcm_traditional_uses" jsonb,
  	"version_therapeutic_uses" jsonb,
  	"version_traditional_american_uses" jsonb,
  	"version_native_american_uses" jsonb,
  	"version_pharmacological_effects" jsonb,
  	"version_safety_info_contraindications" jsonb,
  	"version_safety_info_side_effects" jsonb,
  	"version_safety_info_toxicity_level" "enum__herbs_v_version_safety_info_toxicity_level",
  	"version_safety_info_toxicity_notes" jsonb,
  	"version_safety_info_allergenic_potential" "enum__herbs_v_version_safety_info_allergenic_potential",
  	"version_average_rating" numeric,
  	"version_review_count" numeric,
  	"version_herb_id" varchar,
  	"version_peer_review_status" "enum__herbs_v_version_peer_review_status" DEFAULT 'draft',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__herbs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_herbs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "formulas_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"herb_id" integer,
  	"quantity" numeric,
  	"unit" "enum_formulas_ingredients_unit",
  	"percentage" numeric,
  	"role" "enum_formulas_ingredients_role"
  );
  
  CREATE TABLE IF NOT EXISTS "formulas_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"use_case" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "formulas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"short_description" varchar,
  	"featured_image_id" integer,
  	"total_weight" numeric,
  	"total_weight_unit" "enum_formulas_total_weight_unit",
  	"preparation_instructions" jsonb,
  	"dosage" jsonb,
  	"tradition" "enum_formulas_tradition",
  	"category" varchar,
  	"historical_text" varchar,
  	"modern_adaptations" jsonb,
  	"contraindications" jsonb,
  	"side_effects" jsonb,
  	"status" "enum_formulas_status" DEFAULT 'draft',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_formulas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "formulas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_formulas_v_version_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"herb_id" integer,
  	"quantity" numeric,
  	"unit" "enum__formulas_v_version_ingredients_unit",
  	"percentage" numeric,
  	"role" "enum__formulas_v_version_ingredients_role",
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_formulas_v_version_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"use_case" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_formulas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_short_description" varchar,
  	"version_featured_image_id" integer,
  	"version_total_weight" numeric,
  	"version_total_weight_unit" "enum__formulas_v_version_total_weight_unit",
  	"version_preparation_instructions" jsonb,
  	"version_dosage" jsonb,
  	"version_tradition" "enum__formulas_v_version_tradition",
  	"version_category" varchar,
  	"version_historical_text" varchar,
  	"version_modern_adaptations" jsonb,
  	"version_contraindications" jsonb,
  	"version_side_effects" jsonb,
  	"version_status" "enum__formulas_v_version_status" DEFAULT 'draft',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__formulas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_formulas_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "conditions_symptoms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"symptom" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "conditions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"severity" "enum_conditions_severity",
  	"category" "enum_conditions_category",
  	"tcm_pattern" varchar,
  	"western_diagnosis" varchar,
  	"prevalence" varchar,
  	"conventional_treatments" jsonb,
  	"complementary_approaches" jsonb,
  	"prevention_tips" jsonb,
  	"lifestyle_recommendations" jsonb,
  	"dietary_advice" jsonb,
  	"when_to_seek_help" jsonb,
  	"status" "enum_conditions_status" DEFAULT 'draft',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_conditions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "conditions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"symptoms_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_conditions_v_version_symptoms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"symptom" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_conditions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_severity" "enum__conditions_v_version_severity",
  	"version_category" "enum__conditions_v_version_category",
  	"version_tcm_pattern" varchar,
  	"version_western_diagnosis" varchar,
  	"version_prevalence" varchar,
  	"version_conventional_treatments" jsonb,
  	"version_complementary_approaches" jsonb,
  	"version_prevention_tips" jsonb,
  	"version_lifestyle_recommendations" jsonb,
  	"version_dietary_advice" jsonb,
  	"version_when_to_seek_help" jsonb,
  	"version_status" "enum__conditions_v_version_status" DEFAULT 'draft',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__conditions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_conditions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"symptoms_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "symptoms_severity" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_symptoms_severity",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "symptoms_duration" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_symptoms_duration",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "symptoms_common_causes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cause" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "symptoms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"category" "enum_symptoms_category",
  	"tcm_interpretation" jsonb,
  	"western_interpretation" jsonb,
  	"red_flags" jsonb,
  	"status" "enum_symptoms_status" DEFAULT 'draft',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_symptoms_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "symptoms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_symptoms_v_version_severity" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__symptoms_v_version_severity",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_symptoms_v_version_duration" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__symptoms_v_version_duration",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_symptoms_v_version_common_causes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cause" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_symptoms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_category" "enum__symptoms_v_version_category",
  	"version_tcm_interpretation" jsonb,
  	"version_western_interpretation" jsonb,
  	"version_red_flags" jsonb,
  	"version_status" "enum__symptoms_v_version_status" DEFAULT 'draft',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__symptoms_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_symptoms_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "modalities_treatment_modalities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"approach" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "modalities_excels_at" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"condition" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "modalities_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"benefit" varchar,
  	"description" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "modalities_certification_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"organization" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "modalities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"short_description" varchar,
  	"history" jsonb,
  	"principles" jsonb,
  	"diagnostic_methods" jsonb,
  	"training_requirements" jsonb,
  	"research_evidence" jsonb,
  	"safety_considerations" jsonb,
  	"typical_session" jsonb,
  	"cost_range" varchar,
  	"status" "enum_modalities_status" DEFAULT 'draft',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_modalities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "modalities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v_version_treatment_modalities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"approach" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v_version_excels_at" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"condition" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"benefit" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v_version_certification_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_short_description" varchar,
  	"version_history" jsonb,
  	"version_principles" jsonb,
  	"version_diagnostic_methods" jsonb,
  	"version_training_requirements" jsonb,
  	"version_research_evidence" jsonb,
  	"version_safety_considerations" jsonb,
  	"version_typical_session" jsonb,
  	"version_cost_range" varchar,
  	"version_status" "enum__modalities_v_version_status" DEFAULT 'draft',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__modalities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_modalities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"credential" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"specialty" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners_languages_spoken" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners_insurance_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"website" varchar,
  	"profile_image_id" integer,
  	"bio" jsonb,
  	"years_experience" numeric,
  	"practice_type" "enum_practitioners_practice_type",
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_zip_code" varchar,
  	"address_country" varchar DEFAULT 'United States',
  	"address_latitude" numeric,
  	"address_longitude" numeric,
  	"service_area" varchar,
  	"accepts_insurance" boolean,
  	"offers_virtual_consults" boolean,
  	"booking_url" varchar,
  	"pricing_initial_consult" numeric,
  	"pricing_follow_up" numeric,
  	"pricing_currency" "enum_practitioners_pricing_currency" DEFAULT 'USD',
  	"pricing_notes" varchar,
  	"availability" jsonb,
  	"treatment_approach" jsonb,
  	"verification_status" "enum_practitioners_verification_status" DEFAULT 'pending',
  	"verified_date" timestamp(3) with time zone,
  	"featured" boolean,
  	"average_rating" numeric,
  	"review_count" numeric,
  	"status" "enum_practitioners_status" DEFAULT 'active',
  	"user_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_practitioners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "practitioners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"modalities_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v_version_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"credential" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v_version_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"specialty" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v_version_languages_spoken" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v_version_insurance_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"provider" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_website" varchar,
  	"version_profile_image_id" integer,
  	"version_bio" jsonb,
  	"version_years_experience" numeric,
  	"version_practice_type" "enum__practitioners_v_version_practice_type",
  	"version_address_street" varchar,
  	"version_address_city" varchar,
  	"version_address_state" varchar,
  	"version_address_zip_code" varchar,
  	"version_address_country" varchar DEFAULT 'United States',
  	"version_address_latitude" numeric,
  	"version_address_longitude" numeric,
  	"version_service_area" varchar,
  	"version_accepts_insurance" boolean,
  	"version_offers_virtual_consults" boolean,
  	"version_booking_url" varchar,
  	"version_pricing_initial_consult" numeric,
  	"version_pricing_follow_up" numeric,
  	"version_pricing_currency" "enum__practitioners_v_version_pricing_currency" DEFAULT 'USD',
  	"version_pricing_notes" varchar,
  	"version_availability" jsonb,
  	"version_treatment_approach" jsonb,
  	"version_verification_status" "enum__practitioners_v_version_verification_status" DEFAULT 'pending',
  	"version_verified_date" timestamp(3) with time zone,
  	"version_featured" boolean,
  	"version_average_rating" numeric,
  	"version_review_count" numeric,
  	"version_status" "enum__practitioners_v_version_status" DEFAULT 'active',
  	"version_user_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__practitioners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_practitioners_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"modalities_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rating" numeric,
  	"title" varchar,
  	"comment" jsonb,
  	"reviewed_entity_type" "enum_reviews_reviewed_entity_type",
  	"reviewed_entity_id" varchar,
  	"helpful" numeric DEFAULT 0,
  	"verified" boolean DEFAULT false,
  	"author_id" integer,
  	"author_name" varchar,
  	"moderation_status" "enum_reviews_moderation_status" DEFAULT 'pending',
  	"moderator_notes" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reviews_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_reviews_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_rating" numeric,
  	"version_title" varchar,
  	"version_comment" jsonb,
  	"version_reviewed_entity_type" "enum__reviews_v_version_reviewed_entity_type",
  	"version_reviewed_entity_id" varchar,
  	"version_helpful" numeric DEFAULT 0,
  	"version_verified" boolean DEFAULT false,
  	"version_author_id" integer,
  	"version_author_name" varchar,
  	"version_moderation_status" "enum__reviews_v_version_moderation_status" DEFAULT 'pending',
  	"version_moderator_notes" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reviews_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "grok_insights_recommendations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_grok_insights_recommendations_type",
  	"entity_id" varchar,
  	"reasoning" varchar,
  	"confidence" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "grok_insights_follow_up_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "grok_insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"input" jsonb,
  	"analysis" jsonb,
  	"disclaimers" jsonb,
  	"session_id" varchar,
  	"user_id" integer,
  	"grok_model" varchar DEFAULT 'grok-beta',
  	"tokens_used" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "grok_insights_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"license" "enum_media_license",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "media_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
  	"profile_image_id" integer,
  	"preferences_language" "enum_users_preferences_language" DEFAULT 'en',
  	"preferences_theme" "enum_users_preferences_theme" DEFAULT 'system',
  	"preferences_newsletter" boolean DEFAULT false,
  	"last_login" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"practitioners_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" varchar,
  	"user_email" varchar,
  	"user_role" varchar,
  	"session_id" varchar,
  	"action" "enum_audit_logs_action" NOT NULL,
  	"resource" varchar,
  	"resource_id" varchar,
  	"resource_type" varchar,
  	"details" jsonb,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"location" varchar,
  	"method" "enum_audit_logs_method",
  	"endpoint" varchar,
  	"status_code" numeric,
  	"severity" "enum_audit_logs_severity" DEFAULT 'INFO' NOT NULL,
  	"success" boolean DEFAULT true NOT NULL,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "import_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_import_logs_type" NOT NULL,
  	"results" jsonb NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "validation_reports_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"herb_id" varchar,
  	"herb_name" varchar,
  	"field" varchar,
  	"issue" varchar NOT NULL,
  	"severity" "enum_validation_reports_issues_severity" DEFAULT 'warning' NOT NULL,
  	"resolved" boolean DEFAULT false,
  	"resolved_by_id" integer,
  	"resolved_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "validation_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_validation_reports_type" NOT NULL,
  	"error_count" numeric DEFAULT 0 NOT NULL,
  	"warning_count" numeric DEFAULT 0 NOT NULL,
  	"total_checked" numeric NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"conditions_id" integer,
  	"symptoms_id" integer,
  	"modalities_id" integer,
  	"practitioners_id" integer,
  	"reviews_id" integer,
  	"grok_insights_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"audit_logs_id" integer,
  	"import_logs_id" integer,
  	"validation_reports_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "trefle_import_state" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_page" numeric DEFAULT 1 NOT NULL,
  	"is_complete" boolean DEFAULT false,
  	"last_run_at" timestamp(3) with time zone,
  	"last_completed_at" timestamp(3) with time zone,
  	"total_plants_imported" numeric DEFAULT 0,
  	"total_herbs_created" numeric DEFAULT 0,
  	"total_herbs_updated" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "perenual_import_state" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_page" numeric DEFAULT 1 NOT NULL,
  	"is_complete" boolean DEFAULT false,
  	"last_run_at" timestamp(3) with time zone,
  	"last_completed_at" timestamp(3) with time zone,
  	"total_plants_imported" numeric DEFAULT 0,
  	"total_herbs_created" numeric DEFAULT 0,
  	"total_herbs_updated" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
   ALTER TABLE "herbs_botanical_info_common_names" ADD CONSTRAINT "herbs_botanical_info_common_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_botanical_info_synonyms" ADD CONSTRAINT "herbs_botanical_info_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_botanical_info_native_region" ADD CONSTRAINT "herbs_botanical_info_native_region_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_botanical_info_parts_used" ADD CONSTRAINT "herbs_botanical_info_parts_used_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_tcm_properties_tcm_taste" ADD CONSTRAINT "herbs_tcm_properties_tcm_taste_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_tcm_properties_tcm_meridians" ADD CONSTRAINT "herbs_tcm_properties_tcm_meridians_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_western_properties" ADD CONSTRAINT "herbs_western_properties_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_active_constituents" ADD CONSTRAINT "herbs_active_constituents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_clinical_studies" ADD CONSTRAINT "herbs_clinical_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_dosage_forms" ADD CONSTRAINT "herbs_dosage_forms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_recommended_dosage" ADD CONSTRAINT "herbs_recommended_dosage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_preparation_methods" ADD CONSTRAINT "herbs_preparation_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "drug_int" ADD CONSTRAINT "drug_int_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_images" ADD CONSTRAINT "herbs_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_images" ADD CONSTRAINT "herbs_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_videos" ADD CONSTRAINT "herbs_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_search_tags" ADD CONSTRAINT "herbs_search_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs" ADD CONSTRAINT "herbs_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs" ADD CONSTRAINT "herbs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_botanical_info_common_names" ADD CONSTRAINT "_herbs_v_version_botanical_info_common_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_botanical_info_synonyms" ADD CONSTRAINT "_herbs_v_version_botanical_info_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_botanical_info_native_region" ADD CONSTRAINT "_herbs_v_version_botanical_info_native_region_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_botanical_info_parts_used" ADD CONSTRAINT "_herbs_v_version_botanical_info_parts_used_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_tcm_properties_tcm_taste" ADD CONSTRAINT "_herbs_v_version_tcm_properties_tcm_taste_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_tcm_properties_tcm_meridians" ADD CONSTRAINT "_herbs_v_version_tcm_properties_tcm_meridians_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_western_properties" ADD CONSTRAINT "_herbs_v_version_western_properties_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_active_constituents" ADD CONSTRAINT "_herbs_v_version_active_constituents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_clinical_studies" ADD CONSTRAINT "_herbs_v_version_clinical_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_dosage_forms" ADD CONSTRAINT "_herbs_v_version_dosage_forms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_recommended_dosage" ADD CONSTRAINT "_herbs_v_version_recommended_dosage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_preparation_methods" ADD CONSTRAINT "_herbs_v_version_preparation_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_drug_int_v" ADD CONSTRAINT "_drug_int_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_images" ADD CONSTRAINT "_herbs_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_images" ADD CONSTRAINT "_herbs_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_videos" ADD CONSTRAINT "_herbs_v_version_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_version_search_tags" ADD CONSTRAINT "_herbs_v_version_search_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v" ADD CONSTRAINT "_herbs_v_parent_id_herbs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v" ADD CONSTRAINT "_herbs_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v" ADD CONSTRAINT "_herbs_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas_ingredients" ADD CONSTRAINT "formulas_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas_ingredients" ADD CONSTRAINT "formulas_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas_use_cases" ADD CONSTRAINT "formulas_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas" ADD CONSTRAINT "formulas_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas" ADD CONSTRAINT "formulas_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas_rels" ADD CONSTRAINT "formulas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "formulas_rels" ADD CONSTRAINT "formulas_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v_version_ingredients" ADD CONSTRAINT "_formulas_v_version_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v_version_ingredients" ADD CONSTRAINT "_formulas_v_version_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v_version_use_cases" ADD CONSTRAINT "_formulas_v_version_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v" ADD CONSTRAINT "_formulas_v_parent_id_formulas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formulas"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v" ADD CONSTRAINT "_formulas_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v" ADD CONSTRAINT "_formulas_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v_rels" ADD CONSTRAINT "_formulas_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_formulas_v_rels" ADD CONSTRAINT "_formulas_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions_symptoms" ADD CONSTRAINT "conditions_symptoms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions" ADD CONSTRAINT "conditions_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions" ADD CONSTRAINT "conditions_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v_version_symptoms" ADD CONSTRAINT "_conditions_v_version_symptoms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_conditions_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v" ADD CONSTRAINT "_conditions_v_parent_id_conditions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."conditions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v" ADD CONSTRAINT "_conditions_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v" ADD CONSTRAINT "_conditions_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_conditions_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_severity" ADD CONSTRAINT "symptoms_severity_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_duration" ADD CONSTRAINT "symptoms_duration_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_common_causes" ADD CONSTRAINT "symptoms_common_causes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_version_severity" ADD CONSTRAINT "_symptoms_v_version_severity_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_version_duration" ADD CONSTRAINT "_symptoms_v_version_duration_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_version_common_causes" ADD CONSTRAINT "_symptoms_v_version_common_causes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v" ADD CONSTRAINT "_symptoms_v_parent_id_symptoms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v" ADD CONSTRAINT "_symptoms_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_treatment_modalities" ADD CONSTRAINT "modalities_treatment_modalities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_excels_at" ADD CONSTRAINT "modalities_excels_at_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_benefits" ADD CONSTRAINT "modalities_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_certification_bodies" ADD CONSTRAINT "modalities_certification_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities" ADD CONSTRAINT "modalities_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities" ADD CONSTRAINT "modalities_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_version_treatment_modalities" ADD CONSTRAINT "_modalities_v_version_treatment_modalities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_version_excels_at" ADD CONSTRAINT "_modalities_v_version_excels_at_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_version_benefits" ADD CONSTRAINT "_modalities_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_version_certification_bodies" ADD CONSTRAINT "_modalities_v_version_certification_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v" ADD CONSTRAINT "_modalities_v_parent_id_modalities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modalities"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v" ADD CONSTRAINT "_modalities_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v" ADD CONSTRAINT "_modalities_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_credentials" ADD CONSTRAINT "practitioners_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_specialties" ADD CONSTRAINT "practitioners_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_languages_spoken" ADD CONSTRAINT "practitioners_languages_spoken_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_insurance_providers" ADD CONSTRAINT "practitioners_insurance_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_version_credentials" ADD CONSTRAINT "_practitioners_v_version_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_practitioners_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_version_specialties" ADD CONSTRAINT "_practitioners_v_version_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_practitioners_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_version_languages_spoken" ADD CONSTRAINT "_practitioners_v_version_languages_spoken_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_practitioners_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_version_insurance_providers" ADD CONSTRAINT "_practitioners_v_version_insurance_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_practitioners_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v" ADD CONSTRAINT "_practitioners_v_parent_id_practitioners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."practitioners"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v" ADD CONSTRAINT "_practitioners_v_version_profile_image_id_media_id_fk" FOREIGN KEY ("version_profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v" ADD CONSTRAINT "_practitioners_v_version_user_id_users_id_fk" FOREIGN KEY ("version_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v" ADD CONSTRAINT "_practitioners_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_rels" ADD CONSTRAINT "_practitioners_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_practitioners_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_rels" ADD CONSTRAINT "_practitioners_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_practitioners_v_rels" ADD CONSTRAINT "_practitioners_v_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "reviews" ADD CONSTRAINT "reviews_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights_recommendations" ADD CONSTRAINT "grok_insights_recommendations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights_follow_up_questions" ADD CONSTRAINT "grok_insights_follow_up_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights" ADD CONSTRAINT "grok_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "media_texts" ADD CONSTRAINT "media_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_practitioners_fk" FOREIGN KEY ("practitioners_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "validation_reports_issues" ADD CONSTRAINT "validation_reports_issues_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "validation_reports_issues" ADD CONSTRAINT "validation_reports_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."validation_reports"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_practitioners_fk" FOREIGN KEY ("practitioners_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_grok_insights_fk" FOREIGN KEY ("grok_insights_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_logs_fk" FOREIGN KEY ("import_logs_id") REFERENCES "public"."import_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_validation_reports_fk" FOREIGN KEY ("validation_reports_id") REFERENCES "public"."validation_reports"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_common_names_order_idx" ON "herbs_botanical_info_common_names" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_common_names_parent_id_idx" ON "herbs_botanical_info_common_names" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_synonyms_order_idx" ON "herbs_botanical_info_synonyms" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_synonyms_parent_id_idx" ON "herbs_botanical_info_synonyms" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_native_region_order_idx" ON "herbs_botanical_info_native_region" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_native_region_parent_id_idx" ON "herbs_botanical_info_native_region" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_parts_used_order_idx" ON "herbs_botanical_info_parts_used" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_parts_used_parent_idx" ON "herbs_botanical_info_parts_used" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_tcm_properties_tcm_taste_order_idx" ON "herbs_tcm_properties_tcm_taste" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_tcm_properties_tcm_taste_parent_idx" ON "herbs_tcm_properties_tcm_taste" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_tcm_properties_tcm_meridians_order_idx" ON "herbs_tcm_properties_tcm_meridians" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_tcm_properties_tcm_meridians_parent_idx" ON "herbs_tcm_properties_tcm_meridians" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_western_properties_order_idx" ON "herbs_western_properties" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_western_properties_parent_idx" ON "herbs_western_properties" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_active_constituents_order_idx" ON "herbs_active_constituents" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_active_constituents_parent_id_idx" ON "herbs_active_constituents" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_clinical_studies_order_idx" ON "herbs_clinical_studies" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_clinical_studies_parent_id_idx" ON "herbs_clinical_studies" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_dosage_forms_order_idx" ON "herbs_dosage_forms" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_dosage_forms_parent_idx" ON "herbs_dosage_forms" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_recommended_dosage_order_idx" ON "herbs_recommended_dosage" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_recommended_dosage_parent_id_idx" ON "herbs_recommended_dosage" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_preparation_methods_order_idx" ON "herbs_preparation_methods" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_preparation_methods_parent_id_idx" ON "herbs_preparation_methods" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "drug_int_order_idx" ON "drug_int" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "drug_int_parent_id_idx" ON "drug_int" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_images_order_idx" ON "herbs_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_images_parent_id_idx" ON "herbs_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_images_image_idx" ON "herbs_images" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "herbs_videos_order_idx" ON "herbs_videos" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_videos_parent_id_idx" ON "herbs_videos" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_search_tags_order_idx" ON "herbs_search_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "herbs_search_tags_parent_id_idx" ON "herbs_search_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "herbs_slug_idx" ON "herbs" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "herbs_featured_image_idx" ON "herbs" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "herbs_botanical_info_botanical_info_scientific_name_idx" ON "herbs" USING btree ("botanical_info_scientific_name");
  CREATE UNIQUE INDEX IF NOT EXISTS "herbs_herb_id_idx" ON "herbs" USING btree ("herb_id");
  CREATE INDEX IF NOT EXISTS "herbs_meta_meta_image_idx" ON "herbs" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "herbs_updated_at_idx" ON "herbs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "herbs_created_at_idx" ON "herbs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "herbs__status_idx" ON "herbs" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "herbs_rels_order_idx" ON "herbs_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "herbs_rels_parent_idx" ON "herbs_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "herbs_rels_path_idx" ON "herbs_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "herbs_rels_media_id_idx" ON "herbs_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "herbs_rels_herbs_id_idx" ON "herbs_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "herbs_rels_conditions_id_idx" ON "herbs_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_common_names_order_idx" ON "_herbs_v_version_botanical_info_common_names" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_common_names_parent_id_idx" ON "_herbs_v_version_botanical_info_common_names" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_synonyms_order_idx" ON "_herbs_v_version_botanical_info_synonyms" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_synonyms_parent_id_idx" ON "_herbs_v_version_botanical_info_synonyms" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_native_region_order_idx" ON "_herbs_v_version_botanical_info_native_region" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_native_region_parent_id_idx" ON "_herbs_v_version_botanical_info_native_region" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_parts_used_order_idx" ON "_herbs_v_version_botanical_info_parts_used" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_parts_used_parent_idx" ON "_herbs_v_version_botanical_info_parts_used" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_taste_order_idx" ON "_herbs_v_version_tcm_properties_tcm_taste" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_taste_parent_idx" ON "_herbs_v_version_tcm_properties_tcm_taste" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_meridians_order_idx" ON "_herbs_v_version_tcm_properties_tcm_meridians" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_tcm_properties_tcm_meridians_parent_idx" ON "_herbs_v_version_tcm_properties_tcm_meridians" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_western_properties_order_idx" ON "_herbs_v_version_western_properties" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_western_properties_parent_idx" ON "_herbs_v_version_western_properties" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_active_constituents_order_idx" ON "_herbs_v_version_active_constituents" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_active_constituents_parent_id_idx" ON "_herbs_v_version_active_constituents" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_clinical_studies_order_idx" ON "_herbs_v_version_clinical_studies" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_clinical_studies_parent_id_idx" ON "_herbs_v_version_clinical_studies" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_dosage_forms_order_idx" ON "_herbs_v_version_dosage_forms" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_dosage_forms_parent_idx" ON "_herbs_v_version_dosage_forms" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_recommended_dosage_order_idx" ON "_herbs_v_version_recommended_dosage" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_recommended_dosage_parent_id_idx" ON "_herbs_v_version_recommended_dosage" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_preparation_methods_order_idx" ON "_herbs_v_version_preparation_methods" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_preparation_methods_parent_id_idx" ON "_herbs_v_version_preparation_methods" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_drug_int_v_order_idx" ON "_drug_int_v" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_drug_int_v_parent_id_idx" ON "_drug_int_v" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_images_order_idx" ON "_herbs_v_version_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_images_parent_id_idx" ON "_herbs_v_version_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_images_image_idx" ON "_herbs_v_version_images" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_videos_order_idx" ON "_herbs_v_version_videos" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_videos_parent_id_idx" ON "_herbs_v_version_videos" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_search_tags_order_idx" ON "_herbs_v_version_search_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_search_tags_parent_id_idx" ON "_herbs_v_version_search_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_parent_idx" ON "_herbs_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version_slug_idx" ON "_herbs_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version_featured_image_idx" ON "_herbs_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_botanical_info_version_botanical_info_s_idx" ON "_herbs_v" USING btree ("version_botanical_info_scientific_name");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version_herb_id_idx" ON "_herbs_v" USING btree ("version_herb_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_meta_version_meta_image_idx" ON "_herbs_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version_updated_at_idx" ON "_herbs_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version_created_at_idx" ON "_herbs_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_herbs_v_version_version__status_idx" ON "_herbs_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_herbs_v_created_at_idx" ON "_herbs_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_herbs_v_updated_at_idx" ON "_herbs_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_herbs_v_latest_idx" ON "_herbs_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_order_idx" ON "_herbs_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_parent_idx" ON "_herbs_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_path_idx" ON "_herbs_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_media_id_idx" ON "_herbs_v_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_herbs_id_idx" ON "_herbs_v_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "_herbs_v_rels_conditions_id_idx" ON "_herbs_v_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "formulas_ingredients_order_idx" ON "formulas_ingredients" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "formulas_ingredients_parent_id_idx" ON "formulas_ingredients" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "formulas_ingredients_herb_idx" ON "formulas_ingredients" USING btree ("herb_id");
  CREATE INDEX IF NOT EXISTS "formulas_use_cases_order_idx" ON "formulas_use_cases" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "formulas_use_cases_parent_id_idx" ON "formulas_use_cases" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "formulas_slug_idx" ON "formulas" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "formulas_featured_image_idx" ON "formulas" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "formulas_meta_meta_image_idx" ON "formulas" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "formulas_updated_at_idx" ON "formulas" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "formulas_created_at_idx" ON "formulas" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "formulas__status_idx" ON "formulas" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "formulas_rels_order_idx" ON "formulas_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "formulas_rels_parent_idx" ON "formulas_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "formulas_rels_path_idx" ON "formulas_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "formulas_rels_conditions_id_idx" ON "formulas_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_ingredients_order_idx" ON "_formulas_v_version_ingredients" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_ingredients_parent_id_idx" ON "_formulas_v_version_ingredients" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_ingredients_herb_idx" ON "_formulas_v_version_ingredients" USING btree ("herb_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_use_cases_order_idx" ON "_formulas_v_version_use_cases" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_use_cases_parent_id_idx" ON "_formulas_v_version_use_cases" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_parent_idx" ON "_formulas_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_version_slug_idx" ON "_formulas_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_version_featured_image_idx" ON "_formulas_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_meta_version_meta_image_idx" ON "_formulas_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_version_updated_at_idx" ON "_formulas_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_version_created_at_idx" ON "_formulas_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_formulas_v_version_version__status_idx" ON "_formulas_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_formulas_v_created_at_idx" ON "_formulas_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_formulas_v_updated_at_idx" ON "_formulas_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_formulas_v_latest_idx" ON "_formulas_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_formulas_v_rels_order_idx" ON "_formulas_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_formulas_v_rels_parent_idx" ON "_formulas_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_formulas_v_rels_path_idx" ON "_formulas_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_formulas_v_rels_conditions_id_idx" ON "_formulas_v_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "conditions_symptoms_order_idx" ON "conditions_symptoms" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "conditions_symptoms_parent_id_idx" ON "conditions_symptoms" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "conditions_slug_idx" ON "conditions" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "conditions_featured_image_idx" ON "conditions" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "conditions_meta_meta_image_idx" ON "conditions" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "conditions_updated_at_idx" ON "conditions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "conditions_created_at_idx" ON "conditions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "conditions__status_idx" ON "conditions" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "conditions_rels_order_idx" ON "conditions_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "conditions_rels_parent_idx" ON "conditions_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "conditions_rels_path_idx" ON "conditions_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "conditions_rels_herbs_id_idx" ON "conditions_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "conditions_rels_formulas_id_idx" ON "conditions_rels" USING btree ("formulas_id");
  CREATE INDEX IF NOT EXISTS "conditions_rels_symptoms_id_idx" ON "conditions_rels" USING btree ("symptoms_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_symptoms_order_idx" ON "_conditions_v_version_symptoms" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_symptoms_parent_id_idx" ON "_conditions_v_version_symptoms" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_parent_idx" ON "_conditions_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_version_slug_idx" ON "_conditions_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_version_featured_image_idx" ON "_conditions_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_meta_version_meta_image_idx" ON "_conditions_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_version_updated_at_idx" ON "_conditions_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_version_created_at_idx" ON "_conditions_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_conditions_v_version_version__status_idx" ON "_conditions_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_conditions_v_created_at_idx" ON "_conditions_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_conditions_v_updated_at_idx" ON "_conditions_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_conditions_v_latest_idx" ON "_conditions_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_order_idx" ON "_conditions_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_parent_idx" ON "_conditions_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_path_idx" ON "_conditions_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_herbs_id_idx" ON "_conditions_v_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_formulas_id_idx" ON "_conditions_v_rels" USING btree ("formulas_id");
  CREATE INDEX IF NOT EXISTS "_conditions_v_rels_symptoms_id_idx" ON "_conditions_v_rels" USING btree ("symptoms_id");
  CREATE INDEX IF NOT EXISTS "symptoms_severity_order_idx" ON "symptoms_severity" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "symptoms_severity_parent_idx" ON "symptoms_severity" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "symptoms_duration_order_idx" ON "symptoms_duration" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "symptoms_duration_parent_idx" ON "symptoms_duration" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "symptoms_common_causes_order_idx" ON "symptoms_common_causes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "symptoms_common_causes_parent_id_idx" ON "symptoms_common_causes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "symptoms_slug_idx" ON "symptoms" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "symptoms_meta_meta_image_idx" ON "symptoms" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "symptoms_updated_at_idx" ON "symptoms" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "symptoms_created_at_idx" ON "symptoms" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "symptoms__status_idx" ON "symptoms" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "symptoms_rels_order_idx" ON "symptoms_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "symptoms_rels_parent_idx" ON "symptoms_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "symptoms_rels_path_idx" ON "symptoms_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "symptoms_rels_conditions_id_idx" ON "symptoms_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "symptoms_rels_herbs_id_idx" ON "symptoms_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_severity_order_idx" ON "_symptoms_v_version_severity" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_severity_parent_idx" ON "_symptoms_v_version_severity" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_duration_order_idx" ON "_symptoms_v_version_duration" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_duration_parent_idx" ON "_symptoms_v_version_duration" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_common_causes_order_idx" ON "_symptoms_v_version_common_causes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_common_causes_parent_id_idx" ON "_symptoms_v_version_common_causes" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_parent_idx" ON "_symptoms_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_version_slug_idx" ON "_symptoms_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_meta_version_meta_image_idx" ON "_symptoms_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_version_updated_at_idx" ON "_symptoms_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_version_created_at_idx" ON "_symptoms_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_version_version__status_idx" ON "_symptoms_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_created_at_idx" ON "_symptoms_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_updated_at_idx" ON "_symptoms_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_latest_idx" ON "_symptoms_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_rels_order_idx" ON "_symptoms_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_rels_parent_idx" ON "_symptoms_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_rels_path_idx" ON "_symptoms_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_rels_conditions_id_idx" ON "_symptoms_v_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "_symptoms_v_rels_herbs_id_idx" ON "_symptoms_v_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "modalities_treatment_modalities_order_idx" ON "modalities_treatment_modalities" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "modalities_treatment_modalities_parent_id_idx" ON "modalities_treatment_modalities" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "modalities_excels_at_order_idx" ON "modalities_excels_at" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "modalities_excels_at_parent_id_idx" ON "modalities_excels_at" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "modalities_benefits_order_idx" ON "modalities_benefits" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "modalities_benefits_parent_id_idx" ON "modalities_benefits" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "modalities_certification_bodies_order_idx" ON "modalities_certification_bodies" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "modalities_certification_bodies_parent_id_idx" ON "modalities_certification_bodies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "modalities_slug_idx" ON "modalities" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "modalities_featured_image_idx" ON "modalities" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "modalities_meta_meta_image_idx" ON "modalities" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "modalities_updated_at_idx" ON "modalities" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "modalities_created_at_idx" ON "modalities" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "modalities__status_idx" ON "modalities" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "modalities_rels_order_idx" ON "modalities_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "modalities_rels_parent_idx" ON "modalities_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "modalities_rels_path_idx" ON "modalities_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "modalities_rels_conditions_id_idx" ON "modalities_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "modalities_rels_herbs_id_idx" ON "modalities_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_treatment_modalities_order_idx" ON "_modalities_v_version_treatment_modalities" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_treatment_modalities_parent_id_idx" ON "_modalities_v_version_treatment_modalities" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_excels_at_order_idx" ON "_modalities_v_version_excels_at" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_excels_at_parent_id_idx" ON "_modalities_v_version_excels_at" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_benefits_order_idx" ON "_modalities_v_version_benefits" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_benefits_parent_id_idx" ON "_modalities_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_certification_bodies_order_idx" ON "_modalities_v_version_certification_bodies" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_certification_bodies_parent_id_idx" ON "_modalities_v_version_certification_bodies" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_parent_idx" ON "_modalities_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_version_slug_idx" ON "_modalities_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_version_featured_image_idx" ON "_modalities_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_meta_version_meta_image_idx" ON "_modalities_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_version_updated_at_idx" ON "_modalities_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_version_created_at_idx" ON "_modalities_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_modalities_v_version_version__status_idx" ON "_modalities_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_modalities_v_created_at_idx" ON "_modalities_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_modalities_v_updated_at_idx" ON "_modalities_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_modalities_v_latest_idx" ON "_modalities_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_modalities_v_rels_order_idx" ON "_modalities_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_modalities_v_rels_parent_idx" ON "_modalities_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_rels_path_idx" ON "_modalities_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_modalities_v_rels_conditions_id_idx" ON "_modalities_v_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "_modalities_v_rels_herbs_id_idx" ON "_modalities_v_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "practitioners_credentials_order_idx" ON "practitioners_credentials" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "practitioners_credentials_parent_id_idx" ON "practitioners_credentials" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "practitioners_specialties_order_idx" ON "practitioners_specialties" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "practitioners_specialties_parent_id_idx" ON "practitioners_specialties" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "practitioners_languages_spoken_order_idx" ON "practitioners_languages_spoken" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "practitioners_languages_spoken_parent_id_idx" ON "practitioners_languages_spoken" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "practitioners_insurance_providers_order_idx" ON "practitioners_insurance_providers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "practitioners_insurance_providers_parent_id_idx" ON "practitioners_insurance_providers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "practitioners_slug_idx" ON "practitioners" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "practitioners_email_idx" ON "practitioners" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "practitioners_profile_image_idx" ON "practitioners" USING btree ("profile_image_id");
  CREATE INDEX IF NOT EXISTS "practitioners_user_idx" ON "practitioners" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "practitioners_meta_meta_image_idx" ON "practitioners" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "practitioners_updated_at_idx" ON "practitioners" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "practitioners_created_at_idx" ON "practitioners" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "practitioners__status_idx" ON "practitioners" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "practitioners_rels_order_idx" ON "practitioners_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "practitioners_rels_parent_idx" ON "practitioners_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "practitioners_rels_path_idx" ON "practitioners_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "practitioners_rels_media_id_idx" ON "practitioners_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "practitioners_rels_modalities_id_idx" ON "practitioners_rels" USING btree ("modalities_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_credentials_order_idx" ON "_practitioners_v_version_credentials" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_credentials_parent_id_idx" ON "_practitioners_v_version_credentials" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_specialties_order_idx" ON "_practitioners_v_version_specialties" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_specialties_parent_id_idx" ON "_practitioners_v_version_specialties" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_languages_spoken_order_idx" ON "_practitioners_v_version_languages_spoken" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_languages_spoken_parent_id_idx" ON "_practitioners_v_version_languages_spoken" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_insurance_providers_order_idx" ON "_practitioners_v_version_insurance_providers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_insurance_providers_parent_id_idx" ON "_practitioners_v_version_insurance_providers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_parent_idx" ON "_practitioners_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_slug_idx" ON "_practitioners_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_email_idx" ON "_practitioners_v" USING btree ("version_email");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_profile_image_idx" ON "_practitioners_v" USING btree ("version_profile_image_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_user_idx" ON "_practitioners_v" USING btree ("version_user_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_meta_version_meta_image_idx" ON "_practitioners_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_updated_at_idx" ON "_practitioners_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version_created_at_idx" ON "_practitioners_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_version_version__status_idx" ON "_practitioners_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_created_at_idx" ON "_practitioners_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_updated_at_idx" ON "_practitioners_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_latest_idx" ON "_practitioners_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_rels_order_idx" ON "_practitioners_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_rels_parent_idx" ON "_practitioners_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_rels_path_idx" ON "_practitioners_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_rels_media_id_idx" ON "_practitioners_v_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_practitioners_v_rels_modalities_id_idx" ON "_practitioners_v_rels" USING btree ("modalities_id");
  CREATE INDEX IF NOT EXISTS "reviews_author_idx" ON "reviews" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "reviews_meta_meta_image_idx" ON "reviews" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "reviews__status_idx" ON "reviews" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_reviews_v_parent_idx" ON "_reviews_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_reviews_v_version_version_author_idx" ON "_reviews_v" USING btree ("version_author_id");
  CREATE INDEX IF NOT EXISTS "_reviews_v_version_meta_version_meta_image_idx" ON "_reviews_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_reviews_v_version_version_updated_at_idx" ON "_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_reviews_v_version_version_created_at_idx" ON "_reviews_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_reviews_v_version_version__status_idx" ON "_reviews_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_reviews_v_created_at_idx" ON "_reviews_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_reviews_v_updated_at_idx" ON "_reviews_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_reviews_v_latest_idx" ON "_reviews_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "grok_insights_recommendations_order_idx" ON "grok_insights_recommendations" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "grok_insights_recommendations_parent_id_idx" ON "grok_insights_recommendations" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "grok_insights_follow_up_questions_order_idx" ON "grok_insights_follow_up_questions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "grok_insights_follow_up_questions_parent_id_idx" ON "grok_insights_follow_up_questions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "grok_insights_slug_idx" ON "grok_insights" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "grok_insights_user_idx" ON "grok_insights" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "grok_insights_updated_at_idx" ON "grok_insights" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "grok_insights_created_at_idx" ON "grok_insights" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "grok_insights_rels_order_idx" ON "grok_insights_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "grok_insights_rels_parent_idx" ON "grok_insights_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "grok_insights_rels_path_idx" ON "grok_insights_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "grok_insights_rels_herbs_id_idx" ON "grok_insights_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "grok_insights_rels_conditions_id_idx" ON "grok_insights_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX IF NOT EXISTS "media_texts_order_parent_idx" ON "media_texts" USING btree ("order","parent_id");
  CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "users_profile_image_idx" ON "users" USING btree ("profile_image_id");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "users_rels_herbs_id_idx" ON "users_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "users_rels_formulas_id_idx" ON "users_rels" USING btree ("formulas_id");
  CREATE INDEX IF NOT EXISTS "users_rels_practitioners_id_idx" ON "users_rels" USING btree ("practitioners_id");
  CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "audit_logs_user_email_idx" ON "audit_logs" USING btree ("user_email");
  CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX IF NOT EXISTS "audit_logs_resource_id_idx" ON "audit_logs" USING btree ("resource_id");
  CREATE INDEX IF NOT EXISTS "audit_logs_ip_address_idx" ON "audit_logs" USING btree ("ip_address");
  CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");
  CREATE INDEX IF NOT EXISTS "audit_logs_success_idx" ON "audit_logs" USING btree ("success");
  CREATE INDEX IF NOT EXISTS "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "import_logs_updated_at_idx" ON "import_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "import_logs_created_at_idx" ON "import_logs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "validation_reports_issues_order_idx" ON "validation_reports_issues" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "validation_reports_issues_parent_id_idx" ON "validation_reports_issues" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "validation_reports_issues_resolved_by_idx" ON "validation_reports_issues" USING btree ("resolved_by_id");
  CREATE INDEX IF NOT EXISTS "validation_reports_updated_at_idx" ON "validation_reports" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "validation_reports_created_at_idx" ON "validation_reports" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_herbs_id_idx" ON "payload_locked_documents_rels" USING btree ("herbs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_formulas_id_idx" ON "payload_locked_documents_rels" USING btree ("formulas_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_conditions_id_idx" ON "payload_locked_documents_rels" USING btree ("conditions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_symptoms_id_idx" ON "payload_locked_documents_rels" USING btree ("symptoms_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_modalities_id_idx" ON "payload_locked_documents_rels" USING btree ("modalities_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioners_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioners_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_grok_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("grok_insights_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_import_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("import_logs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_validation_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("validation_reports_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "herbs_botanical_info_common_names" CASCADE;
  DROP TABLE "herbs_botanical_info_synonyms" CASCADE;
  DROP TABLE "herbs_botanical_info_native_region" CASCADE;
  DROP TABLE "herbs_botanical_info_parts_used" CASCADE;
  DROP TABLE "herbs_tcm_properties_tcm_taste" CASCADE;
  DROP TABLE "herbs_tcm_properties_tcm_meridians" CASCADE;
  DROP TABLE "herbs_western_properties" CASCADE;
  DROP TABLE "herbs_active_constituents" CASCADE;
  DROP TABLE "herbs_clinical_studies" CASCADE;
  DROP TABLE "herbs_dosage_forms" CASCADE;
  DROP TABLE "herbs_recommended_dosage" CASCADE;
  DROP TABLE "herbs_preparation_methods" CASCADE;
  DROP TABLE "drug_int" CASCADE;
  DROP TABLE "herbs_images" CASCADE;
  DROP TABLE "herbs_videos" CASCADE;
  DROP TABLE "herbs_search_tags" CASCADE;
  DROP TABLE "herbs" CASCADE;
  DROP TABLE "herbs_rels" CASCADE;
  DROP TABLE "_herbs_v_version_botanical_info_common_names" CASCADE;
  DROP TABLE "_herbs_v_version_botanical_info_synonyms" CASCADE;
  DROP TABLE "_herbs_v_version_botanical_info_native_region" CASCADE;
  DROP TABLE "_herbs_v_version_botanical_info_parts_used" CASCADE;
  DROP TABLE "_herbs_v_version_tcm_properties_tcm_taste" CASCADE;
  DROP TABLE "_herbs_v_version_tcm_properties_tcm_meridians" CASCADE;
  DROP TABLE "_herbs_v_version_western_properties" CASCADE;
  DROP TABLE "_herbs_v_version_active_constituents" CASCADE;
  DROP TABLE "_herbs_v_version_clinical_studies" CASCADE;
  DROP TABLE "_herbs_v_version_dosage_forms" CASCADE;
  DROP TABLE "_herbs_v_version_recommended_dosage" CASCADE;
  DROP TABLE "_herbs_v_version_preparation_methods" CASCADE;
  DROP TABLE "_drug_int_v" CASCADE;
  DROP TABLE "_herbs_v_version_images" CASCADE;
  DROP TABLE "_herbs_v_version_videos" CASCADE;
  DROP TABLE "_herbs_v_version_search_tags" CASCADE;
  DROP TABLE "_herbs_v" CASCADE;
  DROP TABLE "_herbs_v_rels" CASCADE;
  DROP TABLE "formulas_ingredients" CASCADE;
  DROP TABLE "formulas_use_cases" CASCADE;
  DROP TABLE "formulas" CASCADE;
  DROP TABLE "formulas_rels" CASCADE;
  DROP TABLE "_formulas_v_version_ingredients" CASCADE;
  DROP TABLE "_formulas_v_version_use_cases" CASCADE;
  DROP TABLE "_formulas_v" CASCADE;
  DROP TABLE "_formulas_v_rels" CASCADE;
  DROP TABLE "conditions_symptoms" CASCADE;
  DROP TABLE "conditions" CASCADE;
  DROP TABLE "conditions_rels" CASCADE;
  DROP TABLE "_conditions_v_version_symptoms" CASCADE;
  DROP TABLE "_conditions_v" CASCADE;
  DROP TABLE "_conditions_v_rels" CASCADE;
  DROP TABLE "symptoms_severity" CASCADE;
  DROP TABLE "symptoms_duration" CASCADE;
  DROP TABLE "symptoms_common_causes" CASCADE;
  DROP TABLE "symptoms" CASCADE;
  DROP TABLE "symptoms_rels" CASCADE;
  DROP TABLE "_symptoms_v_version_severity" CASCADE;
  DROP TABLE "_symptoms_v_version_duration" CASCADE;
  DROP TABLE "_symptoms_v_version_common_causes" CASCADE;
  DROP TABLE "_symptoms_v" CASCADE;
  DROP TABLE "_symptoms_v_rels" CASCADE;
  DROP TABLE "modalities_treatment_modalities" CASCADE;
  DROP TABLE "modalities_excels_at" CASCADE;
  DROP TABLE "modalities_benefits" CASCADE;
  DROP TABLE "modalities_certification_bodies" CASCADE;
  DROP TABLE "modalities" CASCADE;
  DROP TABLE "modalities_rels" CASCADE;
  DROP TABLE "_modalities_v_version_treatment_modalities" CASCADE;
  DROP TABLE "_modalities_v_version_excels_at" CASCADE;
  DROP TABLE "_modalities_v_version_benefits" CASCADE;
  DROP TABLE "_modalities_v_version_certification_bodies" CASCADE;
  DROP TABLE "_modalities_v" CASCADE;
  DROP TABLE "_modalities_v_rels" CASCADE;
  DROP TABLE "practitioners_credentials" CASCADE;
  DROP TABLE "practitioners_specialties" CASCADE;
  DROP TABLE "practitioners_languages_spoken" CASCADE;
  DROP TABLE "practitioners_insurance_providers" CASCADE;
  DROP TABLE "practitioners" CASCADE;
  DROP TABLE "practitioners_rels" CASCADE;
  DROP TABLE "_practitioners_v_version_credentials" CASCADE;
  DROP TABLE "_practitioners_v_version_specialties" CASCADE;
  DROP TABLE "_practitioners_v_version_languages_spoken" CASCADE;
  DROP TABLE "_practitioners_v_version_insurance_providers" CASCADE;
  DROP TABLE "_practitioners_v" CASCADE;
  DROP TABLE "_practitioners_v_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "_reviews_v" CASCADE;
  DROP TABLE "grok_insights_recommendations" CASCADE;
  DROP TABLE "grok_insights_follow_up_questions" CASCADE;
  DROP TABLE "grok_insights" CASCADE;
  DROP TABLE "grok_insights_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_texts" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "import_logs" CASCADE;
  DROP TABLE "validation_reports_issues" CASCADE;
  DROP TABLE "validation_reports" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "trefle_import_state" CASCADE;
  DROP TABLE "perenual_import_state" CASCADE;
  DROP TYPE "public"."enum_herbs_botanical_info_common_names_language";
  DROP TYPE "public"."enum_herbs_botanical_info_parts_used";
  DROP TYPE "public"."enum_herbs_tcm_properties_tcm_taste";
  DROP TYPE "public"."enum_herbs_tcm_properties_tcm_meridians";
  DROP TYPE "public"."enum_herbs_western_properties";
  DROP TYPE "public"."enum_herbs_dosage_forms";
  DROP TYPE "public"."enum_herbs_recommended_dosage_form";
  DROP TYPE "public"."enum_herbs_preparation_methods_method_type";
  DROP TYPE "public"."type";
  DROP TYPE "public"."enum_herbs_images_image_type";
  DROP TYPE "public"."enum_herbs_status";
  DROP TYPE "public"."enum_herbs_botanical_info_plant_type";
  DROP TYPE "public"."enum_herbs_cultivation_sunlight_needs";
  DROP TYPE "public"."enum_herbs_cultivation_water_needs";
  DROP TYPE "public"."enum_herbs_conservation_status";
  DROP TYPE "public"."enum_herbs_tcm_properties_tcm_temperature";
  DROP TYPE "public"."enum_herbs_safety_info_toxicity_level";
  DROP TYPE "public"."enum_herbs_safety_info_allergenic_potential";
  DROP TYPE "public"."enum_herbs_peer_review_status";
  DROP TYPE "public"."enum__herbs_v_version_botanical_info_common_names_language";
  DROP TYPE "public"."enum__herbs_v_version_botanical_info_parts_used";
  DROP TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_taste";
  DROP TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_meridians";
  DROP TYPE "public"."enum__herbs_v_version_western_properties";
  DROP TYPE "public"."enum__herbs_v_version_dosage_forms";
  DROP TYPE "public"."enum__herbs_v_version_recommended_dosage_form";
  DROP TYPE "public"."enum__herbs_v_version_preparation_methods_method_type";
  DROP TYPE "public"."enum__herbs_v_version_images_image_type";
  DROP TYPE "public"."enum__herbs_v_version_status";
  DROP TYPE "public"."enum__herbs_v_version_botanical_info_plant_type";
  DROP TYPE "public"."enum__herbs_v_version_cultivation_sunlight_needs";
  DROP TYPE "public"."enum__herbs_v_version_cultivation_water_needs";
  DROP TYPE "public"."enum__herbs_v_version_conservation_status";
  DROP TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_temperature";
  DROP TYPE "public"."enum__herbs_v_version_safety_info_toxicity_level";
  DROP TYPE "public"."enum__herbs_v_version_safety_info_allergenic_potential";
  DROP TYPE "public"."enum__herbs_v_version_peer_review_status";
  DROP TYPE "public"."enum_formulas_ingredients_unit";
  DROP TYPE "public"."enum_formulas_ingredients_role";
  DROP TYPE "public"."enum_formulas_total_weight_unit";
  DROP TYPE "public"."enum_formulas_tradition";
  DROP TYPE "public"."enum_formulas_status";
  DROP TYPE "public"."enum__formulas_v_version_ingredients_unit";
  DROP TYPE "public"."enum__formulas_v_version_ingredients_role";
  DROP TYPE "public"."enum__formulas_v_version_total_weight_unit";
  DROP TYPE "public"."enum__formulas_v_version_tradition";
  DROP TYPE "public"."enum__formulas_v_version_status";
  DROP TYPE "public"."enum_conditions_severity";
  DROP TYPE "public"."enum_conditions_category";
  DROP TYPE "public"."enum_conditions_status";
  DROP TYPE "public"."enum__conditions_v_version_severity";
  DROP TYPE "public"."enum__conditions_v_version_category";
  DROP TYPE "public"."enum__conditions_v_version_status";
  DROP TYPE "public"."enum_symptoms_severity";
  DROP TYPE "public"."enum_symptoms_duration";
  DROP TYPE "public"."enum_symptoms_category";
  DROP TYPE "public"."enum_symptoms_status";
  DROP TYPE "public"."enum__symptoms_v_version_severity";
  DROP TYPE "public"."enum__symptoms_v_version_duration";
  DROP TYPE "public"."enum__symptoms_v_version_category";
  DROP TYPE "public"."enum__symptoms_v_version_status";
  DROP TYPE "public"."enum_modalities_status";
  DROP TYPE "public"."enum__modalities_v_version_status";
  DROP TYPE "public"."enum_practitioners_practice_type";
  DROP TYPE "public"."enum_practitioners_pricing_currency";
  DROP TYPE "public"."enum_practitioners_verification_status";
  DROP TYPE "public"."enum_practitioners_status";
  DROP TYPE "public"."enum__practitioners_v_version_practice_type";
  DROP TYPE "public"."enum__practitioners_v_version_pricing_currency";
  DROP TYPE "public"."enum__practitioners_v_version_verification_status";
  DROP TYPE "public"."enum__practitioners_v_version_status";
  DROP TYPE "public"."enum_reviews_reviewed_entity_type";
  DROP TYPE "public"."enum_reviews_moderation_status";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum__reviews_v_version_reviewed_entity_type";
  DROP TYPE "public"."enum__reviews_v_version_moderation_status";
  DROP TYPE "public"."enum__reviews_v_version_status";
  DROP TYPE "public"."enum_grok_insights_recommendations_type";
  DROP TYPE "public"."enum_media_license";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_preferences_language";
  DROP TYPE "public"."enum_users_preferences_theme";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_audit_logs_method";
  DROP TYPE "public"."enum_audit_logs_severity";
  DROP TYPE "public"."enum_import_logs_type";
  DROP TYPE "public"."enum_validation_reports_issues_severity";
  DROP TYPE "public"."enum_validation_reports_type";`)
}
