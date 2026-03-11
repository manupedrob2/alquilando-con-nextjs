using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlquileresApp.Core.CasosDeUso.Propiedad;
using AlquileresApp.Core.Entidades;
using AlquileresApp.Core.Interfaces;

namespace AlquileresApp.UI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropiedadesController : ControllerBase
{
    private readonly CasoDeUsoListarPropiedades _listarPropiedades;
    private readonly CasoDeUsoListarPropiedadesDestacadas _listarDestacadas;
    private readonly CasoDeUsoObtenerPropiedad _obtenerPropiedad;
    private readonly CasoDeUsoAgregarPropiedad _agregarPropiedad;
    private readonly CasoDeUsoModificarPropiedad _modificarPropiedad;
    private readonly CasoDeUsoEliminarPropiedad _eliminarPropiedad;
    private readonly CasoDeUsoListarPropiedadesFiltrado _listarFiltrado;
    private readonly CasoDeUsoMarcarPropiedadComoNoHabitable _marcarNoHabitable;

    public PropiedadesController(
        CasoDeUsoListarPropiedades listarPropiedades,
        CasoDeUsoListarPropiedadesDestacadas listarDestacadas,
        CasoDeUsoObtenerPropiedad obtenerPropiedad,
        CasoDeUsoAgregarPropiedad agregarPropiedad,
        CasoDeUsoModificarPropiedad modificarPropiedad,
        CasoDeUsoEliminarPropiedad eliminarPropiedad,
        CasoDeUsoListarPropiedadesFiltrado listarFiltrado,
        CasoDeUsoMarcarPropiedadComoNoHabitable marcarNoHabitable)
    {
        _listarPropiedades = listarPropiedades;
        _listarDestacadas = listarDestacadas;
        _obtenerPropiedad = obtenerPropiedad;
        _agregarPropiedad = agregarPropiedad;
        _modificarPropiedad = modificarPropiedad;
        _eliminarPropiedad = eliminarPropiedad;
        _listarFiltrado = listarFiltrado;
        _marcarNoHabitable = marcarNoHabitable;
    }

    [HttpGet]
    public async Task<IActionResult> ListarPropiedades()
    {
        try
        {
            var propiedades = _listarPropiedades.Ejecutar();
            return Ok(propiedades.Select(p => new {
                id = p.Id,
                titulo = p.Titulo,
                descripcion = p.Descripcion,
                precio = p.PrecioPorNoche,
                direccion = p.Direccion,
                localidad = p.Localidad,
                capacidad = p.Capacidad,
                disponible = !p.NoHabitable,
                calificacionPromedio = p.CalificacionPromedio,
                imagenes = p.Imagenes?.Select(i => i.Url).ToList() ?? new List<string>()
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("destacadas")]
    public async Task<IActionResult> ListarPropiedadesDestacadas()
    {
        try
        {
            var propiedades = _listarDestacadas.Ejecutar();
            return Ok(propiedades.Select(p => new {
                id = p.Id,
                titulo = p.Titulo,
                descripcion = p.Descripcion,
                precio = p.PrecioPorNoche,
                direccion = p.Direccion,
                localidad = p.Localidad,
                capacidad = p.Capacidad,
                disponible = !p.NoHabitable,
                calificacionPromedio = p.CalificacionPromedio,
                imagenes = p.Imagenes?.Select(i => i.Url).ToList() ?? new List<string>()
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("filtrar")]
    public async Task<IActionResult> ListarPropiedadesFiltrado([FromQuery] SearchFiltersDto filtros)
    {
        try
        {
            var searchFilters = new SearchFilters
            {
                Localidad = filtros.Localidad,
                CantidadHuespedes = filtros.CantidadHuespedes,
                FechaInicio = filtros.FechaInicio ?? DateTime.MinValue,
                FechaFin = filtros.FechaFin ?? DateTime.MinValue
            };

            var propiedades = _listarFiltrado.Ejecutar(searchFilters);
            return Ok(propiedades.Select(p => new {
                id = p.Id,
                titulo = p.Titulo,
                descripcion = p.Descripcion,
                precio = p.PrecioPorNoche,
                direccion = p.Direccion,
                localidad = p.Localidad,
                capacidad = p.Capacidad,
                disponible = !p.NoHabitable,
                calificacionPromedio = p.CalificacionPromedio,
                imagenes = p.Imagenes?.Select(i => i.Url).ToList() ?? new List<string>()
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPropiedad(int id)
    {
        try
        {
            var propiedad = _obtenerPropiedad.Ejecutar(id);
            
            if (propiedad == null)
                return NotFound();

            return Ok(new {
                id = propiedad.Id,
                titulo = propiedad.Titulo,
                descripcion = propiedad.Descripcion,
                precio = propiedad.PrecioPorNoche,
                direccion = propiedad.Direccion,
                localidad = propiedad.Localidad,
                capacidad = propiedad.Capacidad,
                disponible = !propiedad.NoHabitable,
                calificacionPromedio = propiedad.CalificacionPromedio,
                imagenes = propiedad.Imagenes?.Select(i => new {
                    id = i.Id,
                    url = i.Url
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CrearPropiedad([FromBody] CrearPropiedadDto dto)
    {
        try
        {
            var propiedad = new Propiedad
            {
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                PrecioPorNoche = dto.PrecioPorNoche,
                Direccion = dto.Direccion,
                Localidad = dto.Localidad,
                Capacidad = dto.Capacidad,
                NoHabitable = false,
                CalificacionPromedio = 0
            };

            _agregarPropiedad.Ejecutar(propiedad);
            
            return CreatedAtAction(nameof(ObtenerPropiedad), new { id = propiedad.Id }, new { 
                id = propiedad.Id,
                message = "Propiedad creada exitosamente"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> ActualizarPropiedad(int id, [FromBody] ActualizarPropiedadDto dto)
    {
        try
        {
            var propiedad = new Propiedad
            {
                Id = id,
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                PrecioPorNoche = dto.PrecioPorNoche,
                Direccion = dto.Direccion,
                Localidad = dto.Localidad,
                Capacidad = dto.Capacidad,
                NoHabitable = false,
                CalificacionPromedio = 0
            };

            _modificarPropiedad.Ejecutar(propiedad);
            
            return Ok(new { message = "Propiedad actualizada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> EliminarPropiedad(int id)
    {
        try
        {
            var propiedad = _obtenerPropiedad.Ejecutar(id);
            if (propiedad == null)
                return NotFound();

            _eliminarPropiedad.Ejecutar(propiedad);
            
            return Ok(new { message = "Propiedad eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/no-habitable")]
    [Authorize]
    public async Task<IActionResult> MarcarComoNoHabitable(int id)
    {
        try
        {
            var propiedad = _obtenerPropiedad.Ejecutar(id);
            if (propiedad == null)
                return NotFound();

            propiedad.NoHabitable = true;
            _modificarPropiedad.Ejecutar(propiedad);
            
            return Ok(new { message = "Propiedad marcada como no habitable" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class SearchFiltersDto
{
    public string? Localidad { get; set; }
    public int? CantidadHuespedes { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}

public class CrearPropiedadDto
{
    public string Titulo { get; set; }
    public string Descripcion { get; set; }
    public decimal PrecioPorNoche { get; set; }
    public string Direccion { get; set; }
    public string Localidad { get; set; }
    public int Capacidad { get; set; }
}

public class ActualizarPropiedadDto
{
    public string Titulo { get; set; }
    public string Descripcion { get; set; }
    public decimal PrecioPorNoche { get; set; }
    public string Direccion { get; set; }
    public string Localidad { get; set; }
    public int Capacidad { get; set; }
}
