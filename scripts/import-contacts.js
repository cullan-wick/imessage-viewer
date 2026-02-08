#!/usr/bin/env node

/**
 * Import contacts from a vCard (.vcf) file
 * Usage: node scripts/import-contacts.js /path/to/contacts.vcf
 */

const fs = require('fs');
const path = require('path');

const vcfPath = process.argv[2];

if (!vcfPath) {
  console.error('Usage: node scripts/import-contacts.js /path/to/contacts.vcf');
  process.exit(1);
}

if (!fs.existsSync(vcfPath)) {
  console.error(`File not found: ${vcfPath}`);
  process.exit(1);
}

const vcfContent = fs.readFileSync(vcfPath, 'utf-8');
const contacts = {};

// Parse vCard format (simple parser)
const vCards = vcfContent.split('END:VCARD');

for (const vCard of vCards) {
  if (!vCard.trim()) continue;

  let name = null;
  const phones = [];
  const emails = [];

  const lines = vCard.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Get name
    if (trimmed.startsWith('FN:')) {
      name = trimmed.substring(3).trim();
    }

    // Get phone numbers
    if (trimmed.startsWith('TEL')) {
      const phoneMatch = trimmed.match(/:([\d\+\-\(\)\s]+)$/);
      if (phoneMatch) {
        // Clean up phone number - remove spaces, dashes, parentheses
        let phone = phoneMatch[1].replace(/[\s\-\(\)]/g, '');
        // Ensure it starts with +1 if it's 10 digits
        if (phone.length === 10) {
          phone = '+1' + phone;
        } else if (phone.length === 11 && phone.startsWith('1')) {
          phone = '+' + phone;
        }
        phones.push(phone);
      }
    }

    // Get emails
    if (trimmed.startsWith('EMAIL')) {
      const emailMatch = trimmed.match(/:(.+@.+)$/);
      if (emailMatch) {
        emails.push(emailMatch[1].trim().toLowerCase());
      }
    }
  }

  // Map all phone numbers and emails to this contact name
  if (name) {
    for (const phone of phones) {
      contacts[phone] = name;
    }
    for (const email of emails) {
      contacts[email] = name;
    }
  }
}

// Write to contacts.json
const outputPath = path.join(__dirname, '..', 'contacts.json');
const output = {
  contacts,
  _instructions: 'Auto-generated from vCard export. You can edit this file to add or modify contact names.'
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Imported ${Object.keys(contacts).length} contact mappings to contacts.json`);
console.log(`   ${new Set(Object.values(contacts)).size} unique contacts`);
