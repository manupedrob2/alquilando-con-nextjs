# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 5234

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["AlquileresApp.UI/AlquileresApp.UI.csproj", "AlquileresApp.UI/"]
COPY ["AlquileresApp.Core/AlquileresApp.Core.csproj", "AlquileresApp.Core/"]
COPY ["AlquileresApp.Data/AlquileresApp.Data.csproj", "AlquileresApp.Data/"]
RUN dotnet restore "AlquileresApp.UI/AlquileresApp.UI.csproj"
COPY . .
WORKDIR "/src/AlquileresApp.UI"
RUN dotnet build "AlquileresApp.UI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AlquileresApp.UI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Crear directorio para la base de datos
RUN mkdir -p /app/data
# Establecer permisos
RUN chmod 777 /app/data

# Variables de entorno
ENV ASPNETCORE_URLS=http://+:5234
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "AlquileresApp.UI.dll"]
