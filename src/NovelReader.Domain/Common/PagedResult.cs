namespace NovelReader.Domain.Common
{
    public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize)
    {
        public int TotalPages => PageSize > 0 
            ? (int)Math.Ceiling((double)TotalCount / PageSize)
            : 0;
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}