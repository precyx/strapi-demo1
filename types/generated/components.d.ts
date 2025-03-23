import type { Schema, Struct } from '@strapi/strapi';

export interface PaymentOptionPagomovil extends Struct.ComponentSchema {
  collectionName: 'components_payment_option_pagomovils';
  info: {
    description: '';
    displayName: 'pagomovil';
  };
  attributes: {
    amount: Schema.Attribute.String;
    bankReference: Schema.Attribute.String;
    senderPhone: Schema.Attribute.String;
  };
}

export interface PaymentOptionPaypal extends Struct.ComponentSchema {
  collectionName: 'components_payment_option_paypals';
  info: {
    displayName: 'paypal';
  };
  attributes: {
    orderId: Schema.Attribute.String;
  };
}

export interface SharedFormulaItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_formula_items';
  info: {
    description: '';
    displayName: 'FormulaItem';
    icon: 'feather';
  };
  attributes: {
    category: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    percentage: Schema.Attribute.String;
    title: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedVideos extends Struct.ComponentSchema {
  collectionName: 'components_shared_videos';
  info: {
    displayName: 'videos';
    icon: 'play';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'payment-option.pagomovil': PaymentOptionPagomovil;
      'payment-option.paypal': PaymentOptionPaypal;
      'shared.formula-item': SharedFormulaItem;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.videos': SharedVideos;
    }
  }
}
