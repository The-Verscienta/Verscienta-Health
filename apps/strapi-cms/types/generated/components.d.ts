import type { Schema, Struct } from '@strapi/strapi';

export interface ConditionSymptomItem extends Struct.ComponentSchema {
  collectionName: 'components_condition_symptom_items';
  info: {
    displayName: 'Symptom Item';
    icon: 'thermometer';
  };
  attributes: {
    symptom: Schema.Attribute.String;
  };
}

export interface FormulaIngredient extends Struct.ComponentSchema {
  collectionName: 'components_formula_ingredients';
  info: {
    displayName: 'Formula Ingredient';
    icon: 'prescription-bottle';
  };
  attributes: {
    herb: Schema.Attribute.Relation<'oneToOne', 'api::herb.herb'>;
    percentage: Schema.Attribute.Decimal;
    quantity: Schema.Attribute.Decimal & Schema.Attribute.Required;
    role: Schema.Attribute.Enumeration<
      ['chief', 'deputy', 'assistant', 'envoy']
    >;
    unit: Schema.Attribute.Enumeration<
      ['g', 'mg', 'oz', 'ml', 'tsp', 'tbsp', 'drops', 'parts']
    > &
      Schema.Attribute.Required;
  };
}

export interface FormulaUseCase extends Struct.ComponentSchema {
  collectionName: 'components_formula_use_cases';
  info: {
    displayName: 'Use Case';
    icon: 'check';
  };
  attributes: {
    useCase: Schema.Attribute.String;
  };
}

export interface GrokFollowUpQuestion extends Struct.ComponentSchema {
  collectionName: 'components_grok_follow_up_questions';
  info: {
    displayName: 'Follow-up Question';
    icon: 'question';
  };
  attributes: {
    question: Schema.Attribute.String;
  };
}

export interface GrokRecommendation extends Struct.ComponentSchema {
  collectionName: 'components_grok_recommendations';
  info: {
    displayName: 'Recommendation';
    icon: 'lightbulb';
  };
  attributes: {
    confidence: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    entityId: Schema.Attribute.String;
    reasoning: Schema.Attribute.Text;
    type: Schema.Attribute.Enumeration<
      ['herb', 'formula', 'modality', 'practitioner', 'lifestyle']
    >;
  };
}

export interface HerbActiveConstituent extends Struct.ComponentSchema {
  collectionName: 'components_herb_active_constituents';
  info: {
    displayName: 'Active Constituent';
    icon: 'flask';
  };
  attributes: {
    compoundClass: Schema.Attribute.String;
    compoundName: Schema.Attribute.String & Schema.Attribute.Required;
    effects: Schema.Attribute.Text;
    percentage: Schema.Attribute.Decimal;
  };
}

export interface HerbBotanicalInfo extends Struct.ComponentSchema {
  collectionName: 'components_herb_botanical_infos';
  info: {
    displayName: 'Botanical Information';
    icon: 'seedling';
  };
  attributes: {
    botanicalDescription: Schema.Attribute.RichText;
    family: Schema.Attribute.String;
    genus: Schema.Attribute.String;
    habitat: Schema.Attribute.Text;
    partsUsed: Schema.Attribute.JSON;
    plantType: Schema.Attribute.Enumeration<
      [
        'herb',
        'shrub',
        'tree',
        'vine',
        'grass',
        'fern',
        'moss',
        'fungus',
        'lichen',
      ]
    >;
    scientificName: Schema.Attribute.String & Schema.Attribute.Required;
    species: Schema.Attribute.String;
  };
}

export interface HerbClinicalStudy extends Struct.ComponentSchema {
  collectionName: 'components_herb_clinical_studies';
  info: {
    displayName: 'Clinical Study';
    icon: 'search';
  };
  attributes: {
    conclusion: Schema.Attribute.Text;
    doi: Schema.Attribute.String;
    summary: Schema.Attribute.RichText;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
    year: Schema.Attribute.Integer;
  };
}

export interface HerbCommonName extends Struct.ComponentSchema {
  collectionName: 'components_herb_common_names';
  info: {
    displayName: 'Common Name';
    icon: 'language';
  };
  attributes: {
    language: Schema.Attribute.Enumeration<
      ['en', 'zh-pinyin', 'zh', 'es', 'native', 'other']
    > &
      Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    region: Schema.Attribute.String;
  };
}

export interface HerbCultivation extends Struct.ComponentSchema {
  collectionName: 'components_herb_cultivations';
  info: {
    displayName: 'Cultivation Details';
    icon: 'tractor';
  };
  attributes: {
    climateZone: Schema.Attribute.String;
    growingSeason: Schema.Attribute.String;
    hardinessZone: Schema.Attribute.String;
    propagationMethod: Schema.Attribute.Text;
    soilType: Schema.Attribute.String;
    sunlightNeeds: Schema.Attribute.Enumeration<
      ['full_sun', 'partial_shade', 'full_shade']
    >;
    waterNeeds: Schema.Attribute.Enumeration<['low', 'moderate', 'high']>;
  };
}

export interface HerbDosage extends Struct.ComponentSchema {
  collectionName: 'components_herb_dosages';
  info: {
    displayName: 'Recommended Dosage';
    icon: 'capsules';
  };
  attributes: {
    amount: Schema.Attribute.String & Schema.Attribute.Required;
    duration: Schema.Attribute.String;
    form: Schema.Attribute.Enumeration<
      ['tincture', 'tea', 'decoction', 'capsule', 'tablet', 'powder', 'extract']
    > &
      Schema.Attribute.Required;
    frequency: Schema.Attribute.String;
    notes: Schema.Attribute.Text;
    population: Schema.Attribute.String;
  };
}

export interface HerbDrugInteraction extends Struct.ComponentSchema {
  collectionName: 'components_herb_drug_interactions';
  info: {
    displayName: 'Drug Interaction';
    icon: 'exclamation-triangle';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    drugName: Schema.Attribute.String & Schema.Attribute.Required;
    interactionType: Schema.Attribute.Enumeration<
      ['major', 'moderate', 'minor']
    > &
      Schema.Attribute.Required;
    mechanism: Schema.Attribute.Text;
  };
}

export interface HerbHerbImage extends Struct.ComponentSchema {
  collectionName: 'components_herb_images';
  info: {
    displayName: 'Herb Image';
    icon: 'image';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imageType: Schema.Attribute.Enumeration<
      [
        'whole_plant',
        'flower',
        'leaf',
        'root',
        'bark',
        'seed',
        'dried',
        'habitat',
        'preparation',
      ]
    >;
  };
}

export interface HerbNativeRegion extends Struct.ComponentSchema {
  collectionName: 'components_herb_native_regions';
  info: {
    displayName: 'Native Region';
    icon: 'globe';
  };
  attributes: {
    region: Schema.Attribute.String;
  };
}

export interface HerbPreparationMethod extends Struct.ComponentSchema {
  collectionName: 'components_herb_preparation_methods';
  info: {
    displayName: 'Preparation Method';
    icon: 'coffee';
  };
  attributes: {
    instructions: Schema.Attribute.RichText & Schema.Attribute.Required;
    methodType: Schema.Attribute.Enumeration<
      [
        'decoction',
        'infusion',
        'tincture',
        'powder',
        'poultice',
        'extract',
        'oil_infusion',
      ]
    > &
      Schema.Attribute.Required;
    storage: Schema.Attribute.Text;
    time: Schema.Attribute.String;
    yield: Schema.Attribute.String;
  };
}

export interface HerbSafetyInfo extends Struct.ComponentSchema {
  collectionName: 'components_herb_safety_infos';
  info: {
    displayName: 'Safety Information';
    icon: 'shield';
  };
  attributes: {
    allergenicPotential: Schema.Attribute.Enumeration<
      ['none', 'low', 'moderate', 'high']
    >;
    contraindications: Schema.Attribute.RichText;
    sideEffects: Schema.Attribute.RichText;
    toxicityLevel: Schema.Attribute.Enumeration<
      ['none', 'low', 'moderate', 'high', 'severe']
    >;
    toxicityNotes: Schema.Attribute.RichText;
  };
}

export interface HerbSearchTag extends Struct.ComponentSchema {
  collectionName: 'components_herb_search_tags';
  info: {
    displayName: 'Search Tag';
    icon: 'hashtag';
  };
  attributes: {
    tag: Schema.Attribute.String;
  };
}

export interface HerbSynonym extends Struct.ComponentSchema {
  collectionName: 'components_herb_synonyms';
  info: {
    displayName: 'Scientific Synonym';
    icon: 'file';
  };
  attributes: {
    synonym: Schema.Attribute.String;
  };
}

export interface HerbTcmProperties extends Struct.ComponentSchema {
  collectionName: 'components_herb_tcm_properties';
  info: {
    displayName: 'TCM Properties';
    icon: 'yin-yang';
  };
  attributes: {
    tcmCategory: Schema.Attribute.String;
    tcmFunctions: Schema.Attribute.RichText;
    tcmMeridians: Schema.Attribute.JSON;
    tcmTaste: Schema.Attribute.JSON;
    tcmTemperature: Schema.Attribute.Enumeration<
      ['hot', 'warm', 'neutral', 'cool', 'cold']
    >;
    tcmTraditionalUses: Schema.Attribute.RichText;
  };
}

export interface HerbVideo extends Struct.ComponentSchema {
  collectionName: 'components_herb_videos';
  info: {
    displayName: 'Video';
    icon: 'youtube';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    youtubeId: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ModalityBenefit extends Struct.ComponentSchema {
  collectionName: 'components_modality_benefits';
  info: {
    displayName: 'Benefit';
    icon: 'star';
  };
  attributes: {
    benefit: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
  };
}

export interface ModalityCertificationBody extends Struct.ComponentSchema {
  collectionName: 'components_modality_certification_bodies';
  info: {
    displayName: 'Certification Body';
    icon: 'certificate';
  };
  attributes: {
    organization: Schema.Attribute.String;
  };
}

export interface ModalityExcelsAt extends Struct.ComponentSchema {
  collectionName: 'components_modality_excels_ats';
  info: {
    displayName: 'Excels At Condition';
    icon: 'check';
  };
  attributes: {
    condition: Schema.Attribute.String;
  };
}

export interface ModalityTreatmentApproach extends Struct.ComponentSchema {
  collectionName: 'components_modality_treatment_approaches';
  info: {
    displayName: 'Treatment Approach';
    icon: 'heal';
  };
  attributes: {
    approach: Schema.Attribute.String;
  };
}

export interface PractitionerAddress extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_addresses';
  info: {
    displayName: 'Address';
    icon: 'map-marker';
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'United States'>;
    latitude: Schema.Attribute.Decimal;
    longitude: Schema.Attribute.Decimal;
    state: Schema.Attribute.String;
    street: Schema.Attribute.String;
    zipCode: Schema.Attribute.String;
  };
}

export interface PractitionerCredential extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_credentials';
  info: {
    displayName: 'Credential';
    icon: 'award';
  };
  attributes: {
    credential: Schema.Attribute.String;
  };
}

export interface PractitionerInsuranceProvider extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_insurance_providers';
  info: {
    displayName: 'Insurance Provider';
    icon: 'hospital';
  };
  attributes: {
    provider: Schema.Attribute.String;
  };
}

export interface PractitionerLanguage extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_languages';
  info: {
    displayName: 'Language';
    icon: 'language';
  };
  attributes: {
    language: Schema.Attribute.String;
  };
}

export interface PractitionerPricing extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_pricings';
  info: {
    displayName: 'Pricing';
    icon: 'dollar-sign';
  };
  attributes: {
    currency: Schema.Attribute.Enumeration<
      ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    > &
      Schema.Attribute.DefaultTo<'USD'>;
    followUp: Schema.Attribute.Decimal;
    initialConsult: Schema.Attribute.Decimal;
    notes: Schema.Attribute.Text;
  };
}

export interface PractitionerSpecialty extends Struct.ComponentSchema {
  collectionName: 'components_practitioner_specialties';
  info: {
    displayName: 'Specialty';
    icon: 'star';
  };
  attributes: {
    specialty: Schema.Attribute.String;
  };
}

export interface SymptomCommonCause extends Struct.ComponentSchema {
  collectionName: 'components_symptom_common_causes';
  info: {
    description: 'Common causes of symptoms';
    displayName: 'Common Cause';
    icon: 'bulletList';
  };
  attributes: {
    cause: Schema.Attribute.String;
  };
}

export interface ValidationIssue extends Struct.ComponentSchema {
  collectionName: 'components_validation_issues';
  info: {
    displayName: 'Validation Issue';
    icon: 'exclamation-triangle';
  };
  attributes: {
    field: Schema.Attribute.String;
    herbId: Schema.Attribute.String;
    herbName: Schema.Attribute.String;
    issue: Schema.Attribute.Text & Schema.Attribute.Required;
    resolved: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    resolvedAt: Schema.Attribute.DateTime;
    resolvedBy: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    severity: Schema.Attribute.Enumeration<['error', 'warning', 'info']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'warning'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'condition.symptom-item': ConditionSymptomItem;
      'formula.ingredient': FormulaIngredient;
      'formula.use-case': FormulaUseCase;
      'grok.follow-up-question': GrokFollowUpQuestion;
      'grok.recommendation': GrokRecommendation;
      'herb.active-constituent': HerbActiveConstituent;
      'herb.botanical-info': HerbBotanicalInfo;
      'herb.clinical-study': HerbClinicalStudy;
      'herb.common-name': HerbCommonName;
      'herb.cultivation': HerbCultivation;
      'herb.dosage': HerbDosage;
      'herb.drug-interaction': HerbDrugInteraction;
      'herb.herb-image': HerbHerbImage;
      'herb.native-region': HerbNativeRegion;
      'herb.preparation-method': HerbPreparationMethod;
      'herb.safety-info': HerbSafetyInfo;
      'herb.search-tag': HerbSearchTag;
      'herb.synonym': HerbSynonym;
      'herb.tcm-properties': HerbTcmProperties;
      'herb.video': HerbVideo;
      'modality.benefit': ModalityBenefit;
      'modality.certification-body': ModalityCertificationBody;
      'modality.excels-at': ModalityExcelsAt;
      'modality.treatment-approach': ModalityTreatmentApproach;
      'practitioner.address': PractitionerAddress;
      'practitioner.credential': PractitionerCredential;
      'practitioner.insurance-provider': PractitionerInsuranceProvider;
      'practitioner.language': PractitionerLanguage;
      'practitioner.pricing': PractitionerPricing;
      'practitioner.specialty': PractitionerSpecialty;
      'symptom.common-cause': SymptomCommonCause;
      'validation.issue': ValidationIssue;
    }
  }
}
