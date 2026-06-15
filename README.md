# NovelReader

Personal reading tracker for novels, web novels, manga and manhwa.

## Features

- Track works by type (Novel, Web Novel, Manga, Manhwa, Manhua)
- Reading progress history with chapter and description of where you stopped
- Character management per work
- Genre filtering
- Translation tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 (Web API) |
| Frontend | React + TypeScript |
| Database | PostgreSQL |
| ORM | Entity Framework Core 10 |
| Tests | xUnit + Moq + FluentAssertions |

## Architecture

Clean Architecture + DDD (tactical patterns) + TDD

```
src/
├── NovelReader.Domain/          # Entities, Value Objects, Enums, Repository Interfaces
├── NovelReader.Application/     # Services, DTOs
├── NovelReader.Infrastructure/  # EF Core, Repository Implementations
└── NovelReader.API/             # Controllers, Program.cs

tests/
├── NovelReader.Domain.Tests/
├── NovelReader.Application.Tests/
└── NovelReader.Integration.Tests/
```

## Getting Started

### Prerequisites

- .NET 10 SDK
- PostgreSQL
- Node.js 20+

### Backend

1. Clone the repository
2. Create `src/NovelReader.API/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=novelreader;Username=postgres;Password=yourpassword"
  }
}
```

3. Run migrations:
```bash
dotnet ef migrations add InitialCreate --project src/NovelReader.Infrastructure --startup-project src/NovelReader.API
dotnet ef database update --project src/NovelReader.Infrastructure --startup-project src/NovelReader.API
```

4. Run the API:
```bash
dotnet run --project src/NovelReader.API
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
dotnet test
```
