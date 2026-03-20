'use strict';

const ECO_REPO = {
  version: '1.0.0',
  base: {
    http:  'https://eco-lrtb.dev/v1/',
    ftp:   'ftp://ftp.eco-lrtb.dev/pub/eco_lrtb/v1.0/',
    local: './',
  },
  files: {
    'master':    { path: 'ECO_LRTB.FILE',                 format: 'FILE',   size: '~4KB' },
    'c-header':  { path: 'core/eco_lrtb.h',               format: 'C',      size: '~3KB' },
    'c-impl':    { path: 'core/eco_lrtb.c',               format: 'C',      size: '~6KB' },
    'csharp':    { path: 'core/eco_lrtb.cs',              format: 'CS',     size: '~5KB' },
    'python':    { path: 'core/eco_lrtb.py',              format: 'PY',     size: '~7KB' },
    'js':        { path: 'core/eco_lrtb.js',              format: 'JS',     size: '~6KB' },
    'html':      { path: 'core/eco_lrtb.html',            format: 'HTML',   size: '~8KB' },
    'php':       { path: 'core/eco_lrtb.php',             format: 'PHP',    size: '~6KB' },
    'css':       { path: 'core/eco_lrtb_w3c.css',         format: 'CSS',    size: '~4KB' },
    'nix':       { path: 'core/eco_lrtb.nix',             format: 'NIX',    size: '~3KB' },
    'polyfill':  { path: 'polyfill/eco_lrtb_polyfill.js', format: 'JS',     size: '~4KB' },
    'nitro':     { path: 'nitro/eco_lrtb_nitro.js',       format: 'JS',     size: '~3KB' },
    'v8':        { path: 'nitro/eco_lrtb_v8.js',          format: 'JS',     size: '~2KB' },
    'turbine':   { path: 'nitro/eco_lrtb_turbine.js',     format: 'JS',     size: '~2KB' },
    'apache':    { path: 'apache/eco_lrtb.conf',          format: 'APACHE', size: '~3KB' },
    'maven':     { path: 'maven/pom.xml',                 format: 'XML',    size: '~4KB' },
    'xml':       { path: 'xml/eco_lrtb.xml',              format: 'XML',    size: '~3KB' },
    'ftp-index': { path: 'ftp/eco_ftp_index.json',        format: 'JSON',   size: '~2KB' },
    'spec-md':   { path: 'eco_lrtb_spec.md',              format: 'MD',     size: '~5KB' },
    'spec-txt':  { path: 'eco_lrtb_spec.txt',             format: 'TXT',    size: '~5KB' },
  }
};

class EcoFtpLibrary {
  constructor(options = {}) {
    this.protocol = options.protocol || 'local';
    this.base     = options.base     || ECO_REPO.base[this.protocol] || './';
    this.index    = ECO_REPO.files;
    this.cache    = new Map();
  }

  resolve(fileId) {
    const entry = this.index[fileId];
    if (!entry) throw new Error(`eco_ftp: unknown file id "${fileId}"`);
    return this.base + entry.path;
  }

  list() {
    return Object.entries(this.index).map(([id, entry]) => ({
      id,
      url:    this.base + entry.path,
      format: entry.format,
      size:   entry.size,
    }));
  }

  async fetch(fileId) {
    if (this.cache.has(fileId)) return this.cache.get(fileId);
    const url  = this.resolve(fileId);
    const resp = await globalThis.fetch(url);
    if (!resp.ok) throw new Error(`eco_ftp: fetch failed for "${fileId}" (${resp.status})`);
    const text = await resp.text();
    this.cache.set(fileId, text);
    return text;
  }

  async fetchAll(fileIds) {
    const results = await Promise.all(fileIds.map(id => this.fetch(id)));
    return Object.fromEntries(fileIds.map((id, i) => [id, results[i]]));
  }

  generateIndex() {
    return JSON.stringify({
      version:   ECO_REPO.version,
      generated: new Date().toISOString(),
      protocol:  this.protocol,
      base:      this.base,
      files:     this.index,
    }, null, 2);
  }
}

const ECO_FTP_INDEX = {
  version:   '1.0.0',
  protocol:  'FTP',
  host:      'ftp.eco-lrtb.dev',
  port:      21,
  passive:   true,
  base_path: '/pub/eco_lrtb/v1.0/',
  auth:      'TOKEN',
  files:     ECO_REPO.files,
};

export { EcoFtpLibrary, ECO_REPO, ECO_FTP_INDEX };
export default EcoFtpLibrary;

if (typeof module !== 'undefined') {
  module.exports = { EcoFtpLibrary, ECO_REPO, ECO_FTP_INDEX };
}
