import Papa from 'papaparse';

export type ProspectField =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'company'
  | 'jobPosition'
  | 'phone'
  | 'website'
  | 'industry'
  | 'city'
  | 'state'
  | 'country'
  | 'personalSocial'
  | 'companySize'
  | 'domain'
  | 'notes'
  | 'icebreaker'
  | 'custom1'
  | 'custom2'
  | 'custom3'
  | 'custom4'
  | 'custom5';

export const PROSPECT_FIELD_LABELS: Record<ProspectField, string> = {
  email: 'Email',
  firstName: 'First Name',
  lastName: 'Last Name',
  company: 'Company',
  jobPosition: 'Job Title',
  phone: 'Phone',
  website: 'Website',
  industry: 'Industry',
  city: 'City',
  state: 'State',
  country: 'Country',
  personalSocial: 'LinkedIn / Social',
  companySize: 'Company Size',
  domain: 'Domain',
  notes: 'Notes',
  icebreaker: 'Icebreaker',
  custom1: 'Custom 1',
  custom2: 'Custom 2',
  custom3: 'Custom 3',
  custom4: 'Custom 4',
  custom5: 'Custom 5',
};

const COLUMN_ALIASES: Record<ProspectField, string[]> = {
  email: [
    'email', 'emailaddress', 'email_address', 'mail', 'e-mail', 'emailaddr',
    'workemail', 'work_email', 'businessemail', 'contactemail',
  ],
  firstName: [
    'firstname', 'first_name', 'fname', 'givenname', 'given_name',
    'first', 'forename', 'contactfirstname',
  ],
  lastName: [
    'lastname', 'last_name', 'lname', 'surname', 'familyname',
    'family_name', 'last', 'contactlastname',
  ],
  company: [
    'company', 'organization', 'organisation', 'org', 'companyname',
    'company_name', 'employer', 'account', 'accountname', 'business',
    'businessname', 'firmname',
  ],
  jobPosition: [
    'title', 'jobtitle', 'job_title', 'position', 'role', 'designation',
    'jobrole', 'job_role', 'jobposition', 'job_position', 'occupation',
    'department', 'function',
  ],
  phone: [
    'phone', 'phonenumber', 'phone_number', 'mobile', 'cell', 'telephone',
    'tel', 'contactphone', 'workphone', 'mobilephone', 'directdial',
    'phonework', 'officephone',
  ],
  website: [
    'website', 'url', 'web', 'companywebsite', 'company_website',
    'homepage', 'siteurl', 'websiteurl',
  ],
  industry: [
    'industry', 'sector', 'vertical', 'industrytype', 'businesstype',
    'niche', 'market',
  ],
  city: ['city', 'town', 'municipality', 'locality'],
  state: ['state', 'province', 'region', 'county', 'territory'],
  country: ['country', 'nation', 'countryname', 'country_name'],
  personalSocial: [
    'linkedin', 'linkedinurl', 'linkedin_url', 'linkedinprofile',
    'twitter', 'twitterhandle', 'social', 'socialprofile', 'profile',
    'profileurl', 'linkedinlink',
  ],
  companySize: [
    'companysize', 'company_size', 'employees', 'headcount', 'size',
    'numberofemployees', 'employeecount', 'teamsize',
  ],
  domain: ['domain', 'companydomain', 'emaildomain', 'websitedomain'],
  notes: ['notes', 'note', 'comment', 'comments', 'remarks', 'description', 'memo'],
  icebreaker: ['icebreaker', 'opener', 'intro', 'personalizedintro', 'personalization'],
  custom1: ['custom1', 'custom_1', 'customfield1'],
  custom2: ['custom2', 'custom_2', 'customfield2'],
  custom3: ['custom3', 'custom_3', 'customfield3'],
  custom4: ['custom4', 'custom_4', 'customfield4'],
  custom5: ['custom5', 'custom_5', 'customfield5'],
};

export type ColumnMapping = Partial<Record<ProspectField, string>>;

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string>[];
  detectedMapping: ColumnMapping;
  totalRows: number;
  validEmailRows: number;
}

export interface MappedProspect {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobPosition?: string;
  phone?: string;
  website?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  personalSocial?: string;
  companySize?: string;
  domain?: string;
  notes?: string;
  icebreaker?: string;
  custom1?: string;
  custom2?: string;
  custom3?: string;
  custom4?: string;
  custom5?: string;
}

function normalize(header: string): string {
  return header.toLowerCase().replace(/[\s_\-\.\/\\]+/g, '').trim();
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function detectColumnMappings(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const usedHeaders = new Set<string>();

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [ProspectField, string[]][]) {
    for (const rawHeader of headers) {
      const n = normalize(rawHeader);
      if (!usedHeaders.has(rawHeader) && aliases.includes(n)) {
        mapping[field] = rawHeader;
        usedHeaders.add(rawHeader);
        break;
      }
    }
  }

  if (!mapping.email) {
    for (const header of headers) {
      if (!usedHeaders.has(header)) {
        const n = normalize(header);
        if (n.includes('email') || n.includes('mail')) {
          mapping.email = header;
          usedHeaders.add(header);
          break;
        }
      }
    }
  }

  return mapping;
}

function parseCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    });
  });
}

async function parseXLSX(file: File): Promise<Record<string, string>[]> {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: '',
          raw: false,
        });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let rows: Record<string, string>[];

  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    rows = await parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    rows = await parseXLSX(file);
  } else {
    throw new Error(`Unsupported file type ".${ext}". Please upload a CSV or Excel file.`);
  }

  if (rows.length === 0) throw new Error('The file appears to be empty.');

  const headers = Object.keys(rows[0]);
  const detectedMapping = detectColumnMappings(headers);

  const emailCol = detectedMapping.email;
  const validEmailRows = emailCol
    ? rows.filter((r) => isValidEmail(String(r[emailCol] ?? ''))).length
    : 0;

  return { headers, rows, detectedMapping, totalRows: rows.length, validEmailRows };
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): MappedProspect[] {
  const results: MappedProspect[] = [];

  for (const row of rows) {
    const email = mapping.email ? (row[mapping.email] ?? '').trim() : '';
    if (!isValidEmail(email)) continue;

    const get = (f: ProspectField) => {
      const col = mapping[f];
      if (!col) return undefined;
      const val = (row[col] ?? '').trim();
      return val || undefined;
    };

    let firstName = get('firstName');
    let lastName = get('lastName');

    if (!firstName && !lastName) {
      const fullNameCol = Object.keys(row).find((h) => {
        const n = normalize(h);
        return n === 'name' || n === 'fullname' || n === 'full_name' || n === 'contactname';
      });
      if (fullNameCol) {
        const parts = (row[fullNameCol] ?? '').trim().split(/\s+/);
        firstName = parts[0] || undefined;
        lastName = parts.slice(1).join(' ') || undefined;
      }
    }

    results.push({
      email,
      firstName,
      lastName,
      company: get('company'),
      jobPosition: get('jobPosition'),
      phone: get('phone'),
      website: get('website'),
      industry: get('industry'),
      city: get('city'),
      state: get('state'),
      country: get('country'),
      personalSocial: get('personalSocial'),
      companySize: get('companySize'),
      domain: get('domain'),
      notes: get('notes'),
      icebreaker: get('icebreaker'),
      custom1: get('custom1'),
      custom2: get('custom2'),
      custom3: get('custom3'),
      custom4: get('custom4'),
      custom5: get('custom5'),
    });
  }

  return results;
}
