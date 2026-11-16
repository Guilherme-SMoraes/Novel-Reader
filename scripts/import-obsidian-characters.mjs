import fs from 'node:fs';
import path from 'node:path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5092';
const WORK_ID = process.env.WORK_ID || '94fbc684-6a19-4a62-b6b3-f7d4d1eed216';
const OBSIDIAN_DIR = process.env.OBSIDIAN_DIR || 'E:\\Documents\\Obsidian Vault\\Novel - Shadow Slave\\Personagens';

const ROLE_MAP = {
  'protagonista': 1,
  'antagonista': 2,
  'secundário': 3,
  'secundario': 3,
  'terciário': 4,
  'terciario': 4
};

function parseCharacterFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath, '.md');

  // Parse frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmLines = fmMatch ? fmMatch[1].split(/\r?\n/) : [];

  let nome = '';
  let papel = '';
  let primeiraAparicao = '';
  let foto = '';
  let fmDescricao = '';
  const aliases = [];

  let currentKey = '';
  for (const line of fmLines) {
    if (line.startsWith('nome:')) {
      nome = line.replace('nome:', '').trim();
      currentKey = 'nome';
    } else if (line.startsWith('papel:')) {
      papel = line.replace('papel:', '').trim();
      currentKey = 'papel';
    } else if (line.startsWith('primeira_aparicao:')) {
      primeiraAparicao = line.replace('primeira_aparicao:', '').trim();
      currentKey = 'primeira_aparicao';
    } else if (line.startsWith('foto:')) {
      foto = line.replace('foto:', '').trim();
      currentKey = 'foto';
    } else if (line.startsWith('descricao:')) {
      fmDescricao = line.replace('descricao:', '').trim();
      currentKey = 'descricao';
    } else if (line.startsWith('aliases:')) {
      currentKey = 'aliases';
    } else if (line.startsWith('tags:')) {
      currentKey = 'tags';
    } else if (line.startsWith('  - ') && currentKey === 'aliases') {
      const alias = line.replace('  - ', '').trim();
      if (alias) aliases.push(alias);
    } else if (currentKey === 'descricao' && !line.match(/^[a-z_]+:/)) {
      fmDescricao += '\n' + line.trim();
    }
  }

  // Parse body description if present
  let bodyDescricao = '';
  const bodyMatch = content.match(/## 🧾 Informações básicas[\s\S]*?- \*\*Descrição:\*\*([\s\S]*?)(?=\r?\n##|\Z)/);
  if (bodyMatch) {
    bodyDescricao = bodyMatch[1].trim();
  }

  const finalName = nome || filename;
  let finalDescription = bodyDescricao || fmDescricao || '';
  if (finalDescription === 'tags: personagem') {
    finalDescription = '';
  }

  const characterType = ROLE_MAP[papel.toLowerCase()] || 3;
  const chapterNumber = parseInt(primeiraAparicao, 10);

  const firstAppearances = !isNaN(chapterNumber)
    ? [{ workType: 2, chapter: { volume: null, chapter: chapterNumber } }]
    : [];

  let imageUrl = null;
  if (foto && (foto.startsWith('http://') || foto.startsWith('https://'))) {
    imageUrl = foto;
  }

  return {
    filename,
    name: finalName,
    characterType,
    imageUrl,
    description: finalDescription || null,
    alternativeNames: aliases.filter(a => a !== finalName),
    firstAppearances
  };
}

async function run() {
  console.log(`Checking Obsidian directory: ${OBSIDIAN_DIR}`);
  if (!fs.existsSync(OBSIDIAN_DIR)) {
    console.error(`Directory not found: ${OBSIDIAN_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(OBSIDIAN_DIR)
    .filter(f => f.endsWith('.md') && f !== 'Índice de Personagens.md');

  console.log(`Found ${files.length} character markdown files to process.`);

  // 1. Fetch existing characters
  console.log(`Fetching existing characters for work ${WORK_ID}...`);
  const res = await fetch(`${API_BASE_URL}/api/works/${WORK_ID}/characters?page=1&pageSize=200`);
  if (!res.ok) {
    throw new Error(`Failed to fetch characters: ${res.status} ${res.statusText}`);
  }
  const existingData = await res.json();
  const existingNames = new Set(
    (existingData.items || []).map(c => c.name.trim().toLowerCase())
  );
  console.log(`Existing characters in database: ${existingNames.size}`);

  let createdCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const file of files) {
    const filePath = path.join(OBSIDIAN_DIR, file);
    try {
      const charData = parseCharacterFile(filePath);

      if (existingNames.has(charData.name.trim().toLowerCase())) {
        console.log(`[SKIP] Already exists: ${charData.name}`);
        skippedCount++;
        continue;
      }

      const payload = {
        workId: WORK_ID,
        name: charData.name,
        characterType: charData.characterType,
        imageUrl: charData.imageUrl,
        description: charData.description,
        alternativeNames: charData.alternativeNames,
        firstAppearances: charData.firstAppearances
      };

      const postRes = await fetch(`${API_BASE_URL}/api/works/${WORK_ID}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!postRes.ok) {
        const errText = await postRes.text();
        console.error(`[ERROR] Failed to create ${charData.name}: ${postRes.status} ${errText}`);
        errors.push({ name: charData.name, error: `${postRes.status}: ${errText}` });
      } else {
        console.log(`[CREATED] ${charData.name} (Type: ${charData.characterType}, Chapter: ${charData.firstAppearances[0]?.chapter?.chapter})`);
        createdCount++;
        existingNames.add(charData.name.trim().toLowerCase());
      }
    } catch (err) {
      console.error(`[ERROR] Processing ${file}:`, err);
      errors.push({ file, error: err.message });
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total files: ${files.length}`);
  console.log(`Successfully created: ${createdCount}`);
  console.log(`Skipped (already in DB): ${skippedCount}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors detail:', errors);
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
