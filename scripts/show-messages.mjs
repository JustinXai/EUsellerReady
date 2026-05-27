#!/usr/bin/env node
/**
 * show-messages.mjs
 *
 * View recent provider intake submissions from the JSONL file.
 * 
 * Usage:
 *   node scripts/show-messages.mjs --last 20
 *   node scripts/show-messages.mjs --last 10
 *   node scripts/show-messages.mjs --debug  # shows ipHash field
 *
 * This script is for server-side use only. Do not expose publicly.
 */

import { readFileSync, existsSync } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const STORE_PATH = '/opt/eureadyseller/data/messages.jsonl';

// Parse command line args
const args = process.argv.slice(2);
let last = 10;
let debug = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--last' && args[i + 1]) {
    last = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--debug') {
    debug = true;
  } else if (args[i] === '--help') {
    console.log(`
Provider Intake Message Viewer
============================

Usage:
  node scripts/show-messages.mjs [options]

Options:
  --last N   Show last N messages (default: 10)
  --debug     Show ipHash field (default: hidden)
  --help      Show this help message

Examples:
  node scripts/show-messages.mjs --last 20
  node scripts/show-messages.mjs --last 5 --debug
`);
    process.exit(0);
  }
}

function formatMessage(msg) {
  const date = new Date(msg.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const countries = Array.isArray(msg.countries) ? msg.countries.join(', ') : '-';
  const topics = Array.isArray(msg.topics) ? msg.topics.join(', ') : '-';
  const message = msg.message 
    ? (msg.message.length > 120 ? msg.message.substring(0, 120) + '...' : msg.message)
    : '-';
  
  let line = `${date} | ${msg.email || '-'} | ${msg.platform || '-'} | ${countries} | ${topics} | ${msg.situation || '-'}`;
  
  if (debug && msg.ipHash) {
    line += ` | ipHash: ${msg.ipHash.substring(0, 16)}...`;
  }
  
  line += `\n  ${message}`;
  
  if (msg.productCategory) {
    line += `\n  category: ${msg.productCategory}`;
  }
  
  if (msg.name) {
    line += `\n  name: ${msg.name}`;
  }
  
  return line;
}

async function readLastLines(filepath, count) {
  if (!existsSync(filepath)) {
    console.error(`Error: ${filepath} not found.`);
    console.error('This script must be run on the server where messages are stored.');
    process.exit(1);
  }
  
  const lines = [];
  
  const rl = createInterface({
    input: createReadStream(filepath),
    crlfDelay: Infinity,
  });
  
  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
    }
  }
  
  return lines.slice(-count);
}

async function main() {
  try {
    const messages = await readLastLines(STORE_PATH, last);
    
    if (messages.length === 0) {
      console.log('No messages found.');
      return;
    }
    
    console.log('\nProvider Intake Submissions');
    console.log('=========================');
    console.log(`Showing last ${messages.length} submission(s)`);
    console.log('');
    
    // Show header
    let header = 'DATE                | EMAIL                   | PLATFORM    | COUNTRIES  | TOPICS                | SITUATION';
    if (debug) {
      header += ' | IP';
    }
    console.log(header);
    console.log('-'.repeat(header.length));
    
    // Parse and display each message
    for (const line of messages) {
      try {
        const msg = JSON.parse(line);
        const date = new Date(msg.createdAt).toISOString().replace('T', ' ').substring(0, 19);
        
        const email = (msg.email || '-').substring(0, 24);
        const platform = (msg.platform || '-').substring(0, 11);
        const countries = Array.isArray(msg.countries) ? msg.countries.slice(0, 2).join(',') : '-';
        const topics = Array.isArray(msg.topics) ? msg.topics.slice(0, 2).join(',') : '-';
        const situation = (msg.situation || '-').substring(0, 20);
        
        let row = `${date} | ${email.padEnd(24)} | ${platform.padEnd(11)} | ${countries.padEnd(10)} | ${topics.padEnd(20)} | ${situation}`;
        
        if (debug && msg.ipHash) {
          row += ` | ${msg.ipHash.substring(0, 16)}...`;
        }
        
        console.log(row);
        
        // Show truncated message
        const message = msg.message 
          ? (msg.message.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message)
          : '-';
        console.log(`  msg: ${message}`);
        
      } catch (e) {
        // Skip malformed lines
      }
    }
    
    console.log('');
    console.log(`Total: ${messages.length} submission(s)`);
    console.log('');
    
  } catch (error) {
    console.error('Error reading messages:', error.message);
    process.exit(1);
  }
}

main();
