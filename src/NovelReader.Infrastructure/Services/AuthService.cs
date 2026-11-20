using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using NovelReader.Application.DTOs.Auth;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IWhitelistRepository _whitelistRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IWhitelistRepository whitelistRepository,
            ICurrentUserService currentUserService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _whitelistRepository = whitelistRepository;
            _currentUserService = currentUserService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponse> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                throw new ArgumentException("Token do Google não informado.");
            }

            var clientId = _configuration["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId) && (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production" || _configuration["DOTNET_ENVIRONMENT"] == "Production"))
            {
                throw new InvalidOperationException("Google ClientId is not configured in production.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                var validationSettings = new GoogleJsonWebSignature.ValidationSettings();
                if (!string.IsNullOrWhiteSpace(clientId))
                {
                    validationSettings.Audience = new[] { clientId };
                }

                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha na validação do Google ID Token.");
                throw new UnauthorizedAccessException("Credencial do Google inválida ou expirada.");
            }

            var normalizedEmail = payload.Email.Trim().ToLowerInvariant();
            var isAdminEmail = normalizedEmail.Equals(User.AdminEmail, StringComparison.OrdinalIgnoreCase);

            var isAllowed = isAdminEmail || await _whitelistRepository.IsEmailAllowedAsync(normalizedEmail, cancellationToken);
            if (!isAllowed)
            {
                _logger.LogWarning("Tentativa de login não autorizada para o e-mail: {Email}", normalizedEmail);
                throw new UnauthorizedAccessException("Acesso restrito. Seu e-mail não possui permissão para acessar o sistema. Solicite acesso ao administrador.");
            }

            if (isAdminEmail && !await _whitelistRepository.IsEmailAllowedAsync(normalizedEmail, cancellationToken))
            {
                await _whitelistRepository.CreateAsync(new WhitelistEntry(normalizedEmail, "System"), cancellationToken);
            }

            var user = await _userRepository.GetByGoogleIdAsync(payload.Subject, cancellationToken);
            if (user == null)
            {
                var isFirstUser = !await _userRepository.HasAnyUserAsync(cancellationToken);
                var role = (isAdminEmail || isFirstUser) ? "Admin" : "User";

                user = new User(
                    payload.Subject,
                    payload.Email,
                    payload.Name,
                    payload.Picture,
                    role
                );

                await _userRepository.CreateAsync(user, cancellationToken);

                if (isFirstUser)
                {
                    await _userRepository.ClaimOrphanWorksAsync(user.Id, cancellationToken);
                    _logger.LogInformation("Primeiro usuário registrado ({Email}). Obras existentes atribuídas à sua conta.", user.Email);
                }
            }
            else
            {
                if (isAdminEmail && user.Role != "Admin")
                {
                    user.SetRole("Admin");
                }
                user.UpdateProfile(payload.Name, payload.Picture);
                await _userRepository.UpdateAsync(user, cancellationToken);
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse(
                token,
                user.Id,
                user.Email,
                user.Name,
                user.AvatarUrl,
                user.Role
            );
        }

        public async Task<UserDto?> GetCurrentUserProfileAsync(CancellationToken cancellationToken)
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return null;
            }

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value, cancellationToken);
            if (user == null)
            {
                return null;
            }

            var normalizedEmail = user.Email.Trim().ToLowerInvariant();
            var isAdminEmail = normalizedEmail.Equals(User.AdminEmail, StringComparison.OrdinalIgnoreCase);
            var isAllowed = isAdminEmail || await _whitelistRepository.IsEmailAllowedAsync(normalizedEmail, cancellationToken);
            if (!isAllowed)
            {
                _logger.LogWarning("Sessão revogada para o e-mail: {Email}", normalizedEmail);
                return null;
            }

            return new UserDto(user.Id, user.Email, user.Name, user.AvatarUrl, user.Role);
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["Jwt:SecretKey"] ?? "NovelReader_Super_Secret_Jwt_Signing_Key_2026_Secure_Auth!";
            var issuer = _configuration["Jwt:Issuer"] ?? "NovelReader";
            var audience = _configuration["Jwt:Audience"] ?? "NovelReaderClient";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Email, user.Email),
                new(JwtRegisteredClaimNames.Name, user.Name),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Role, user.Role),
                new("role", user.Role),
            };

            if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                claims.Add(new Claim("avatar", user.AvatarUrl));
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
