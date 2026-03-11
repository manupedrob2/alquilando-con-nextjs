using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlquileresApp.Core.CasosDeUso.Reserva;
using AlquileresApp.Core.Entidades;
using AlquileresApp.Core.Interfaces;

namespace AlquileresApp.UI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly CasoDeUsoCrearReserva _crearReserva;
    private readonly CasoDeUsoListarMisReservas _listarMisReservas;
    private readonly CasoDeUsoListarReservasAdm _listarReservasAdm;
    private readonly CasoDeUsoObtenerReserva _obtenerReserva;
    private readonly CasoDeUsoModificarReserva _modificarReserva;
    private readonly CasoDeUsoCancelarReserva _cancelarReserva;
    private readonly CasoDeUsoVisualizarReserva _visualizarReserva;

    public ReservasController(
        CasoDeUsoCrearReserva crearReserva,
        CasoDeUsoListarMisReservas listarMisReservas,
        CasoDeUsoListarReservasAdm listarReservasAdm,
        CasoDeUsoObtenerReserva obtenerReserva,
        CasoDeUsoModificarReserva modificarReserva,
        CasoDeUsoCancelarReserva cancelarReserva,
        CasoDeUsoVisualizarReserva visualizarReserva)
    {
        _crearReserva = crearReserva;
        _listarMisReservas = listarMisReservas;
        _listarReservasAdm = listarReservasAdm;
        _obtenerReserva = obtenerReserva;
        _modificarReserva = modificarReserva;
        _cancelarReserva = cancelarReserva;
        _visualizarReserva = visualizarReserva;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CrearReserva([FromBody] CrearReservaDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            
            await _crearReserva.Ejecutar(
                userId,
                dto.PropiedadId,
                dto.FechaInicio,
                dto.FechaFin,
                dto.CantidadHuespedes
            );
            
            return Ok(new { message = "Reserva creada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("mis-reservas")]
    [Authorize]
    public async Task<IActionResult> ListarMisReservas()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var reservas = _listarMisReservas.Ejecutar(userId);
            
            return Ok(reservas.Select(r => new {
                id = r.Id,
                propiedadId = r.PropiedadId,
                propiedad = new {
                    id = r.Propiedad?.Id,
                    titulo = r.Propiedad?.Titulo,
                    direccion = r.Propiedad?.Direccion,
                    localidad = r.Propiedad?.Localidad
                },
                clienteId = r.ClienteId,
                fechaInicio = r.FechaInicio,
                fechaFin = r.FechaFin,
                precioTotal = r.PrecioTotal,
                estado = r.Estado,
                cantidadHuespedes = r.CantidadHuespedes
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ListarReservasAdministrador()
    {
        try
        {
            var reservas = _listarReservasAdm.Ejecutar();
            
            return Ok(reservas.Select(r => new {
                id = r.Id,
                propiedadId = r.PropiedadId,
                propiedad = new {
                    id = r.Propiedad?.Id,
                    titulo = r.Propiedad?.Titulo,
                    direccion = r.Propiedad?.Direccion,
                    localidad = r.Propiedad?.Localidad
                },
                clienteId = r.ClienteId,
                cliente = new {
                    id = r.Cliente?.Id,
                    nombre = r.Cliente?.Nombre,
                    email = r.Cliente?.Email
                },
                fechaInicio = r.FechaInicio,
                fechaFin = r.FechaFin,
                precioTotal = r.PrecioTotal,
                estado = r.Estado,
                cantidadHuespedes = r.CantidadHuespedes
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> ObtenerReserva(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            
            var reserva = await _obtenerReserva.Ejecutar(id);
            
            if (reserva == null)
                return NotFound();

            // Verificar que el usuario tenga acceso a esta reserva
            if (userRole != "Administrador" && reserva.ClienteId != userId)
                return Forbid();

            return Ok(new {
                id = reserva.Id,
                propiedadId = reserva.PropiedadId,
                propiedad = new {
                    id = reserva.Propiedad?.Id,
                    titulo = reserva.Propiedad?.Titulo,
                    descripcion = reserva.Propiedad?.Descripcion,
                    direccion = reserva.Propiedad?.Direccion,
                    localidad = reserva.Propiedad?.Localidad,
                    imagenes = reserva.Propiedad?.Imagenes?.Select(i => i.Url).ToList() ?? new List<string>()
                },
                clienteId = reserva.ClienteId,
                fechaInicio = reserva.FechaInicio,
                fechaFin = reserva.FechaFin,
                precioTotal = reserva.PrecioTotal,
                estado = reserva.Estado,
                cantidadHuespedes = reserva.CantidadHuespedes
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> ModificarReserva(int id, [FromBody] ModificarReservaDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            
            var reserva = await _obtenerReserva.Ejecutar(id);
            
            if (reserva == null)
                return NotFound();

            // Verificar que el usuario tenga acceso a esta reserva
            if (userRole != "Administrador" && reserva.ClienteId != userId)
                return Forbid();

            var resultado = await _modificarReserva.Ejecutar(id, dto.FechaInicio ?? reserva.FechaInicio, dto.FechaFin ?? reserva.FechaFin);
            
            if (!resultado.EsExitosa)
                return BadRequest(new { error = resultado.Mensaje });
            
            return Ok(new { message = resultado.Mensaje });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> CancelarReserva(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            
            var reserva = await _obtenerReserva.Ejecutar(id);
            
            if (reserva == null)
                return NotFound();

            // Verificar que el usuario tenga acceso a esta reserva
            if (userRole != "Administrador" && reserva.ClienteId != userId)
                return Forbid();

            var resultado = await _cancelarReserva.Ejecutar(id);
            
            if (!resultado.EsExitosa)
                return BadRequest(new { error = resultado.Mensaje });
            
            return Ok(new { message = resultado.Mensaje });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/visualizar")]
    [Authorize]
    public async Task<IActionResult> VisualizarReserva(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            
            var reserva = await _obtenerReserva.Ejecutar(id);
            
            if (reserva == null)
                return NotFound();

            // Verificar que el usuario tenga acceso a esta reserva
            if (userRole != "Administrador" && reserva.ClienteId != userId)
                return Forbid();

            var reservasUsuario = _visualizarReserva.Ejecutar(userId);
            var reservaVisualizar = reservasUsuario.FirstOrDefault(r => r.Id == id);
            
            if (reservaVisualizar == null)
                return NotFound();

            return Ok(new {
                id = reservaVisualizar.Id,
                propiedad = new {
                    titulo = reservaVisualizar.Propiedad?.Titulo,
                    direccion = reservaVisualizar.Propiedad?.Direccion,
                    localidad = reservaVisualizar.Propiedad?.Localidad
                },
                fechaInicio = reservaVisualizar.FechaInicio,
                fechaFin = reservaVisualizar.FechaFin,
                precioTotal = reservaVisualizar.PrecioTotal,
                estado = reservaVisualizar.Estado,
                detallesAdicionales = new {
                    noches = (reservaVisualizar.FechaFin - reservaVisualizar.FechaInicio).Days,
                    precioPorNoche = reservaVisualizar.PrecioTotal / (reservaVisualizar.FechaFin - reservaVisualizar.FechaInicio).Days
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class CrearReservaDto
{
    public int PropiedadId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public int CantidadHuespedes { get; set; }
}

public class ModificarReservaDto
{
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}
