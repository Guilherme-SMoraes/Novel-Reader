using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Common.Tests.Helpers;

public static class EntityFactory
{
    public static Progress CreateValidProgress(Guid workId, WorkType workType = WorkType.WebNovel)
    {
        return new Progress(workId, workType, new WorkChapter(null, 704), ReadingStatus.Reading);
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
        var work = new Work("Overgeared", "https://www.novelupdates.com/series/overgeared", Language.Korean);
        var totalChapter = new WorkChapter(null, 2059);
        var format = new WorkFormat(work.Id, WorkType.WebNovel, totalChapter);
        work.AddFormat(format);
        return work;
    }
}
