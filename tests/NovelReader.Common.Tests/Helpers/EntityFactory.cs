using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Common.Tests.Helpers;

public static class EntityFactory
{
    public static Progress CreateValidProgress(Guid workId)
    {
        return new Progress(workId, new WorkChapter(null, 704), ReadingStatus.Reading);
    }
    public static Genre CreateValidGenre()
    {
        return new Genre("Ação");
    }
    public static Character CreateValidCharacter(Guid workId)
    {
        return new Character("Greed", CharacterType.Protagonist, new(null, 1), workId);
    }
    public static Work CreateValidWork()
    {
        var totalChapter = new WorkChapter(null, 2059);
        return new("Overgeared", WorkType.WebNovel, "https://www.novelupdates.com/series/overgeared", totalChapter, Language.Korean);
    }
}