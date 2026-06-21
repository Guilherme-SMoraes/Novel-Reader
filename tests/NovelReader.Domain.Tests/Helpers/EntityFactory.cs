using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Helpers;

internal static class EntityFactory
{
    internal static Progress CreateValidProgress(Guid workId)
    {
        return new Progress(workId, new WorkChapter(null, 704), ReadingStatus.Reading);
    }
    internal static Genre CreateValidGenre()
    {
        return new Genre("Ação");
    }
    internal static Character CreateValidCharacter(Guid workId)
    {
        return new Character("Greed", CharacterType.Protagonist, new(null, 1), workId);
    }
    internal static Work CreateValidWork()
    {
        var totalChapter = new WorkChapter(null, 2059);
        return new("Overgeared", WorkType.WebNovel, "https://www.novelupdates.com/series/overgeared", totalChapter, Language.Korean);
    }
}