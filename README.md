# NovelReader

Personal reading tracker and knowledge base for novels, web novels, manga, and manhwa.

---

## Features

- **Multi-Format Work Tracking:** Manage works across formats (Novel, Web Novel, Manga, Manhwa, Manhua) with separate total chapters, translated status, and reading links.
- **Alternative Titles & Multilingual Search:** Support for multiple titles, abbreviations, and language translations per work. Search filters match both main and alternative titles seamlessly.
- **Reading Progress History:** Track reading sessions per format with chapter, optional volume, notes, status, and direct links to where you stopped.
- **Character Management:**
  - First appearance tracking specific to each format of the work (e.g., Web Novel vs. Manhwa).
  - Aliases and alternative names per character.
  - Group and faction affiliations per character (e.g., guilds, sects, secret societies) with interactive tag management, dedicated toolbar filter dropdown, and badge displays.
  - Role-weighted default sorting (Protagonist → Antagonist → Supporting → Extra) with customizable Sort By filters.
  - Character pagination with selectable page size (`10`, `20`, `50`, `100`).
  - Full character reading and inspection modal with rich typography, expandable notes, and image preview.
- **Rich Markdown Attachments:** Attach notes, character summaries, lore documentation, and tables with full GFM (GitHub Flavored Markdown) support.
- **Genre Management & Filtering:** Filter your library by status, format, genre, and search queries with instant feedback.
- **Smooth UX:** Animated skeleton loaders across sidebar, character cards, journal, and attachments.
- **Obsidian Migration Script:** Automated script to import characters and notes directly from an Obsidian vault folder.
- **Automated Cloud Backup & Disaster Recovery:** Portable Rclone integration to automatically back up PostgreSQL dumps directly to Google Drive, retaining only the 3 latest backups.
- **Integrated Image Upload (ImgBB):** Seamlessly upload images for Work covers, Character avatars, and Markdown attachments with file picker, drag & drop, and clipboard paste (`Ctrl + V`), or paste existing URLs. API keys are safely managed via server-side environment variables and excluded from source control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 (Web API) |
| Frontend | React 19 + TypeScript + Vite |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 10 |
| Styling & UI | Vanilla CSS + Lucide Icons + React Markdown |
| Containers | Docker & Docker Compose |
| Tests | xUnit + Moq + FluentAssertions + Testcontainers |

---

## Architecture

Built following **Clean Architecture**, **Domain-Driven Design (DDD)** tactical patterns, and **Test-Driven Development (TDD)**:

```
src/
├── NovelReader.Domain/          # Entities, Value Objects, Enums, Repository Interfaces
├── NovelReader.Application/     # Services, DTOs, FluentValidation Validators
├── NovelReader.Infrastructure/  # EF Core, PostgreSQL Persistence, Repositories, Migrations
└── NovelReader.API/             # Controllers, Middlewares, Dependency Injection

tests/
├── NovelReader.Domain.Tests/
├── NovelReader.Application.Tests/
├── NovelReader.Integration.Tests/
└── NovelReader.Common.Tests/
```

---

## Getting Started

### Option A: Running with Docker Compose (Recommended)

1. Make sure **Docker** is installed and running.
2. (Optional) Configure ImgBB for automatic image uploads:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Get a free API key at [api.imgbb.com](https://api.imgbb.com) and add it to `.env`:
     ```env
     IMGBB_API_KEY=your_imgbb_api_key_here
     ```
3. Build and start the entire stack:
   ```bash
   docker compose up --build -d
   ```
4. Open your browser:
   - **Frontend UI:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5092/swagger](http://localhost:5092/swagger)

---

### Option B: Running Locally

#### Prerequisites
- .NET 10 SDK
- PostgreSQL 16
- Node.js 20+

#### 1. Backend
```bash
# Update connection string in src/NovelReader.API/appsettings.Development.json
dotnet ef database update --project src/NovelReader.Infrastructure --startup-project src/NovelReader.API
dotnet run --project src/NovelReader.API
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 3. Run Tests
```bash
dotnet test
```

---

## Database Backup & Disaster Recovery (Google Drive via Rclone)

NovelReader includes an automated backup solution using portable **Rclone**. It protects your PostgreSQL database from local disk failures by uploading compressed dumps directly to **Google Drive**, without requiring Google Drive for Desktop or background software to be installed on your computer.

### 1. One-Time Setup (Authorize Google Drive)

Run the interactive setup in PowerShell from the project root:

```powershell
.\tools\rclone\rclone.exe config
```

Follow these quick prompts:
1. Type `n` (*New remote*) and enter `gdrive` as the name.
2. Select `drive` (*Google Drive*).
3. When asked `Continue using the shared client_id anyway?`, type `y`.
4. Press Enter for `client_id` and `client_secret` (leave blank).
5. Choose scope `1` (*Full access*).
6. Press Enter for `service_account_file`.
7. `Edit advanced config`: `n`.
8. `Use auto config?`: `y` (or press Enter).
   - Your web browser will open Google's authorization screen.
   - Select your account and click **Allow**.
9. `Configure this as a Shared Drive?`: `n`.
10. Confirm with `y` and type `q` to quit the config wizard.

---

### 2. Performing a Manual Backup

Run the backup script at any time:

```powershell
.\scripts\backup-db.ps1
```

**What this script does:**
- Dumps the PostgreSQL database from the `novelreader-db` container.
- Uploads the dump to `gdrive:Backups/NovelReader/novelreader_backup_YYYY-MM-DD_HH-mm-ss.dump`.
- **Automatic Retention:** Checks your Google Drive folder and keeps **strictly the 3 latest backups**, automatically deleting older ones.
- Removes temporary files from your local drive.

---

### 3. Automating Daily Backups in Windows

To schedule the backup to run silently in the background every day at 23:00 (or any custom time):

```powershell
.\scripts\register-backup-task.ps1 -Time "23:00"
```

To remove the scheduled task later (if needed):
```powershell
.\scripts\register-backup-task.ps1 -Unregister
```

---

### 4. Disaster Recovery (Restoring the Database)

If your local drive fails, your database becomes corrupted, or you migrate to a new machine:

1. Clone this repository on the machine.
2. Start the database container:
   ```bash
   docker compose up -d postgres
   ```
3. Run the restore script:
   ```powershell
   .\scripts\restore-db.ps1
   ```
   *The script automatically fetches the most recent backup from Google Drive and restores all works, progress, characters, and attachments in seconds.*

To restore a specific backup file by name:
```powershell
.\scripts\restore-db.ps1 -BackupFileName "novelreader_backup_2026-11-16_00-08-00.dump"
```

---

## Obsidian Character Import Script

If you have characters documented in an Obsidian vault:

```bash
node scripts/import-obsidian-characters.mjs
```

By default, the script reads `.md` character files, parses YAML frontmatter (`nome`, `papel`, `aliases`, `primeira_aparicao`, `descricao`), maps roles, formats descriptions, and registers characters via the NovelReader API, automatically skipping existing characters to prevent overwriting manual edits.
