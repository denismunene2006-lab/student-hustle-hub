const KENYAN_PHONE_DISPLAY_PREFIX = '+254';
const KENYAN_MOBILE_BODY_PATTERN = /^(?:1|7)\d{8}$/;

const getKenyanPhoneBody = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const compact = raw.replace(/\s+/g, '');
  if (compact.startsWith('+') && !compact.startsWith(KENYAN_PHONE_DISPLAY_PREFIX)) {
    return '';
  }

  let digits = compact.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('254')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return KENYAN_MOBILE_BODY_PATTERN.test(digits) ? digits : '';
};

const normalizeKenyanPhone = (value) => {
  const body = getKenyanPhoneBody(value);
  return body ? `${KENYAN_PHONE_DISPLAY_PREFIX}${body}` : '';
};

const toWhatsAppNumber = (value) => {
  const normalized = normalizeKenyanPhone(value);
  return normalized ? normalized.replace(/\D/g, '') : '';
};

module.exports = {
  normalizeKenyanPhone,
  toWhatsAppNumber,
};
