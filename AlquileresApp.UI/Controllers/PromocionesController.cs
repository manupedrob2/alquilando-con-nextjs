using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlquileresApp.Core.CasosDeUso.Promocion;
using AlquileresApp.Core.Entidades;
using AlquileresApp.Core.Interfaces;

namespace AlquileresApp.UI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromocionesController : ControllerBase
{
    private readonly CasoDeUsoCrearPromocion _crearPromocion;
    private readonly CasoDeUsoListarPromociones _listarPromociones;
    private readonly CasoDeUsoListarPromocionesActivas _listarActivas;
    private readonly CasoDeUsoObtenerPromocion _obtenerPromocion;
    private readonly CasoDeUsoModificarPromocion _modificarPromocion;
    private readonly CasoDeUsoEliminarPromocion _eliminarPromocion;

    public PromocionesController(
        CasoDeUsoCrearPromocion crearPromocion,
        CasoDeUsoListarPromociones listarPromociones,
        CasoDeUsoListarPromocionesActivas listarActivas,
        CasoDeUsoObtenerPromocion obtenerPromocion,
        CasoDeUsoModificarPromocion modificarPromocion,
        CasoDeUsoEliminarPromocion eliminarPromocion)
    {
        _crearPromocion = crearPromocion;
        _listarPromociones = listarPromociones;
        _listarActivas = listarActivas;
        _obtenerPromocion = obtenerPromocion;
        _modificarPromocion = modificarPromocion;
        _eliminarPromocion = eliminarPromocion;
    }

    [HttpGet]
    public async Task<IActionResult> ListarPromociones()
    {
        try
        {
            var promociones = _listarPromociones.Ejecutar();
            return Ok(promociones.Select(p => new {
                id = p.Id,
                titulo = p.Titulo,
                descripcion = p.Descripcion,
                porcentajeDescuento = p.PorcentajeDescuento,
                fechaInicio = p.FechaInicio,
                fechaFin = p.FechaFin,
                activa = !p.borrada,
                propiedades = p.Propiedades?.Select(prop => new {
                    id = prop.Id,
                    titulo = prop.Titulo,
                    precio = prop.PrecioPorNoche
                }).ToList()
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("activas")]
    public async Task<IActionResult> ListarPromocionesActivas()
    {
        try
        {
            var promociones = _listarActivas.Ejecutar();
            return Ok(promociones.Select(p => new {
                id = p.Id,
                titulo = p.Titulo,
                descripcion = p.Descripcion,
                porcentajeDescuento = p.PorcentajeDescuento,
                fechaInicio = p.FechaInicio,
                fechaFin = p.FechaFin,
                propiedades = p.Propiedades?.Select(prop => new {
                    id = prop.Id,
                    titulo = prop.Titulo,
                    precio = prop.PrecioPorNoche,
                    precioConDescuento = prop.PrecioPorNoche * (1 - p.PorcentajeDescuento / 100)
                }).ToList()
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPromocion(int id)
    {
        try
        {
            var promocion = _obtenerPromocion.Ejecutar(id);
            
            if (promocion == null)
                return NotFound();

            return Ok(new {
                id = promocion.Id,
                titulo = promocion.Titulo,
                descripcion = promocion.Descripcion,
                porcentajeDescuento = promocion.PorcentajeDescuento,
                fechaInicio = promocion.FechaInicio,
                fechaFin = promocion.FechaFin,
                activa = !promocion.borrada,
                propiedades = promocion.Propiedades?.Select(prop => new {
                    id = prop.Id,
                    titulo = prop.Titulo,
                    precio = prop.PrecioPorNoche,
                    precioConDescuento = prop.PrecioPorNoche * (1 - promocion.PorcentajeDescuento / 100),
                    imagenes = prop.Imagenes?.Select(i => i.Url).ToList()
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CrearPromocion([FromBody] CrearPromocionDto dto)
    {
        try
        {
            var promocion = new Promocion
            {
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                PorcentajeDescuento = dto.PorcentajeDescuento,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                FechaInicioReserva = dto.FechaInicio,
                FechaFinReserva = dto.FechaFin,
                borrada = false
            };

            _crearPromocion.Ejecutar(promocion, new List<int>());
            
            return CreatedAtAction(nameof(ObtenerPromocion), new { id = promocion.Id }, new { 
                id = promocion.Id,
                message = "Promoción creada exitosamente"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ModificarPromocion(int id, [FromBody] ModificarPromocionDto dto)
    {
        try
        {
            var promocion = _obtenerPromocion.Ejecutar(id);
            if (promocion == null)
                return NotFound();

            _modificarPromocion.Ejecutar(
                id,
                dto.Titulo ?? promocion.Titulo,
                dto.Descripcion ?? promocion.Descripcion,
                dto.FechaInicio ?? promocion.FechaInicio,
                dto.FechaFin ?? promocion.FechaFin,
                dto.FechaInicio ?? promocion.FechaInicioReserva,
                dto.FechaFin ?? promocion.FechaFinReserva,
                dto.PorcentajeDescuento ?? promocion.PorcentajeDescuento,
                promocion.Propiedades?.Select(p => p.Id).ToList() ?? new List<int>()
            );
            
            return Ok(new { message = "Promoción modificada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarPromocion(int id)
    {
        try
        {
            var promocion = _obtenerPromocion.Ejecutar(id);
            if (promocion == null)
                return NotFound();

            _eliminarPromocion.Ejecutar(id);
            
            return Ok(new { message = "Promoción eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class CrearPromocionDto
{
    public string Titulo { get; set; }
    public string Descripcion { get; set; }
    public decimal PorcentajeDescuento { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}

public class ModificarPromocionDto
{
    public string? Titulo { get; set; }
    public string? Descripcion { get; set; }
    public decimal? PorcentajeDescuento { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public bool? Activa { get; set; }
}
