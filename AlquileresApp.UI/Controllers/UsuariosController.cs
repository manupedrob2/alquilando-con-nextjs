using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlquileresApp.Core.CasosDeUso.Usuario;
using AlquileresApp.Core.Entidades;
using AlquileresApp.Core.Interfaces;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace AlquileresApp.UI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly CasoDeUsoRegistrarUsuario _registrarUsuario;
    private readonly CasoDeUsoIniciarSesion _iniciarSesion;
    private readonly CasoDeUsoCerrarSesion _cerrarSesion;
    private readonly IUsuarioRepositorio _usuarioRepositorio;
    private readonly IServicioHashPassword _hashPassword;
    private readonly IConfiguration _configuration;

    public UsuariosController(
        CasoDeUsoRegistrarUsuario registrarUsuario,
        CasoDeUsoIniciarSesion iniciarSesion,
        CasoDeUsoCerrarSesion cerrarSesion,
        IUsuarioRepositorio usuarioRepositorio,
        IServicioHashPassword hashPassword,
        IConfiguration configuration)
    {
        _registrarUsuario = registrarUsuario;
        _iniciarSesion = iniciarSesion;
        _cerrarSesion = cerrarSesion;
        _usuarioRepositorio = usuarioRepositorio;
        _hashPassword = hashPassword;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Registrar([FromBody] UsuarioRegistroDto dto)
    {
        try
        {
            var usuario = new Cliente(dto.Nombre, dto.Apellido, dto.Email, dto.Telefono, dto.Contraseña, dto.FechaNacimiento);
            _registrarUsuario.Ejecutar(usuario);
            
            return Ok(new { message = "Usuario registrado exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var usuario = await _iniciarSesion.Ejecutar(dto.Email, dto.Contraseña);
            
            if (usuario == null)
                return Unauthorized(new { error = "Credenciales inválidas" });

            var token = GenerateJwtToken(usuario);
            
            return Ok(new { 
                token,
                usuario = new {
                    id = usuario.Id,
                    nombre = usuario.Nombre,
                    email = usuario.Email,
                    rol = usuario.GetType().Name
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("perfil")]
    [Authorize]
    public async Task<IActionResult> ObtenerPerfil()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var usuario = _usuarioRepositorio.ObtenerUsuarioPorId(userId);
            
            if (usuario == null)
                return NotFound();

            return Ok(new {
                id = usuario.Id,
                nombre = usuario.Nombre,
                apellido = usuario.Apellido,
                email = usuario.Email,
                telefono = usuario.Telefono,
                rol = usuario.GetType().Name
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("perfil")]
    [Authorize]
    public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var usuario = _usuarioRepositorio.ObtenerUsuarioPorId(userId);
            
            if (usuario == null)
                return NotFound();

            usuario.Nombre = dto.Nombre ?? usuario.Nombre;
            usuario.Apellido = dto.Apellido ?? usuario.Apellido;
            usuario.Telefono = dto.Telefono ?? usuario.Telefono;

            _usuarioRepositorio.ModificarUsuario(usuario);
            
            return Ok(new { message = "Perfil actualizado exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Role, usuario.GetType().Name)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class UsuarioRegistroDto
{
    public string Nombre { get; set; }
    public string Apellido { get; set; }
    public string Email { get; set; }
    public string Contraseña { get; set; }
    public string Telefono { get; set; }
    public DateTime FechaNacimiento { get; set; }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Contraseña { get; set; }
}

public class ActualizarPerfilDto
{
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string? Telefono { get; set; }
}
