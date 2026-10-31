// Public factual information only. Never store credentials or customer data here.
// null means unconfirmed. Completing these fields does NOT approve publication.
// Prices, packages, shipping fee and merchantName remain in config.js.
export const legalBusiness = Object.freeze({
  TAX_IDENTIFICATION: null,
  BUSINESS_DOMICILE: null,
  BUSINESS_ADDRESS: null,
  CUSTOMER_SUPPORT_EMAIL: null,
  CUSTOMER_SUPPORT_PHONE: null,
  CUSTOMER_SUPPORT_HOURS: null,
  PRIVACY_CONTACT_EMAIL: null,
  PRIVACY_RESPONSIBLE_AREA: null,
  SHIPPING_COVERAGE: null,
  LOGISTICS_PROVIDER: null,
  DELIVERY_TIMEFRAMES: null,
  DELIVERY_INCIDENT_PROCESS: null,
  COD_PAYMENT_METHODS: null,
  RETURNS_CONTACT: null,
  RETURNS_ADDRESS: null,
  REFUND_METHODS: null,
  PROMOTION_VALIDITY: null,
  PROCESSORS_AND_LOCATIONS: null,
  DATA_RETENTION_CRITERIA: null,
  DATABASE_DURATION: null,
  POLICY_EFFECTIVE_DATE: null,
});

export const legalDraftVersion = 'borrador-2026-10-29';

// Plain text, never a speculative mailto:, telephone or external link.
export function legalFact(key, commerce, business = legalBusiness) {
  const value = key === 'LEGAL_BUSINESS_NAME' ? commerce.merchantName : business[key];
  return typeof value === 'string' && value.trim() ? value.trim() : `[${key}] (pendiente de confirmar)`;
}
