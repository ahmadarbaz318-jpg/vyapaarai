// Simple, dependency-free input validators.
export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveNumber(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function validateRegisterInput({ businessName, ownerName, email, password }) {
  const errors = [];
  if (!isNonEmptyString(businessName)) errors.push('Business name is required.');
  if (!isNonEmptyString(ownerName)) errors.push('Owner name is required.');
  if (!isValidEmail(email)) errors.push('A valid email is required.');
  if (!isNonEmptyString(password) || password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
}

export function validateProductInput({ name, category, price, cost, quantity }) {
  const errors = [];
  if (!isNonEmptyString(name)) errors.push('Product name is required.');
  if (!isNonEmptyString(category)) errors.push('Category is required.');
  if (typeof price !== 'number' || price <= 0) errors.push('Price must be a positive number.');
  if (typeof cost !== 'number' || cost < 0) errors.push('Cost must be a non-negative number.');
  if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) errors.push('Quantity must be a non-negative whole number.');
  return errors;
}
