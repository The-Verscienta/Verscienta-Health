import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user', 'public');
  CREATE TYPE "public"."enum_users_preferences_language" AS ENUM('en', 'es', 'fr', 'zh');
  CREATE TYPE "public"."enum_media_license" AS ENUM('all_rights_reserved', 'public_domain', 'cc_by_4', 'cc_by_sa_4', 'cc_by_nc_4', 'cc_by_nd_4', 'cc0_1');
  CREATE TYPE "public"."enum_herbs_common_names_language" AS ENUM('en', 'zh-pinyin', 'zh', 'es', 'native', 'other');
  CREATE TYPE "public"."enum_herbs_synonyms_status" AS ENUM('accepted', 'synonym', 'misapplied');
  CREATE TYPE "public"."enum_herbs_drug_interactions_interaction_type" AS ENUM('major', 'moderate', 'minor');
  CREATE TYPE "public"."enum_herbs_videos_platform" AS ENUM('youtube', 'vimeo', 'facebook');
  CREATE TYPE "public"."enum_herbs_search_tags_category" AS ENUM('common_name', 'scientific', 'condition', 'action', 'part_used', 'other');
  CREATE TYPE "public"."enum_herbs_botanical_info_plant_type" AS ENUM('herb', 'shrub', 'tree', 'vine', 'grass', 'fern', 'moss', 'fungus', 'lichen');
  CREATE TYPE "public"."enum_herbs_cultivation_sunlight_requirements" AS ENUM('full_sun', 'partial_sun', 'partial_shade', 'full_shade');
  CREATE TYPE "public"."enum_herbs_cultivation_water_requirements" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_herbs_conservation_status" AS ENUM('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_wild', 'not_evaluated', 'data_deficient');
  CREATE TYPE "public"."enum_herbs_tcm_properties_tcm_temperature" AS ENUM('hot', 'warm', 'neutral', 'cool', 'cold');
  CREATE TYPE "public"."enum_herbs_safety_info_pregnancy_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum_herbs_safety_info_breastfeeding_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum_herbs_safety_info_children_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum_herbs_peer_review_status" AS ENUM('draft', 'in_review', 'peer_reviewed', 'expert_verified', 'published', 'needs_update');
  CREATE TYPE "public"."enum_herbs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__herbs_v_version_common_names_language" AS ENUM('en', 'zh-pinyin', 'zh', 'es', 'native', 'other');
  CREATE TYPE "public"."enum__herbs_v_version_synonyms_status" AS ENUM('accepted', 'synonym', 'misapplied');
  CREATE TYPE "public"."enum__herbs_v_version_drug_interactions_interaction_type" AS ENUM('major', 'moderate', 'minor');
  CREATE TYPE "public"."enum__herbs_v_version_videos_platform" AS ENUM('youtube', 'vimeo', 'facebook');
  CREATE TYPE "public"."enum__herbs_v_version_search_tags_category" AS ENUM('common_name', 'scientific', 'condition', 'action', 'part_used', 'other');
  CREATE TYPE "public"."enum__herbs_v_version_botanical_info_plant_type" AS ENUM('herb', 'shrub', 'tree', 'vine', 'grass', 'fern', 'moss', 'fungus', 'lichen');
  CREATE TYPE "public"."enum__herbs_v_version_cultivation_sunlight_requirements" AS ENUM('full_sun', 'partial_sun', 'partial_shade', 'full_shade');
  CREATE TYPE "public"."enum__herbs_v_version_cultivation_water_requirements" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum__herbs_v_version_conservation_status" AS ENUM('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_wild', 'not_evaluated', 'data_deficient');
  CREATE TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_temperature" AS ENUM('hot', 'warm', 'neutral', 'cool', 'cold');
  CREATE TYPE "public"."enum__herbs_v_version_safety_info_pregnancy_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum__herbs_v_version_safety_info_breastfeeding_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum__herbs_v_version_safety_info_children_safety" AS ENUM('safe', 'likely_safe', 'unknown', 'possibly_unsafe', 'unsafe');
  CREATE TYPE "public"."enum__herbs_v_version_peer_review_status" AS ENUM('draft', 'in_review', 'peer_reviewed', 'expert_verified', 'published', 'needs_update');
  CREATE TYPE "public"."enum__herbs_v_version_status" AS ENUM('draft', 'published');
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
  CREATE TYPE "public"."enum_conditions_symptoms_frequency" AS ENUM('common', 'occasional', 'rare');
  CREATE TYPE "public"."enum_conditions_severity" AS ENUM('mild', 'moderate', 'severe', 'life_threatening');
  CREATE TYPE "public"."enum_conditions_category" AS ENUM('digestive', 'respiratory', 'cardiovascular', 'musculoskeletal', 'nervous', 'immune', 'endocrine', 'skin', 'mental', 'other');
  CREATE TYPE "public"."enum_conditions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__conditions_v_version_symptoms_frequency" AS ENUM('common', 'occasional', 'rare');
  CREATE TYPE "public"."enum__conditions_v_version_severity" AS ENUM('mild', 'moderate', 'severe', 'life_threatening');
  CREATE TYPE "public"."enum__conditions_v_version_category" AS ENUM('digestive', 'respiratory', 'cardiovascular', 'musculoskeletal', 'nervous', 'immune', 'endocrine', 'skin', 'mental', 'other');
  CREATE TYPE "public"."enum__conditions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_symptoms_common_causes_likelihood" AS ENUM('very_common', 'common', 'uncommon', 'rare');
  CREATE TYPE "public"."enum_symptoms_severity" AS ENUM('mild', 'moderate', 'severe', 'emergency');
  CREATE TYPE "public"."enum_symptoms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__symptoms_v_version_common_causes_likelihood" AS ENUM('very_common', 'common', 'uncommon', 'rare');
  CREATE TYPE "public"."enum__symptoms_v_version_severity" AS ENUM('mild', 'moderate', 'severe', 'emergency');
  CREATE TYPE "public"."enum__symptoms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_practitioners_languages_proficiency" AS ENUM('native', 'fluent', 'conversational');
  CREATE TYPE "public"."enum_practitioners_addresses_address_type" AS ENUM('primary', 'secondary', 'clinic');
  CREATE TYPE "public"."enum_practitioners_verification_status" AS ENUM('pending', 'verified', 'suspended', 'rejected');
  CREATE TYPE "public"."enum_modalities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__modalities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_reviewed_entity_type" AS ENUM('herb', 'formula', 'practitioner', 'modality');
  CREATE TYPE "public"."enum_reviews_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'MFA_ENABLED', 'MFA_DISABLED', 'PHI_VIEW', 'PHI_CREATE', 'PHI_UPDATE', 'PHI_DELETE', 'PHI_EXPORT', 'SYMPTOM_SUBMIT', 'SYMPTOM_RESULT_VIEW', 'PROFILE_VIEW', 'PROFILE_UPDATE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CHANGE', 'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY');
  CREATE TYPE "public"."enum_audit_logs_method" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE');
  CREATE TYPE "public"."enum_audit_logs_severity" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL');
  CREATE TYPE "public"."enum_import_logs_type" AS ENUM('trefle-sync', 'trefle-progressive-import', 'trefle-sync-error', 'perenual-progressive-import', 'perenual-sync-error', 'external-import', 'algolia-sync', 'database-backup', 'cache-cleanup', 'other');
  CREATE TYPE "public"."enum_import_logs_status" AS ENUM('completed', 'failed', 'in_progress');
  CREATE TYPE "public"."enum_validation_reports_issues_severity" AS ENUM('error', 'warning', 'info');
  CREATE TYPE "public"."enum_validation_reports_severity" AS ENUM('error', 'warning', 'info');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'sync-trefle-data', 'import-trefle-data');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'sync-trefle-data', 'import-trefle-data');
  CREATE TYPE "public"."enum_trefle_import_state_import_status" AS ENUM('not_started', 'in_progress', 'paused', 'completed', 'error');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
  	"phone" varchar,
  	"date_of_birth" timestamp(3) with time zone,
  	"preferences_language" "enum_users_preferences_language" DEFAULT 'en',
  	"preferences_email_notifications" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"photographer" varchar,
  	"license" "enum_media_license",
  	"source" varchar,
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
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar,
  	"sizes_desktop_url" varchar,
  	"sizes_desktop_width" numeric,
  	"sizes_desktop_height" numeric,
  	"sizes_desktop_mime_type" varchar,
  	"sizes_desktop_filesize" numeric,
  	"sizes_desktop_filename" varchar
  );
  
  CREATE TABLE "herbs_common_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"language" "enum_herbs_common_names_language",
  	"region" varchar
  );
  
  CREATE TABLE "herbs_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scientific_name" varchar,
  	"status" "enum_herbs_synonyms_status"
  );
  
  CREATE TABLE "herbs_native_region" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region" varchar,
  	"countries" jsonb
  );
  
  CREATE TABLE "herbs_active_constituents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"concentration" varchar
  );
  
  CREATE TABLE "herbs_clinical_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"authors" varchar,
  	"journal" varchar,
  	"year" numeric,
  	"doi" varchar,
  	"url" varchar,
  	"summary" varchar
  );
  
  CREATE TABLE "herbs_recommended_dosage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" varchar,
  	"amount" varchar,
  	"frequency" varchar,
  	"duration" varchar,
  	"notes" varchar
  );
  
  CREATE TABLE "herbs_preparation_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"method" varchar,
  	"instructions" jsonb,
  	"duration" varchar
  );
  
  CREATE TABLE "herbs_drug_interactions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"drug_name" varchar,
  	"interaction_type" "enum_herbs_drug_interactions_interaction_type",
  	"description" varchar
  );
  
  CREATE TABLE "herbs_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"part_shown" varchar,
  	"photographer" varchar,
  	"license" varchar
  );
  
  CREATE TABLE "herbs_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"platform" "enum_herbs_videos_platform"
  );
  
  CREATE TABLE "herbs_search_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"category" "enum_herbs_search_tags_category"
  );
  
  CREATE TABLE "herbs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"herb_id" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"botanical_info_scientific_name" varchar,
  	"botanical_info_family" varchar,
  	"botanical_info_genus" varchar,
  	"botanical_info_species" varchar,
  	"botanical_info_plant_type" "enum_herbs_botanical_info_plant_type",
  	"botanical_info_habitat" varchar,
  	"botanical_info_parts_used" jsonb,
  	"botanical_info_botanical_description" jsonb,
  	"cultivation_growing_conditions" jsonb,
  	"cultivation_propagation" varchar,
  	"cultivation_harvest_time" varchar,
  	"cultivation_soil_requirements" varchar,
  	"cultivation_sunlight_requirements" "enum_herbs_cultivation_sunlight_requirements",
  	"cultivation_water_requirements" "enum_herbs_cultivation_water_requirements",
  	"conservation_status" "enum_herbs_conservation_status",
  	"conservation_notes" jsonb,
  	"tcm_properties_tcm_taste" jsonb,
  	"tcm_properties_tcm_temperature" "enum_herbs_tcm_properties_tcm_temperature",
  	"tcm_properties_tcm_meridians" jsonb,
  	"tcm_properties_tcm_functions" jsonb,
  	"tcm_properties_tcm_category" varchar,
  	"tcm_properties_tcm_traditional_uses" jsonb,
  	"western_properties" jsonb,
  	"therapeutic_uses" jsonb,
  	"traditional_american_uses" jsonb,
  	"native_american_uses" jsonb,
  	"pharmacological_effects" jsonb,
  	"dosage_forms" jsonb,
  	"safety_info_contraindications" jsonb,
  	"safety_info_warnings" jsonb,
  	"safety_info_side_effects" jsonb,
  	"safety_info_pregnancy_safety" "enum_herbs_safety_info_pregnancy_safety",
  	"safety_info_breastfeeding_safety" "enum_herbs_safety_info_breastfeeding_safety",
  	"safety_info_children_safety" "enum_herbs_safety_info_children_safety",
  	"average_rating" numeric,
  	"review_count" numeric,
  	"peer_review_status" "enum_herbs_peer_review_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_herbs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "herbs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE "_herbs_v_version_common_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"language" "enum__herbs_v_version_common_names_language",
  	"region" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"scientific_name" varchar,
  	"status" "enum__herbs_v_version_synonyms_status",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_native_region" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"region" varchar,
  	"countries" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_active_constituents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"concentration" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_clinical_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"authors" varchar,
  	"journal" varchar,
  	"year" numeric,
  	"doi" varchar,
  	"url" varchar,
  	"summary" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_recommended_dosage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" varchar,
  	"amount" varchar,
  	"frequency" varchar,
  	"duration" varchar,
  	"notes" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_preparation_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"method" varchar,
  	"instructions" jsonb,
  	"duration" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_drug_interactions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"drug_name" varchar,
  	"interaction_type" "enum__herbs_v_version_drug_interactions_interaction_type",
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"part_shown" varchar,
  	"photographer" varchar,
  	"license" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"description" varchar,
  	"platform" "enum__herbs_v_version_videos_platform",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v_version_search_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"category" "enum__herbs_v_version_search_tags_category",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_herbs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_herb_id" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_botanical_info_scientific_name" varchar,
  	"version_botanical_info_family" varchar,
  	"version_botanical_info_genus" varchar,
  	"version_botanical_info_species" varchar,
  	"version_botanical_info_plant_type" "enum__herbs_v_version_botanical_info_plant_type",
  	"version_botanical_info_habitat" varchar,
  	"version_botanical_info_parts_used" jsonb,
  	"version_botanical_info_botanical_description" jsonb,
  	"version_cultivation_growing_conditions" jsonb,
  	"version_cultivation_propagation" varchar,
  	"version_cultivation_harvest_time" varchar,
  	"version_cultivation_soil_requirements" varchar,
  	"version_cultivation_sunlight_requirements" "enum__herbs_v_version_cultivation_sunlight_requirements",
  	"version_cultivation_water_requirements" "enum__herbs_v_version_cultivation_water_requirements",
  	"version_conservation_status" "enum__herbs_v_version_conservation_status",
  	"version_conservation_notes" jsonb,
  	"version_tcm_properties_tcm_taste" jsonb,
  	"version_tcm_properties_tcm_temperature" "enum__herbs_v_version_tcm_properties_tcm_temperature",
  	"version_tcm_properties_tcm_meridians" jsonb,
  	"version_tcm_properties_tcm_functions" jsonb,
  	"version_tcm_properties_tcm_category" varchar,
  	"version_tcm_properties_tcm_traditional_uses" jsonb,
  	"version_western_properties" jsonb,
  	"version_therapeutic_uses" jsonb,
  	"version_traditional_american_uses" jsonb,
  	"version_native_american_uses" jsonb,
  	"version_pharmacological_effects" jsonb,
  	"version_dosage_forms" jsonb,
  	"version_safety_info_contraindications" jsonb,
  	"version_safety_info_warnings" jsonb,
  	"version_safety_info_side_effects" jsonb,
  	"version_safety_info_pregnancy_safety" "enum__herbs_v_version_safety_info_pregnancy_safety",
  	"version_safety_info_breastfeeding_safety" "enum__herbs_v_version_safety_info_breastfeeding_safety",
  	"version_safety_info_children_safety" "enum__herbs_v_version_safety_info_children_safety",
  	"version_average_rating" numeric,
  	"version_review_count" numeric,
  	"version_peer_review_status" "enum__herbs_v_version_peer_review_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__herbs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_herbs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE "formulas_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"herb_id" integer,
  	"quantity" numeric,
  	"unit" "enum_formulas_ingredients_unit",
  	"percentage" numeric,
  	"role" "enum_formulas_ingredients_role"
  );
  
  CREATE TABLE "formulas_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"use_case" varchar
  );
  
  CREATE TABLE "formulas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"short_description" varchar,
  	"description" jsonb,
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
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_formulas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "formulas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer
  );
  
  CREATE TABLE "_formulas_v_version_ingredients" (
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
  
  CREATE TABLE "_formulas_v_version_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"use_case" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_formulas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
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
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__formulas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_formulas_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer
  );
  
  CREATE TABLE "conditions_symptoms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"symptom" varchar,
  	"frequency" "enum_conditions_symptoms_frequency"
  );
  
  CREATE TABLE "conditions" (
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
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_conditions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "conditions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"symptoms_id" integer
  );
  
  CREATE TABLE "_conditions_v_version_symptoms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"symptom" varchar,
  	"frequency" "enum__conditions_v_version_symptoms_frequency",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_conditions_v" (
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
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__conditions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_conditions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"symptoms_id" integer
  );
  
  CREATE TABLE "symptoms_common_causes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cause" varchar,
  	"likelihood" "enum_symptoms_common_causes_likelihood"
  );
  
  CREATE TABLE "symptoms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"tcm_interpretation" jsonb,
  	"western_interpretation" jsonb,
  	"severity" "enum_symptoms_severity",
  	"red_flags" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_symptoms_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "symptoms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE "_symptoms_v_version_common_causes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cause" varchar,
  	"likelihood" "enum__symptoms_v_version_common_causes_likelihood",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_symptoms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_tcm_interpretation" jsonb,
  	"version_western_interpretation" jsonb,
  	"version_severity" "enum__symptoms_v_version_severity",
  	"version_red_flags" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__symptoms_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_symptoms_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE "practitioners_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"credential_type" varchar NOT NULL,
  	"credential_number" varchar,
  	"issuing_organization" varchar,
  	"issue_date" timestamp(3) with time zone,
  	"expiry_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "practitioners_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"specialty" varchar NOT NULL
  );
  
  CREATE TABLE "practitioners_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar NOT NULL,
  	"proficiency" "enum_practitioners_languages_proficiency"
  );
  
  CREATE TABLE "practitioners_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"address_type" "enum_practitioners_addresses_address_type",
  	"street" varchar,
  	"city" varchar,
  	"state" varchar,
  	"zip_code" varchar,
  	"country" varchar DEFAULT 'USA',
  	"latitude" numeric,
  	"longitude" numeric
  );
  
  CREATE TABLE "practitioners_insurance_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar NOT NULL
  );
  
  CREATE TABLE "practitioners_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_type" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"duration" numeric
  );
  
  CREATE TABLE "practitioners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"business_name" varchar NOT NULL,
  	"practitioner_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"bio" jsonb,
  	"profile_image_id" integer,
  	"email" varchar,
  	"phone" varchar,
  	"website" varchar,
  	"verification_status" "enum_practitioners_verification_status" DEFAULT 'pending' NOT NULL,
  	"verification_notes" varchar,
  	"average_rating" numeric,
  	"review_count" numeric,
  	"city" varchar,
  	"state" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "practitioners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"modalities_id" integer
  );
  
  CREATE TABLE "modalities_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"benefit" varchar
  );
  
  CREATE TABLE "modalities_certification_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"organization_name" varchar,
  	"website" varchar,
  	"certification_level" varchar
  );
  
  CREATE TABLE "modalities_excels_at" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"condition_type" varchar
  );
  
  CREATE TABLE "modalities_treatment_approaches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"approach" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "modalities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"category" varchar,
  	"training_requirements" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_modalities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "modalities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE "_modalities_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"benefit" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_modalities_v_version_certification_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_name" varchar,
  	"website" varchar,
  	"certification_level" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_modalities_v_version_excels_at" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"condition_type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_modalities_v_version_treatment_approaches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"approach" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_modalities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_category" varchar,
  	"version_training_requirements" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__modalities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_modalities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"conditions_id" integer,
  	"herbs_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"reviewed_entity_type" "enum_reviews_reviewed_entity_type" NOT NULL,
  	"author_id" integer NOT NULL,
  	"moderation_status" "enum_reviews_moderation_status" DEFAULT 'pending' NOT NULL,
  	"moderation_notes" varchar,
  	"helpful_count" numeric DEFAULT 0,
  	"not_helpful_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"practitioners_id" integer,
  	"modalities_id" integer
  );
  
  CREATE TABLE "grok_insights_recommendations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recommendation" varchar NOT NULL,
  	"confidence" numeric
  );
  
  CREATE TABLE "grok_insights_follow_up_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "grok_insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"session_id" varchar NOT NULL,
  	"query" varchar NOT NULL,
  	"response" jsonb NOT NULL,
  	"tokens_used" numeric,
  	"model" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "grok_insights_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"herbs_id" integer,
  	"conditions_id" integer
  );
  
  CREATE TABLE "audit_logs" (
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
  
  CREATE TABLE "import_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_import_logs_type" NOT NULL,
  	"source" varchar,
  	"status" "enum_import_logs_status",
  	"records_processed" numeric DEFAULT 0,
  	"records_created" numeric DEFAULT 0,
  	"records_updated" numeric DEFAULT 0,
  	"records_failed" numeric DEFAULT 0,
  	"duration" numeric DEFAULT 0,
  	"summary" jsonb,
  	"errors" jsonb,
  	"results" jsonb,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "validation_reports_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"issue" varchar NOT NULL,
  	"severity" "enum_validation_reports_issues_severity"
  );
  
  CREATE TABLE "validation_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" varchar NOT NULL,
  	"collection_type" varchar,
  	"document_id" varchar,
  	"field" varchar,
  	"current_value" varchar,
  	"suggested_value" varchar,
  	"severity" "enum_validation_reports_severity" DEFAULT 'warning',
  	"message" varchar,
  	"error_count" numeric DEFAULT 0,
  	"warning_count" numeric DEFAULT 0,
  	"total_checked" numeric,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"herbs_id" integer,
  	"formulas_id" integer,
  	"conditions_id" integer,
  	"symptoms_id" integer,
  	"practitioners_id" integer,
  	"modalities_id" integer,
  	"reviews_id" integer,
  	"grok_insights_id" integer,
  	"audit_logs_id" integer,
  	"import_logs_id" integer,
  	"validation_reports_id" integer,
  	"payload_kv_id" integer,
  	"payload_jobs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trefle_import_state" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_page" numeric DEFAULT 1 NOT NULL,
  	"total_pages" numeric,
  	"records_imported" numeric DEFAULT 0,
  	"last_import_date" timestamp(3) with time zone,
  	"import_status" "enum_trefle_import_state_import_status" DEFAULT 'not_started',
  	"error_message" varchar,
  	"last_successful_page" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_common_names" ADD CONSTRAINT "herbs_common_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_synonyms" ADD CONSTRAINT "herbs_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_native_region" ADD CONSTRAINT "herbs_native_region_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_active_constituents" ADD CONSTRAINT "herbs_active_constituents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_clinical_studies" ADD CONSTRAINT "herbs_clinical_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_recommended_dosage" ADD CONSTRAINT "herbs_recommended_dosage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_preparation_methods" ADD CONSTRAINT "herbs_preparation_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_drug_interactions" ADD CONSTRAINT "herbs_drug_interactions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_images" ADD CONSTRAINT "herbs_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "herbs_images" ADD CONSTRAINT "herbs_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_videos" ADD CONSTRAINT "herbs_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_search_tags" ADD CONSTRAINT "herbs_search_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs" ADD CONSTRAINT "herbs_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "herbs_rels" ADD CONSTRAINT "herbs_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_common_names" ADD CONSTRAINT "_herbs_v_version_common_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_synonyms" ADD CONSTRAINT "_herbs_v_version_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_native_region" ADD CONSTRAINT "_herbs_v_version_native_region_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_active_constituents" ADD CONSTRAINT "_herbs_v_version_active_constituents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_clinical_studies" ADD CONSTRAINT "_herbs_v_version_clinical_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_recommended_dosage" ADD CONSTRAINT "_herbs_v_version_recommended_dosage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_preparation_methods" ADD CONSTRAINT "_herbs_v_version_preparation_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_drug_interactions" ADD CONSTRAINT "_herbs_v_version_drug_interactions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_images" ADD CONSTRAINT "_herbs_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_images" ADD CONSTRAINT "_herbs_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_videos" ADD CONSTRAINT "_herbs_v_version_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_version_search_tags" ADD CONSTRAINT "_herbs_v_version_search_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v" ADD CONSTRAINT "_herbs_v_parent_id_herbs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_herbs_v" ADD CONSTRAINT "_herbs_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_herbs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_herbs_v_rels" ADD CONSTRAINT "_herbs_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formulas_ingredients" ADD CONSTRAINT "formulas_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formulas_ingredients" ADD CONSTRAINT "formulas_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formulas_use_cases" ADD CONSTRAINT "formulas_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formulas" ADD CONSTRAINT "formulas_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formulas_rels" ADD CONSTRAINT "formulas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formulas_rels" ADD CONSTRAINT "formulas_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formulas_v_version_ingredients" ADD CONSTRAINT "_formulas_v_version_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formulas_v_version_ingredients" ADD CONSTRAINT "_formulas_v_version_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formulas_v_version_use_cases" ADD CONSTRAINT "_formulas_v_version_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formulas_v" ADD CONSTRAINT "_formulas_v_parent_id_formulas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formulas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formulas_v" ADD CONSTRAINT "_formulas_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formulas_v_rels" ADD CONSTRAINT "_formulas_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_formulas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formulas_v_rels" ADD CONSTRAINT "_formulas_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conditions_symptoms" ADD CONSTRAINT "conditions_symptoms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conditions" ADD CONSTRAINT "conditions_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conditions_rels" ADD CONSTRAINT "conditions_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_conditions_v_version_symptoms" ADD CONSTRAINT "_conditions_v_version_symptoms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_conditions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_conditions_v" ADD CONSTRAINT "_conditions_v_parent_id_conditions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."conditions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_conditions_v" ADD CONSTRAINT "_conditions_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_conditions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_conditions_v_rels" ADD CONSTRAINT "_conditions_v_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms_common_causes" ADD CONSTRAINT "symptoms_common_causes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms_rels" ADD CONSTRAINT "symptoms_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_symptoms_v_version_common_causes" ADD CONSTRAINT "_symptoms_v_version_common_causes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_symptoms_v" ADD CONSTRAINT "_symptoms_v_parent_id_symptoms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."symptoms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_symptoms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_symptoms_v_rels" ADD CONSTRAINT "_symptoms_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_credentials" ADD CONSTRAINT "practitioners_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_specialties" ADD CONSTRAINT "practitioners_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_languages" ADD CONSTRAINT "practitioners_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_addresses" ADD CONSTRAINT "practitioners_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_insurance_providers" ADD CONSTRAINT "practitioners_insurance_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_pricing" ADD CONSTRAINT "practitioners_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practitioners_rels" ADD CONSTRAINT "practitioners_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_benefits" ADD CONSTRAINT "modalities_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_certification_bodies" ADD CONSTRAINT "modalities_certification_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_excels_at" ADD CONSTRAINT "modalities_excels_at_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_treatment_approaches" ADD CONSTRAINT "modalities_treatment_approaches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities" ADD CONSTRAINT "modalities_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modalities_rels" ADD CONSTRAINT "modalities_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_version_benefits" ADD CONSTRAINT "_modalities_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_version_certification_bodies" ADD CONSTRAINT "_modalities_v_version_certification_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_version_excels_at" ADD CONSTRAINT "_modalities_v_version_excels_at_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_version_treatment_approaches" ADD CONSTRAINT "_modalities_v_version_treatment_approaches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v" ADD CONSTRAINT "_modalities_v_parent_id_modalities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modalities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_modalities_v" ADD CONSTRAINT "_modalities_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_modalities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_modalities_v_rels" ADD CONSTRAINT "_modalities_v_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_practitioners_fk" FOREIGN KEY ("practitioners_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "grok_insights_recommendations" ADD CONSTRAINT "grok_insights_recommendations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "grok_insights_follow_up_questions" ADD CONSTRAINT "grok_insights_follow_up_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "grok_insights" ADD CONSTRAINT "grok_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "grok_insights_rels" ADD CONSTRAINT "grok_insights_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "validation_reports_issues" ADD CONSTRAINT "validation_reports_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."validation_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_herbs_fk" FOREIGN KEY ("herbs_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formulas_fk" FOREIGN KEY ("formulas_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conditions_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_practitioners_fk" FOREIGN KEY ("practitioners_id") REFERENCES "public"."practitioners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modalities_fk" FOREIGN KEY ("modalities_id") REFERENCES "public"."modalities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_grok_insights_fk" FOREIGN KEY ("grok_insights_id") REFERENCES "public"."grok_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_logs_fk" FOREIGN KEY ("import_logs_id") REFERENCES "public"."import_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_validation_reports_fk" FOREIGN KEY ("validation_reports_id") REFERENCES "public"."validation_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_kv_fk" FOREIGN KEY ("payload_kv_id") REFERENCES "public"."payload_kv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "media_sizes_desktop_sizes_desktop_filename_idx" ON "media" USING btree ("sizes_desktop_filename");
  CREATE INDEX "herbs_common_names_order_idx" ON "herbs_common_names" USING btree ("_order");
  CREATE INDEX "herbs_common_names_parent_id_idx" ON "herbs_common_names" USING btree ("_parent_id");
  CREATE INDEX "herbs_synonyms_order_idx" ON "herbs_synonyms" USING btree ("_order");
  CREATE INDEX "herbs_synonyms_parent_id_idx" ON "herbs_synonyms" USING btree ("_parent_id");
  CREATE INDEX "herbs_native_region_order_idx" ON "herbs_native_region" USING btree ("_order");
  CREATE INDEX "herbs_native_region_parent_id_idx" ON "herbs_native_region" USING btree ("_parent_id");
  CREATE INDEX "herbs_active_constituents_order_idx" ON "herbs_active_constituents" USING btree ("_order");
  CREATE INDEX "herbs_active_constituents_parent_id_idx" ON "herbs_active_constituents" USING btree ("_parent_id");
  CREATE INDEX "herbs_clinical_studies_order_idx" ON "herbs_clinical_studies" USING btree ("_order");
  CREATE INDEX "herbs_clinical_studies_parent_id_idx" ON "herbs_clinical_studies" USING btree ("_parent_id");
  CREATE INDEX "herbs_recommended_dosage_order_idx" ON "herbs_recommended_dosage" USING btree ("_order");
  CREATE INDEX "herbs_recommended_dosage_parent_id_idx" ON "herbs_recommended_dosage" USING btree ("_parent_id");
  CREATE INDEX "herbs_preparation_methods_order_idx" ON "herbs_preparation_methods" USING btree ("_order");
  CREATE INDEX "herbs_preparation_methods_parent_id_idx" ON "herbs_preparation_methods" USING btree ("_parent_id");
  CREATE INDEX "herbs_drug_interactions_order_idx" ON "herbs_drug_interactions" USING btree ("_order");
  CREATE INDEX "herbs_drug_interactions_parent_id_idx" ON "herbs_drug_interactions" USING btree ("_parent_id");
  CREATE INDEX "herbs_images_order_idx" ON "herbs_images" USING btree ("_order");
  CREATE INDEX "herbs_images_parent_id_idx" ON "herbs_images" USING btree ("_parent_id");
  CREATE INDEX "herbs_images_image_idx" ON "herbs_images" USING btree ("image_id");
  CREATE INDEX "herbs_videos_order_idx" ON "herbs_videos" USING btree ("_order");
  CREATE INDEX "herbs_videos_parent_id_idx" ON "herbs_videos" USING btree ("_parent_id");
  CREATE INDEX "herbs_search_tags_order_idx" ON "herbs_search_tags" USING btree ("_order");
  CREATE INDEX "herbs_search_tags_parent_id_idx" ON "herbs_search_tags" USING btree ("_parent_id");
  CREATE INDEX "herbs_title_idx" ON "herbs" USING btree ("title");
  CREATE UNIQUE INDEX "herbs_slug_idx" ON "herbs" USING btree ("slug");
  CREATE UNIQUE INDEX "herbs_herb_id_idx" ON "herbs" USING btree ("herb_id");
  CREATE INDEX "herbs_featured_image_idx" ON "herbs" USING btree ("featured_image_id");
  CREATE INDEX "herbs_botanical_info_botanical_info_scientific_name_idx" ON "herbs" USING btree ("botanical_info_scientific_name");
  CREATE INDEX "herbs_updated_at_idx" ON "herbs" USING btree ("updated_at");
  CREATE INDEX "herbs_created_at_idx" ON "herbs" USING btree ("created_at");
  CREATE INDEX "herbs__status_idx" ON "herbs" USING btree ("_status");
  CREATE INDEX "herbs_rels_order_idx" ON "herbs_rels" USING btree ("order");
  CREATE INDEX "herbs_rels_parent_idx" ON "herbs_rels" USING btree ("parent_id");
  CREATE INDEX "herbs_rels_path_idx" ON "herbs_rels" USING btree ("path");
  CREATE INDEX "herbs_rels_media_id_idx" ON "herbs_rels" USING btree ("media_id");
  CREATE INDEX "herbs_rels_herbs_id_idx" ON "herbs_rels" USING btree ("herbs_id");
  CREATE INDEX "herbs_rels_conditions_id_idx" ON "herbs_rels" USING btree ("conditions_id");
  CREATE INDEX "_herbs_v_version_common_names_order_idx" ON "_herbs_v_version_common_names" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_common_names_parent_id_idx" ON "_herbs_v_version_common_names" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_synonyms_order_idx" ON "_herbs_v_version_synonyms" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_synonyms_parent_id_idx" ON "_herbs_v_version_synonyms" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_native_region_order_idx" ON "_herbs_v_version_native_region" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_native_region_parent_id_idx" ON "_herbs_v_version_native_region" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_active_constituents_order_idx" ON "_herbs_v_version_active_constituents" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_active_constituents_parent_id_idx" ON "_herbs_v_version_active_constituents" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_clinical_studies_order_idx" ON "_herbs_v_version_clinical_studies" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_clinical_studies_parent_id_idx" ON "_herbs_v_version_clinical_studies" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_recommended_dosage_order_idx" ON "_herbs_v_version_recommended_dosage" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_recommended_dosage_parent_id_idx" ON "_herbs_v_version_recommended_dosage" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_preparation_methods_order_idx" ON "_herbs_v_version_preparation_methods" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_preparation_methods_parent_id_idx" ON "_herbs_v_version_preparation_methods" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_drug_interactions_order_idx" ON "_herbs_v_version_drug_interactions" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_drug_interactions_parent_id_idx" ON "_herbs_v_version_drug_interactions" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_images_order_idx" ON "_herbs_v_version_images" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_images_parent_id_idx" ON "_herbs_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_images_image_idx" ON "_herbs_v_version_images" USING btree ("image_id");
  CREATE INDEX "_herbs_v_version_videos_order_idx" ON "_herbs_v_version_videos" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_videos_parent_id_idx" ON "_herbs_v_version_videos" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_version_search_tags_order_idx" ON "_herbs_v_version_search_tags" USING btree ("_order");
  CREATE INDEX "_herbs_v_version_search_tags_parent_id_idx" ON "_herbs_v_version_search_tags" USING btree ("_parent_id");
  CREATE INDEX "_herbs_v_parent_idx" ON "_herbs_v" USING btree ("parent_id");
  CREATE INDEX "_herbs_v_version_version_title_idx" ON "_herbs_v" USING btree ("version_title");
  CREATE INDEX "_herbs_v_version_version_slug_idx" ON "_herbs_v" USING btree ("version_slug");
  CREATE INDEX "_herbs_v_version_version_herb_id_idx" ON "_herbs_v" USING btree ("version_herb_id");
  CREATE INDEX "_herbs_v_version_version_featured_image_idx" ON "_herbs_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_herbs_v_version_botanical_info_version_botanical_info_s_idx" ON "_herbs_v" USING btree ("version_botanical_info_scientific_name");
  CREATE INDEX "_herbs_v_version_version_updated_at_idx" ON "_herbs_v" USING btree ("version_updated_at");
  CREATE INDEX "_herbs_v_version_version_created_at_idx" ON "_herbs_v" USING btree ("version_created_at");
  CREATE INDEX "_herbs_v_version_version__status_idx" ON "_herbs_v" USING btree ("version__status");
  CREATE INDEX "_herbs_v_created_at_idx" ON "_herbs_v" USING btree ("created_at");
  CREATE INDEX "_herbs_v_updated_at_idx" ON "_herbs_v" USING btree ("updated_at");
  CREATE INDEX "_herbs_v_latest_idx" ON "_herbs_v" USING btree ("latest");
  CREATE INDEX "_herbs_v_rels_order_idx" ON "_herbs_v_rels" USING btree ("order");
  CREATE INDEX "_herbs_v_rels_parent_idx" ON "_herbs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_herbs_v_rels_path_idx" ON "_herbs_v_rels" USING btree ("path");
  CREATE INDEX "_herbs_v_rels_media_id_idx" ON "_herbs_v_rels" USING btree ("media_id");
  CREATE INDEX "_herbs_v_rels_herbs_id_idx" ON "_herbs_v_rels" USING btree ("herbs_id");
  CREATE INDEX "_herbs_v_rels_conditions_id_idx" ON "_herbs_v_rels" USING btree ("conditions_id");
  CREATE INDEX "formulas_ingredients_order_idx" ON "formulas_ingredients" USING btree ("_order");
  CREATE INDEX "formulas_ingredients_parent_id_idx" ON "formulas_ingredients" USING btree ("_parent_id");
  CREATE INDEX "formulas_ingredients_herb_idx" ON "formulas_ingredients" USING btree ("herb_id");
  CREATE INDEX "formulas_use_cases_order_idx" ON "formulas_use_cases" USING btree ("_order");
  CREATE INDEX "formulas_use_cases_parent_id_idx" ON "formulas_use_cases" USING btree ("_parent_id");
  CREATE INDEX "formulas_title_idx" ON "formulas" USING btree ("title");
  CREATE UNIQUE INDEX "formulas_slug_idx" ON "formulas" USING btree ("slug");
  CREATE INDEX "formulas_featured_image_idx" ON "formulas" USING btree ("featured_image_id");
  CREATE INDEX "formulas_updated_at_idx" ON "formulas" USING btree ("updated_at");
  CREATE INDEX "formulas_created_at_idx" ON "formulas" USING btree ("created_at");
  CREATE INDEX "formulas__status_idx" ON "formulas" USING btree ("_status");
  CREATE INDEX "formulas_rels_order_idx" ON "formulas_rels" USING btree ("order");
  CREATE INDEX "formulas_rels_parent_idx" ON "formulas_rels" USING btree ("parent_id");
  CREATE INDEX "formulas_rels_path_idx" ON "formulas_rels" USING btree ("path");
  CREATE INDEX "formulas_rels_conditions_id_idx" ON "formulas_rels" USING btree ("conditions_id");
  CREATE INDEX "_formulas_v_version_ingredients_order_idx" ON "_formulas_v_version_ingredients" USING btree ("_order");
  CREATE INDEX "_formulas_v_version_ingredients_parent_id_idx" ON "_formulas_v_version_ingredients" USING btree ("_parent_id");
  CREATE INDEX "_formulas_v_version_ingredients_herb_idx" ON "_formulas_v_version_ingredients" USING btree ("herb_id");
  CREATE INDEX "_formulas_v_version_use_cases_order_idx" ON "_formulas_v_version_use_cases" USING btree ("_order");
  CREATE INDEX "_formulas_v_version_use_cases_parent_id_idx" ON "_formulas_v_version_use_cases" USING btree ("_parent_id");
  CREATE INDEX "_formulas_v_parent_idx" ON "_formulas_v" USING btree ("parent_id");
  CREATE INDEX "_formulas_v_version_version_title_idx" ON "_formulas_v" USING btree ("version_title");
  CREATE INDEX "_formulas_v_version_version_slug_idx" ON "_formulas_v" USING btree ("version_slug");
  CREATE INDEX "_formulas_v_version_version_featured_image_idx" ON "_formulas_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_formulas_v_version_version_updated_at_idx" ON "_formulas_v" USING btree ("version_updated_at");
  CREATE INDEX "_formulas_v_version_version_created_at_idx" ON "_formulas_v" USING btree ("version_created_at");
  CREATE INDEX "_formulas_v_version_version__status_idx" ON "_formulas_v" USING btree ("version__status");
  CREATE INDEX "_formulas_v_created_at_idx" ON "_formulas_v" USING btree ("created_at");
  CREATE INDEX "_formulas_v_updated_at_idx" ON "_formulas_v" USING btree ("updated_at");
  CREATE INDEX "_formulas_v_latest_idx" ON "_formulas_v" USING btree ("latest");
  CREATE INDEX "_formulas_v_rels_order_idx" ON "_formulas_v_rels" USING btree ("order");
  CREATE INDEX "_formulas_v_rels_parent_idx" ON "_formulas_v_rels" USING btree ("parent_id");
  CREATE INDEX "_formulas_v_rels_path_idx" ON "_formulas_v_rels" USING btree ("path");
  CREATE INDEX "_formulas_v_rels_conditions_id_idx" ON "_formulas_v_rels" USING btree ("conditions_id");
  CREATE INDEX "conditions_symptoms_order_idx" ON "conditions_symptoms" USING btree ("_order");
  CREATE INDEX "conditions_symptoms_parent_id_idx" ON "conditions_symptoms" USING btree ("_parent_id");
  CREATE INDEX "conditions_title_idx" ON "conditions" USING btree ("title");
  CREATE UNIQUE INDEX "conditions_slug_idx" ON "conditions" USING btree ("slug");
  CREATE INDEX "conditions_featured_image_idx" ON "conditions" USING btree ("featured_image_id");
  CREATE INDEX "conditions_updated_at_idx" ON "conditions" USING btree ("updated_at");
  CREATE INDEX "conditions_created_at_idx" ON "conditions" USING btree ("created_at");
  CREATE INDEX "conditions__status_idx" ON "conditions" USING btree ("_status");
  CREATE INDEX "conditions_rels_order_idx" ON "conditions_rels" USING btree ("order");
  CREATE INDEX "conditions_rels_parent_idx" ON "conditions_rels" USING btree ("parent_id");
  CREATE INDEX "conditions_rels_path_idx" ON "conditions_rels" USING btree ("path");
  CREATE INDEX "conditions_rels_herbs_id_idx" ON "conditions_rels" USING btree ("herbs_id");
  CREATE INDEX "conditions_rels_formulas_id_idx" ON "conditions_rels" USING btree ("formulas_id");
  CREATE INDEX "conditions_rels_symptoms_id_idx" ON "conditions_rels" USING btree ("symptoms_id");
  CREATE INDEX "_conditions_v_version_symptoms_order_idx" ON "_conditions_v_version_symptoms" USING btree ("_order");
  CREATE INDEX "_conditions_v_version_symptoms_parent_id_idx" ON "_conditions_v_version_symptoms" USING btree ("_parent_id");
  CREATE INDEX "_conditions_v_parent_idx" ON "_conditions_v" USING btree ("parent_id");
  CREATE INDEX "_conditions_v_version_version_title_idx" ON "_conditions_v" USING btree ("version_title");
  CREATE INDEX "_conditions_v_version_version_slug_idx" ON "_conditions_v" USING btree ("version_slug");
  CREATE INDEX "_conditions_v_version_version_featured_image_idx" ON "_conditions_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_conditions_v_version_version_updated_at_idx" ON "_conditions_v" USING btree ("version_updated_at");
  CREATE INDEX "_conditions_v_version_version_created_at_idx" ON "_conditions_v" USING btree ("version_created_at");
  CREATE INDEX "_conditions_v_version_version__status_idx" ON "_conditions_v" USING btree ("version__status");
  CREATE INDEX "_conditions_v_created_at_idx" ON "_conditions_v" USING btree ("created_at");
  CREATE INDEX "_conditions_v_updated_at_idx" ON "_conditions_v" USING btree ("updated_at");
  CREATE INDEX "_conditions_v_latest_idx" ON "_conditions_v" USING btree ("latest");
  CREATE INDEX "_conditions_v_rels_order_idx" ON "_conditions_v_rels" USING btree ("order");
  CREATE INDEX "_conditions_v_rels_parent_idx" ON "_conditions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_conditions_v_rels_path_idx" ON "_conditions_v_rels" USING btree ("path");
  CREATE INDEX "_conditions_v_rels_herbs_id_idx" ON "_conditions_v_rels" USING btree ("herbs_id");
  CREATE INDEX "_conditions_v_rels_formulas_id_idx" ON "_conditions_v_rels" USING btree ("formulas_id");
  CREATE INDEX "_conditions_v_rels_symptoms_id_idx" ON "_conditions_v_rels" USING btree ("symptoms_id");
  CREATE INDEX "symptoms_common_causes_order_idx" ON "symptoms_common_causes" USING btree ("_order");
  CREATE INDEX "symptoms_common_causes_parent_id_idx" ON "symptoms_common_causes" USING btree ("_parent_id");
  CREATE INDEX "symptoms_title_idx" ON "symptoms" USING btree ("title");
  CREATE UNIQUE INDEX "symptoms_slug_idx" ON "symptoms" USING btree ("slug");
  CREATE INDEX "symptoms_updated_at_idx" ON "symptoms" USING btree ("updated_at");
  CREATE INDEX "symptoms_created_at_idx" ON "symptoms" USING btree ("created_at");
  CREATE INDEX "symptoms__status_idx" ON "symptoms" USING btree ("_status");
  CREATE INDEX "symptoms_rels_order_idx" ON "symptoms_rels" USING btree ("order");
  CREATE INDEX "symptoms_rels_parent_idx" ON "symptoms_rels" USING btree ("parent_id");
  CREATE INDEX "symptoms_rels_path_idx" ON "symptoms_rels" USING btree ("path");
  CREATE INDEX "symptoms_rels_conditions_id_idx" ON "symptoms_rels" USING btree ("conditions_id");
  CREATE INDEX "symptoms_rels_herbs_id_idx" ON "symptoms_rels" USING btree ("herbs_id");
  CREATE INDEX "_symptoms_v_version_common_causes_order_idx" ON "_symptoms_v_version_common_causes" USING btree ("_order");
  CREATE INDEX "_symptoms_v_version_common_causes_parent_id_idx" ON "_symptoms_v_version_common_causes" USING btree ("_parent_id");
  CREATE INDEX "_symptoms_v_parent_idx" ON "_symptoms_v" USING btree ("parent_id");
  CREATE INDEX "_symptoms_v_version_version_title_idx" ON "_symptoms_v" USING btree ("version_title");
  CREATE INDEX "_symptoms_v_version_version_slug_idx" ON "_symptoms_v" USING btree ("version_slug");
  CREATE INDEX "_symptoms_v_version_version_updated_at_idx" ON "_symptoms_v" USING btree ("version_updated_at");
  CREATE INDEX "_symptoms_v_version_version_created_at_idx" ON "_symptoms_v" USING btree ("version_created_at");
  CREATE INDEX "_symptoms_v_version_version__status_idx" ON "_symptoms_v" USING btree ("version__status");
  CREATE INDEX "_symptoms_v_created_at_idx" ON "_symptoms_v" USING btree ("created_at");
  CREATE INDEX "_symptoms_v_updated_at_idx" ON "_symptoms_v" USING btree ("updated_at");
  CREATE INDEX "_symptoms_v_latest_idx" ON "_symptoms_v" USING btree ("latest");
  CREATE INDEX "_symptoms_v_rels_order_idx" ON "_symptoms_v_rels" USING btree ("order");
  CREATE INDEX "_symptoms_v_rels_parent_idx" ON "_symptoms_v_rels" USING btree ("parent_id");
  CREATE INDEX "_symptoms_v_rels_path_idx" ON "_symptoms_v_rels" USING btree ("path");
  CREATE INDEX "_symptoms_v_rels_conditions_id_idx" ON "_symptoms_v_rels" USING btree ("conditions_id");
  CREATE INDEX "_symptoms_v_rels_herbs_id_idx" ON "_symptoms_v_rels" USING btree ("herbs_id");
  CREATE INDEX "practitioners_credentials_order_idx" ON "practitioners_credentials" USING btree ("_order");
  CREATE INDEX "practitioners_credentials_parent_id_idx" ON "practitioners_credentials" USING btree ("_parent_id");
  CREATE INDEX "practitioners_specialties_order_idx" ON "practitioners_specialties" USING btree ("_order");
  CREATE INDEX "practitioners_specialties_parent_id_idx" ON "practitioners_specialties" USING btree ("_parent_id");
  CREATE INDEX "practitioners_languages_order_idx" ON "practitioners_languages" USING btree ("_order");
  CREATE INDEX "practitioners_languages_parent_id_idx" ON "practitioners_languages" USING btree ("_parent_id");
  CREATE INDEX "practitioners_addresses_order_idx" ON "practitioners_addresses" USING btree ("_order");
  CREATE INDEX "practitioners_addresses_parent_id_idx" ON "practitioners_addresses" USING btree ("_parent_id");
  CREATE INDEX "practitioners_insurance_providers_order_idx" ON "practitioners_insurance_providers" USING btree ("_order");
  CREATE INDEX "practitioners_insurance_providers_parent_id_idx" ON "practitioners_insurance_providers" USING btree ("_parent_id");
  CREATE INDEX "practitioners_pricing_order_idx" ON "practitioners_pricing" USING btree ("_order");
  CREATE INDEX "practitioners_pricing_parent_id_idx" ON "practitioners_pricing" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "practitioners_user_idx" ON "practitioners" USING btree ("user_id");
  CREATE UNIQUE INDEX "practitioners_slug_idx" ON "practitioners" USING btree ("slug");
  CREATE INDEX "practitioners_profile_image_idx" ON "practitioners" USING btree ("profile_image_id");
  CREATE INDEX "practitioners_updated_at_idx" ON "practitioners" USING btree ("updated_at");
  CREATE INDEX "practitioners_created_at_idx" ON "practitioners" USING btree ("created_at");
  CREATE INDEX "practitioners_rels_order_idx" ON "practitioners_rels" USING btree ("order");
  CREATE INDEX "practitioners_rels_parent_idx" ON "practitioners_rels" USING btree ("parent_id");
  CREATE INDEX "practitioners_rels_path_idx" ON "practitioners_rels" USING btree ("path");
  CREATE INDEX "practitioners_rels_media_id_idx" ON "practitioners_rels" USING btree ("media_id");
  CREATE INDEX "practitioners_rels_modalities_id_idx" ON "practitioners_rels" USING btree ("modalities_id");
  CREATE INDEX "modalities_benefits_order_idx" ON "modalities_benefits" USING btree ("_order");
  CREATE INDEX "modalities_benefits_parent_id_idx" ON "modalities_benefits" USING btree ("_parent_id");
  CREATE INDEX "modalities_certification_bodies_order_idx" ON "modalities_certification_bodies" USING btree ("_order");
  CREATE INDEX "modalities_certification_bodies_parent_id_idx" ON "modalities_certification_bodies" USING btree ("_parent_id");
  CREATE INDEX "modalities_excels_at_order_idx" ON "modalities_excels_at" USING btree ("_order");
  CREATE INDEX "modalities_excels_at_parent_id_idx" ON "modalities_excels_at" USING btree ("_parent_id");
  CREATE INDEX "modalities_treatment_approaches_order_idx" ON "modalities_treatment_approaches" USING btree ("_order");
  CREATE INDEX "modalities_treatment_approaches_parent_id_idx" ON "modalities_treatment_approaches" USING btree ("_parent_id");
  CREATE INDEX "modalities_title_idx" ON "modalities" USING btree ("title");
  CREATE UNIQUE INDEX "modalities_slug_idx" ON "modalities" USING btree ("slug");
  CREATE INDEX "modalities_featured_image_idx" ON "modalities" USING btree ("featured_image_id");
  CREATE INDEX "modalities_updated_at_idx" ON "modalities" USING btree ("updated_at");
  CREATE INDEX "modalities_created_at_idx" ON "modalities" USING btree ("created_at");
  CREATE INDEX "modalities__status_idx" ON "modalities" USING btree ("_status");
  CREATE INDEX "modalities_rels_order_idx" ON "modalities_rels" USING btree ("order");
  CREATE INDEX "modalities_rels_parent_idx" ON "modalities_rels" USING btree ("parent_id");
  CREATE INDEX "modalities_rels_path_idx" ON "modalities_rels" USING btree ("path");
  CREATE INDEX "modalities_rels_conditions_id_idx" ON "modalities_rels" USING btree ("conditions_id");
  CREATE INDEX "modalities_rels_herbs_id_idx" ON "modalities_rels" USING btree ("herbs_id");
  CREATE INDEX "_modalities_v_version_benefits_order_idx" ON "_modalities_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_modalities_v_version_benefits_parent_id_idx" ON "_modalities_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_modalities_v_version_certification_bodies_order_idx" ON "_modalities_v_version_certification_bodies" USING btree ("_order");
  CREATE INDEX "_modalities_v_version_certification_bodies_parent_id_idx" ON "_modalities_v_version_certification_bodies" USING btree ("_parent_id");
  CREATE INDEX "_modalities_v_version_excels_at_order_idx" ON "_modalities_v_version_excels_at" USING btree ("_order");
  CREATE INDEX "_modalities_v_version_excels_at_parent_id_idx" ON "_modalities_v_version_excels_at" USING btree ("_parent_id");
  CREATE INDEX "_modalities_v_version_treatment_approaches_order_idx" ON "_modalities_v_version_treatment_approaches" USING btree ("_order");
  CREATE INDEX "_modalities_v_version_treatment_approaches_parent_id_idx" ON "_modalities_v_version_treatment_approaches" USING btree ("_parent_id");
  CREATE INDEX "_modalities_v_parent_idx" ON "_modalities_v" USING btree ("parent_id");
  CREATE INDEX "_modalities_v_version_version_title_idx" ON "_modalities_v" USING btree ("version_title");
  CREATE INDEX "_modalities_v_version_version_slug_idx" ON "_modalities_v" USING btree ("version_slug");
  CREATE INDEX "_modalities_v_version_version_featured_image_idx" ON "_modalities_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_modalities_v_version_version_updated_at_idx" ON "_modalities_v" USING btree ("version_updated_at");
  CREATE INDEX "_modalities_v_version_version_created_at_idx" ON "_modalities_v" USING btree ("version_created_at");
  CREATE INDEX "_modalities_v_version_version__status_idx" ON "_modalities_v" USING btree ("version__status");
  CREATE INDEX "_modalities_v_created_at_idx" ON "_modalities_v" USING btree ("created_at");
  CREATE INDEX "_modalities_v_updated_at_idx" ON "_modalities_v" USING btree ("updated_at");
  CREATE INDEX "_modalities_v_latest_idx" ON "_modalities_v" USING btree ("latest");
  CREATE INDEX "_modalities_v_rels_order_idx" ON "_modalities_v_rels" USING btree ("order");
  CREATE INDEX "_modalities_v_rels_parent_idx" ON "_modalities_v_rels" USING btree ("parent_id");
  CREATE INDEX "_modalities_v_rels_path_idx" ON "_modalities_v_rels" USING btree ("path");
  CREATE INDEX "_modalities_v_rels_conditions_id_idx" ON "_modalities_v_rels" USING btree ("conditions_id");
  CREATE INDEX "_modalities_v_rels_herbs_id_idx" ON "_modalities_v_rels" USING btree ("herbs_id");
  CREATE INDEX "reviews_author_idx" ON "reviews" USING btree ("author_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_herbs_id_idx" ON "reviews_rels" USING btree ("herbs_id");
  CREATE INDEX "reviews_rels_formulas_id_idx" ON "reviews_rels" USING btree ("formulas_id");
  CREATE INDEX "reviews_rels_practitioners_id_idx" ON "reviews_rels" USING btree ("practitioners_id");
  CREATE INDEX "reviews_rels_modalities_id_idx" ON "reviews_rels" USING btree ("modalities_id");
  CREATE INDEX "grok_insights_recommendations_order_idx" ON "grok_insights_recommendations" USING btree ("_order");
  CREATE INDEX "grok_insights_recommendations_parent_id_idx" ON "grok_insights_recommendations" USING btree ("_parent_id");
  CREATE INDEX "grok_insights_follow_up_questions_order_idx" ON "grok_insights_follow_up_questions" USING btree ("_order");
  CREATE INDEX "grok_insights_follow_up_questions_parent_id_idx" ON "grok_insights_follow_up_questions" USING btree ("_parent_id");
  CREATE INDEX "grok_insights_user_idx" ON "grok_insights" USING btree ("user_id");
  CREATE INDEX "grok_insights_session_id_idx" ON "grok_insights" USING btree ("session_id");
  CREATE INDEX "grok_insights_updated_at_idx" ON "grok_insights" USING btree ("updated_at");
  CREATE INDEX "grok_insights_created_at_idx" ON "grok_insights" USING btree ("created_at");
  CREATE INDEX "grok_insights_rels_order_idx" ON "grok_insights_rels" USING btree ("order");
  CREATE INDEX "grok_insights_rels_parent_idx" ON "grok_insights_rels" USING btree ("parent_id");
  CREATE INDEX "grok_insights_rels_path_idx" ON "grok_insights_rels" USING btree ("path");
  CREATE INDEX "grok_insights_rels_herbs_id_idx" ON "grok_insights_rels" USING btree ("herbs_id");
  CREATE INDEX "grok_insights_rels_conditions_id_idx" ON "grok_insights_rels" USING btree ("conditions_id");
  CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");
  CREATE INDEX "audit_logs_user_email_idx" ON "audit_logs" USING btree ("user_email");
  CREATE INDEX "audit_logs_session_id_idx" ON "audit_logs" USING btree ("session_id");
  CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_resource_id_idx" ON "audit_logs" USING btree ("resource_id");
  CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs" USING btree ("resource_type");
  CREATE INDEX "audit_logs_ip_address_idx" ON "audit_logs" USING btree ("ip_address");
  CREATE INDEX "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE INDEX "import_logs_type_idx" ON "import_logs" USING btree ("type");
  CREATE INDEX "import_logs_status_idx" ON "import_logs" USING btree ("status");
  CREATE INDEX "import_logs_updated_at_idx" ON "import_logs" USING btree ("updated_at");
  CREATE INDEX "import_logs_created_at_idx" ON "import_logs" USING btree ("created_at");
  CREATE INDEX "validation_reports_issues_order_idx" ON "validation_reports_issues" USING btree ("_order");
  CREATE INDEX "validation_reports_issues_parent_id_idx" ON "validation_reports_issues" USING btree ("_parent_id");
  CREATE INDEX "validation_reports_type_idx" ON "validation_reports" USING btree ("type");
  CREATE INDEX "validation_reports_collection_type_idx" ON "validation_reports" USING btree ("collection_type");
  CREATE INDEX "validation_reports_document_id_idx" ON "validation_reports" USING btree ("document_id");
  CREATE INDEX "validation_reports_severity_idx" ON "validation_reports" USING btree ("severity");
  CREATE INDEX "validation_reports_updated_at_idx" ON "validation_reports" USING btree ("updated_at");
  CREATE INDEX "validation_reports_created_at_idx" ON "validation_reports" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_herbs_id_idx" ON "payload_locked_documents_rels" USING btree ("herbs_id");
  CREATE INDEX "payload_locked_documents_rels_formulas_id_idx" ON "payload_locked_documents_rels" USING btree ("formulas_id");
  CREATE INDEX "payload_locked_documents_rels_conditions_id_idx" ON "payload_locked_documents_rels" USING btree ("conditions_id");
  CREATE INDEX "payload_locked_documents_rels_symptoms_id_idx" ON "payload_locked_documents_rels" USING btree ("symptoms_id");
  CREATE INDEX "payload_locked_documents_rels_practitioners_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioners_id");
  CREATE INDEX "payload_locked_documents_rels_modalities_id_idx" ON "payload_locked_documents_rels" USING btree ("modalities_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_grok_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("grok_insights_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_import_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("import_logs_id");
  CREATE INDEX "payload_locked_documents_rels_validation_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("validation_reports_id");
  CREATE INDEX "payload_locked_documents_rels_payload_kv_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_kv_id");
  CREATE INDEX "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "herbs_common_names" CASCADE;
  DROP TABLE "herbs_synonyms" CASCADE;
  DROP TABLE "herbs_native_region" CASCADE;
  DROP TABLE "herbs_active_constituents" CASCADE;
  DROP TABLE "herbs_clinical_studies" CASCADE;
  DROP TABLE "herbs_recommended_dosage" CASCADE;
  DROP TABLE "herbs_preparation_methods" CASCADE;
  DROP TABLE "herbs_drug_interactions" CASCADE;
  DROP TABLE "herbs_images" CASCADE;
  DROP TABLE "herbs_videos" CASCADE;
  DROP TABLE "herbs_search_tags" CASCADE;
  DROP TABLE "herbs" CASCADE;
  DROP TABLE "herbs_rels" CASCADE;
  DROP TABLE "_herbs_v_version_common_names" CASCADE;
  DROP TABLE "_herbs_v_version_synonyms" CASCADE;
  DROP TABLE "_herbs_v_version_native_region" CASCADE;
  DROP TABLE "_herbs_v_version_active_constituents" CASCADE;
  DROP TABLE "_herbs_v_version_clinical_studies" CASCADE;
  DROP TABLE "_herbs_v_version_recommended_dosage" CASCADE;
  DROP TABLE "_herbs_v_version_preparation_methods" CASCADE;
  DROP TABLE "_herbs_v_version_drug_interactions" CASCADE;
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
  DROP TABLE "symptoms_common_causes" CASCADE;
  DROP TABLE "symptoms" CASCADE;
  DROP TABLE "symptoms_rels" CASCADE;
  DROP TABLE "_symptoms_v_version_common_causes" CASCADE;
  DROP TABLE "_symptoms_v" CASCADE;
  DROP TABLE "_symptoms_v_rels" CASCADE;
  DROP TABLE "practitioners_credentials" CASCADE;
  DROP TABLE "practitioners_specialties" CASCADE;
  DROP TABLE "practitioners_languages" CASCADE;
  DROP TABLE "practitioners_addresses" CASCADE;
  DROP TABLE "practitioners_insurance_providers" CASCADE;
  DROP TABLE "practitioners_pricing" CASCADE;
  DROP TABLE "practitioners" CASCADE;
  DROP TABLE "practitioners_rels" CASCADE;
  DROP TABLE "modalities_benefits" CASCADE;
  DROP TABLE "modalities_certification_bodies" CASCADE;
  DROP TABLE "modalities_excels_at" CASCADE;
  DROP TABLE "modalities_treatment_approaches" CASCADE;
  DROP TABLE "modalities" CASCADE;
  DROP TABLE "modalities_rels" CASCADE;
  DROP TABLE "_modalities_v_version_benefits" CASCADE;
  DROP TABLE "_modalities_v_version_certification_bodies" CASCADE;
  DROP TABLE "_modalities_v_version_excels_at" CASCADE;
  DROP TABLE "_modalities_v_version_treatment_approaches" CASCADE;
  DROP TABLE "_modalities_v" CASCADE;
  DROP TABLE "_modalities_v_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "grok_insights_recommendations" CASCADE;
  DROP TABLE "grok_insights_follow_up_questions" CASCADE;
  DROP TABLE "grok_insights" CASCADE;
  DROP TABLE "grok_insights_rels" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "import_logs" CASCADE;
  DROP TABLE "validation_reports_issues" CASCADE;
  DROP TABLE "validation_reports" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "trefle_import_state" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_preferences_language";
  DROP TYPE "public"."enum_media_license";
  DROP TYPE "public"."enum_herbs_common_names_language";
  DROP TYPE "public"."enum_herbs_synonyms_status";
  DROP TYPE "public"."enum_herbs_drug_interactions_interaction_type";
  DROP TYPE "public"."enum_herbs_videos_platform";
  DROP TYPE "public"."enum_herbs_search_tags_category";
  DROP TYPE "public"."enum_herbs_botanical_info_plant_type";
  DROP TYPE "public"."enum_herbs_cultivation_sunlight_requirements";
  DROP TYPE "public"."enum_herbs_cultivation_water_requirements";
  DROP TYPE "public"."enum_herbs_conservation_status";
  DROP TYPE "public"."enum_herbs_tcm_properties_tcm_temperature";
  DROP TYPE "public"."enum_herbs_safety_info_pregnancy_safety";
  DROP TYPE "public"."enum_herbs_safety_info_breastfeeding_safety";
  DROP TYPE "public"."enum_herbs_safety_info_children_safety";
  DROP TYPE "public"."enum_herbs_peer_review_status";
  DROP TYPE "public"."enum_herbs_status";
  DROP TYPE "public"."enum__herbs_v_version_common_names_language";
  DROP TYPE "public"."enum__herbs_v_version_synonyms_status";
  DROP TYPE "public"."enum__herbs_v_version_drug_interactions_interaction_type";
  DROP TYPE "public"."enum__herbs_v_version_videos_platform";
  DROP TYPE "public"."enum__herbs_v_version_search_tags_category";
  DROP TYPE "public"."enum__herbs_v_version_botanical_info_plant_type";
  DROP TYPE "public"."enum__herbs_v_version_cultivation_sunlight_requirements";
  DROP TYPE "public"."enum__herbs_v_version_cultivation_water_requirements";
  DROP TYPE "public"."enum__herbs_v_version_conservation_status";
  DROP TYPE "public"."enum__herbs_v_version_tcm_properties_tcm_temperature";
  DROP TYPE "public"."enum__herbs_v_version_safety_info_pregnancy_safety";
  DROP TYPE "public"."enum__herbs_v_version_safety_info_breastfeeding_safety";
  DROP TYPE "public"."enum__herbs_v_version_safety_info_children_safety";
  DROP TYPE "public"."enum__herbs_v_version_peer_review_status";
  DROP TYPE "public"."enum__herbs_v_version_status";
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
  DROP TYPE "public"."enum_conditions_symptoms_frequency";
  DROP TYPE "public"."enum_conditions_severity";
  DROP TYPE "public"."enum_conditions_category";
  DROP TYPE "public"."enum_conditions_status";
  DROP TYPE "public"."enum__conditions_v_version_symptoms_frequency";
  DROP TYPE "public"."enum__conditions_v_version_severity";
  DROP TYPE "public"."enum__conditions_v_version_category";
  DROP TYPE "public"."enum__conditions_v_version_status";
  DROP TYPE "public"."enum_symptoms_common_causes_likelihood";
  DROP TYPE "public"."enum_symptoms_severity";
  DROP TYPE "public"."enum_symptoms_status";
  DROP TYPE "public"."enum__symptoms_v_version_common_causes_likelihood";
  DROP TYPE "public"."enum__symptoms_v_version_severity";
  DROP TYPE "public"."enum__symptoms_v_version_status";
  DROP TYPE "public"."enum_practitioners_languages_proficiency";
  DROP TYPE "public"."enum_practitioners_addresses_address_type";
  DROP TYPE "public"."enum_practitioners_verification_status";
  DROP TYPE "public"."enum_modalities_status";
  DROP TYPE "public"."enum__modalities_v_version_status";
  DROP TYPE "public"."enum_reviews_reviewed_entity_type";
  DROP TYPE "public"."enum_reviews_moderation_status";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_audit_logs_method";
  DROP TYPE "public"."enum_audit_logs_severity";
  DROP TYPE "public"."enum_import_logs_type";
  DROP TYPE "public"."enum_import_logs_status";
  DROP TYPE "public"."enum_validation_reports_issues_severity";
  DROP TYPE "public"."enum_validation_reports_severity";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_trefle_import_state_import_status";`)
}
