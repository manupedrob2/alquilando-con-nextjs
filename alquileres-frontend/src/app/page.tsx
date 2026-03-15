import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Property {
  id: number;
  titulo: string;
  descripcion: string;
  localidad: string;
  direccion: string;
  capacidad: number;
  precioPorNoche: number;
  imagenes?: { id: number; url: string }[];
  serviciosDisponibles?: string[];
  politicasCancelacion?: string;
  calificacionPromedio?: number;
}

interface SearchFilters {
  localidad: string;
  cantidadHuespedes: number;
  fechaInicio: string;
  fechaFin: string;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    localidad: '',
    cantidadHuespedes: 1,
    fechaInicio: '',
    fechaFin: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadFeaturedProperties();
    loadPromotions();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const response = await fetch(`${api.endpoints.propiedades.destacadas}`);
      const data = await response.json();
      setFeaturedProperties(data);
    } catch (error) {
      console.error('Error loading featured properties:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await fetch(`${api.endpoints.promociones.activas}`);
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.localidad) queryParams.append('localidad', filters.localidad);
      if (filters.cantidadHuespedes) queryParams.append('cantidadHuespedes', filters.cantidadHuespedes.toString());
      if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
      
      const response = await fetch(`${api.endpoints.propiedades.filtrar}?${queryParams}`);
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-warning' : 'text-muted'}>
        ★
      </span>
    ));
  };

  const getPolicyDescription = (policy: string) => {
    switch (policy) {
      case 'Anticipo20_72hs':
        return 'Requiere 20% de anticipo y permite cancelación hasta 72hs antes.';
      case 'SinAnticipo_NoCancelable':
        return 'No requiere anticipo, pero no permite cancelaciones.';
      case 'PagoTotal_48hs_50':
        return 'Pago total por adelantado, permite cancelación hasta 48hs antes con 50% de reintegro.';
      default:
        return 'No especificada.';
    }
  };

  return (
    <div className="container mt-4">
      {/* Promotions Carousel */}
      {promotions.length > 0 && (
        <section className="mb-5">
          <h2 className="text-center mb-4">Promociones Especiales</h2>
          <div id="carouselPromociones" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner text-center text-white">
              {promotions.map((promo, index) => {
                const isActive = index === 0 ? 'active' : '';
                const bgClass = index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-success' : 'bg-warning';
                
                return (
                  <div key={promo.id} className={`carousel-item p-5 rounded shadow-lg ${bgClass}`}>
                    <h3 className="mb-3 display-6 fw-bold">{promo.titulo}</h3>
                    <p className="lead">{promo.descripcion}</p>
                    <h4 className="display-6 fw-bold mb-4">{promo.porcentajeDescuento}% OFF</h4>
                    
                    <div className="row justify-content-center">
                      {promo.propiedades && promo.propiedades.slice(0, 3).map((prop: any, propIndex: number) => (
                        <div key={propIndex} className="col-md-3 mb-3">
                          <div className="card text-dark bg-light h-100 shadow-sm">
                            <div className="card-body">
                              <h5 className="card-title">{prop.titulo}</h5>
                              <p className="card-text">{prop.localidad}</p>
                              <p className="card-text text-muted">
                                <del>${prop.precioPorNoche}</del>
                                <strong>${prop.precioPorNoche * (1 - promo.porcentajeDescuento / 100)}</strong> por noche con descuento
                              </p>
                              <a href={`/propiedad/${prop.id}`} className="btn btn-sm btn-primary">Ver más</a>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {promo.propiedades && promo.propiedades.length > 3 && (
                      <button 
                        className="btn btn-link text-white" 
                        data-bs-toggle="modal" 
                        data-bs-target={`#modalPropiedadesPromo_${promo.id}`}
                      >
                        Ver todas las propiedades ({promo.propiedades.length})
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselPromociones" data-bs-slide="prev">
              <span className="carousel-control-prev-icon"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselPromociones" data-bs-slide="next">
              <span className="carousel-control-next-icon"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="container_listar_propiedades mt-5">
        <h2 className="tituloo">Busca tu lugar ideal</h2>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="filtros">
            <div>
              <label>Ubicación:</label>
              <input
                type="text"
                className="form-control"
                value={filters.localidad}
                onChange={(e) => setFilters({...filters, localidad: e.target.value})}
              />
            </div>
            
            <div>
              <label>Cantidad de personas:</label>
              <input
                type="number"
                className="form-control"
                value={filters.cantidadHuespedes}
                onChange={(e) => setFilters({...filters, cantidadHuespedes: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div>
              <label>Fecha de inicio:</label>
              <input
                type="date"
                className="form-control"
                value={filters.fechaInicio}
                onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
              />
            </div>
            
            <div>
              <label>Fecha de fin:</label>
              <input
                type="date"
                className="form-control"
                value={filters.fechaFin}
                onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
              />
            </div>
            
            <button type="submit" className="btn btn-filtrar">Buscar</button>
          </div>
        </form>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="container mt-5">
          <h3 className="mb-3 text-center">Propiedades destacadas</h3>
          <div id="carouselDestacadas" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {featuredProperties.map((property, index) => {
                const isActive = index === 0 ? 'active' : '';
                
                return (
                  <div key={property.id} className={`carousel-item ${isActive}`}>
                    <div className="row justify-content-center">
                      <div className="col-md-4 mb-3">
                        <div className="card h-100">
                          {property.imagenes && property.imagenes.length > 0 ? (
                            <img 
                              src={property.imagenes[0].url} 
                              className="card-img-top" 
                              alt="Imagen destacada" 
                              style={{ height: '180px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <img 
                              src="/imagenes/propiedades/iconoimagen.jpg" 
                              className="card-img-top" 
                              alt="Sin imagen" 
                              style={{ height: '180px', objectFit: 'cover' }} 
                            />
                          )}
                          
                          <div className="card-body">
                            <h5 className="card-title">{property.titulo}</h5>
                            <p className="card-text">{property.descripcion}</p>
                            <a href={`/propiedad/${property.id}`} className="btn btn-sm btn-primary">Ver más</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselDestacadas" data-bs-slide="prev">
              <span className="carousel-control-prev-icon"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselDestacadas" data-bs-slide="next">
              <span className="carousel-control-next-icon"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </section>
      )}

      {/* Search Results */}
      {!loading && properties.length === 0 && (
        <div className="text-center">
          <p>No hay propiedades que cumplan con los requisitos disponibles.</p>
        </div>
      )}
      
      {properties.length > 0 && (
        <section className="container_listar_propiedades">
          <ul className="lista-propiedades">
            {properties.map((property) => {
              const carouselId = `carousel-${property.id}`;
              
              return (
                <li key={property.id} className="propiedad-item">
                  <h3>{property.titulo}</h3>
                  
                  {/* Image Carousel */}
                  <div id={carouselId} className="carousel slide propiedad-carousel" data-bs-ride="carousel">
                    <div className="carousel-inner">
                      {property.imagenes && property.imagenes.map((imagen, index) => (
                        <div key={imagen.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                          <img 
                            src={imagen.url} 
                            className="d-block w-100 propiedad-img" 
                            alt={`Imagen de ${property.titulo}`} 
                          />
                        </div>
                      ))}
                    </div>
                    
                    {property.imagenes && property.imagenes.length > 1 && (
                      <button className="carousel-control-prev" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                      </button>
                    )}
                    {property.imagenes && property.imagenes.length > 1 && (
                      <button className="carousel-control-next" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                      </button>
                    )}
                  </div>
                  
                  <p>{property.descripcion}</p>
                  <p><strong>Dirección:</strong> {property.direccion}</p>
                  <p><strong>Localidad:</strong> {property.localidad}</p>
                  <p><strong>Capacidad:</strong> {property.capacidad} personas</p>
                  <p><strong>Precio por noche:</strong> ${property.precioPorNoche}</p>
                  
                  <div className="calificacion-promedio">
                    <strong>Calificación Promedio:</strong>
                    {property.calificacionPromedio && property.calificacionPromedio > 0 ? (
                      <>
                        <span style={{ color: '#FFD700' }}>★</span>
                        <span> Una sola estrella dorada </span>
                        <span>{property.calificacionPromedio.toFixed(1)}</span>
                        <span> El número al lado (ej. 4.5)</span>
                      </>
                    ) : (
                      <span>sin calificaciones aún</span>
                    )}
                  </div>
                  
                  <div className="info-grupo">
                    <button className="btn btn-primary" onClick={() => window.location.href = `/reservar/${property.id}`}>
                      <i className="fas fa-calendar-check"></i> Reservar esta propiedad
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
