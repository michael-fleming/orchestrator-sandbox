'use strict';

const express = require('express');

const router = express.Router();

// In-memory customer records. Swap this out for a real data source
// (database / service call) when one is wired up.
const customers = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', country: 'GB', status: 'active' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', country: 'US', status: 'active' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', country: 'GB', status: 'inactive' }
];

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value, fallback, max) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  if (typeof max === 'number' && parsed > max) {
    return max;
  }

  return parsed;
}

function matches(customer, query) {
  if (query.id !== undefined && String(customer.id) !== String(query.id)) {
    return false;
  }

  if (query.status !== undefined &&
      customer.status.toLowerCase() !== String(query.status).toLowerCase()) {
    return false;
  }

  if (query.country !== undefined &&
      customer.country.toLowerCase() !== String(query.country).toLowerCase()) {
    return false;
  }

  if (query.email !== undefined &&
      customer.email.toLowerCase() !== String(query.email).toLowerCase()) {
    return false;
  }

  if (query.name !== undefined &&
      !customer.name.toLowerCase().includes(String(query.name).toLowerCase())) {
    return false;
  }

  return true;
}

// GET /customers
// Supported query parameters: id, name (partial match), email, country,
// status, limit, offset.
router.get('/', (req, res) => {
  const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const offset = parsePositiveInt(req.query.offset, 0);

  if (limit === null || offset === null) {
    return res.status(400).json({
      error: 'limit and offset must be non-negative integers'
    });
  }

  const filtered = customers.filter((customer) => matches(customer, req.query));

  return res.json({
    total: filtered.length,
    limit,
    offset,
    data: filtered.slice(offset, offset + limit)
  });
});

// GET /customers/:id
router.get('/:id', (req, res) => {
  const customer = customers.find((entry) => String(entry.id) === String(req.params.id));

  if (!customer) {
    return res.status(404).json({ error: 'customer not found' });
  }

  return res.json(customer);
});

module.exports = router;

