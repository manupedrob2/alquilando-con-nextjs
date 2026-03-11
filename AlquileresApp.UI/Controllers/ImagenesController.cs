using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlquileresApp.Core.CasosDeUso.Imagen;
using AlquileresApp.Core.Entidades;

namespace AlquileresApp.UI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagenesController : ControllerBase
{
    private readonly CasoDeUsoCargarImagen _cargarImagen;
    private readonly CasoDeUsoMostrarImagenes _mostrarImagenes;
    private readonly CasoDeUsoEliminarImagen _eliminarImagen;
    private readonly IWebHostEnvironment _environment;

    public ImagenesController(
        CasoDeUsoCargarImagen cargarImagen,
        CasoDeUsoMostrarImagenes mostrarImagenes,
        CasoDeUsoEliminarImagen eliminarImagen,
        IWebHostEnvironment environment)
    {
        _cargarImagen = cargarImagen;
        _mostrarImagenes = mostrarImagenes;
        _eliminarImagen = eliminarImagen;
        _environment = environment;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> SubirImagen([FromForm] IFormFile file, [FromForm] int propiedadId)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No se ha proporcionado ningún archivo" });

            // Validar tipo de archivo
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { error = "Tipo de archivo no permitido. Solo se admiten imágenes" });

            // Validar tamaño (máximo 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "El archivo es demasiado grande. Máximo 5MB" });

            // Crear directorio si no existe
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "propiedades");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generar nombre único
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Guardar archivo
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Crear entidad Imagen
            var imagen = new Imagen
            {
                Url = $"/uploads/propiedades/{uniqueFileName}",
                PropiedadId = propiedadId
            };

            _cargarImagen.Ejecutar(imagen, propiedadId);

            return Ok(new { 
                id = imagen.Id,
                url = imagen.Url,
                message = "Imagen subida exitosamente"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("upload-multiple")]
    [Authorize]
    public async Task<IActionResult> SubirMultiplesImagenes([FromForm] List<IFormFile> files, [FromForm] int propiedadId)
    {
        try
        {
            if (files == null || files.Count == 0)
                return BadRequest(new { error = "No se han proporcionado archivos" });

            var imagenesSubidas = new List<object>();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

            foreach (var file in files)
            {
                if (file == null || file.Length == 0)
                    continue;

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { error = $"El archivo {file.FileName} no es un tipo de imagen permitido" });
                }

                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { error = $"El archivo {file.FileName} es demasiado grande. Máximo 5MB" });
                }

                // Crear directorio si no existe
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "propiedades");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Generar nombre único
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Crear entidad Imagen
                var imagen = new Imagen
                {
                    Url = $"/uploads/propiedades/{uniqueFileName}",
                    PropiedadId = propiedadId
                };

                _cargarImagen.Ejecutar(imagen, propiedadId);

                imagenesSubidas.Add(new {
                    id = imagen.Id,
                    url = imagen.Url,
                    nombreOriginal = file.FileName
                });
            }

            return Ok(new { 
                message = $"{imagenesSubidas.Count} imágenes subidas exitosamente",
                imagenes = imagenesSubidas
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("propiedad/{propiedadId}")]
    public async Task<IActionResult> ObtenerImagenesPorPropiedad(int propiedadId)
    {
        try
        {
            var imagenes = _mostrarImagenes.Ejecutar(propiedadId);
            
            return Ok(imagenes.Select(img => new {
                id = img.Id,
                url = img.Url,
                propiedadId = img.PropiedadId
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> EliminarImagen(int id)
    {
        try
        {
            await _eliminarImagen.Ejecutar(id);
            
            return Ok(new { message = "Imagen eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("uploads/{fileName}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerImagen(string fileName)
    {
        try
        {
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", "propiedades", fileName);
            
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(fileName);

            return File(fileBytes, contentType);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
