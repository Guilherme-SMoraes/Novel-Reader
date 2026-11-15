FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/NovelReader.Domain/NovelReader.Domain.csproj", "src/NovelReader.Domain/"]
COPY ["src/NovelReader.Application/NovelReader.Application.csproj", "src/NovelReader.Application/"]
COPY ["src/NovelReader.Infrastructure/NovelReader.Infrastructure.csproj", "src/NovelReader.Infrastructure/"]
COPY ["src/NovelReader.API/NovelReader.API.csproj", "src/NovelReader.API/"]

RUN dotnet restore "src/NovelReader.API/NovelReader.API.csproj"

COPY ["src/", "src/"]
WORKDIR "/src/src/NovelReader.API"
RUN dotnet publish "NovelReader.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_RUNNING_IN_CONTAINER=true

ENTRYPOINT ["dotnet", "NovelReader.API.dll"]
