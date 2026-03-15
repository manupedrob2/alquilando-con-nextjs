import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await fetch(`${api.endpoints.propiedades.byId(parseInt(id as string))}`);
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    if (!user) {
      alert('Debes iniciar sesión para reservar');
      return;
    }
    // Lógica de reserva aquí
    window.location.href = `/reservar/${id}`;
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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <div className="spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <p>Cargando información de la propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <p>No se pudo cargar la información de la propiedad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            {property.imagenes && property.imagenes.length > 0 && (
              <div id="carousel-reserva" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {property.imagenes.map((imagen, index) => (
                    <div key={imagen.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                      <img 
                        src={imagen.url} 
                        className="d-block w-100" 
                        alt={`Imagen de ${property.titulo}`} 
                        style={{ height: '400px', objectFit: 'cover' }} 
                      />
                    </div>
                  ))}
                </div>
                
                {property.imagenes.length > 1 && (
                  <>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carousel-reserva" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Anterior</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carousel-reserva" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Siguiente</span>
                    </button>
                  </>
                )}
              </div>
            )}
            
            <div className="card-body">
              <h3 className="card-title">{property.titulo}</h3>
              <p className="card-text">{property.descripcion}</p>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Dirección:</strong> {property.direccion}</p>
                  <p><strong>Localidad:</strong> {property.localidad}</p>
                  <p><strong>Capacidad:</strong> {property.capacidad} personas</p>
                  <p><strong>Precio por noche:</strong> ${property.precioPorNoche}</p>
                </div>
                
                <div className="col-md-6">
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
                  
                  <div className="mt-3">
                    <h5>Servicios:</h5>
                    {property.serviciosDisponibles && property.serviciosDisponibles.length > 0 ? (
                      <ul>
                        {property.serviciosDisponibles.map((servicio, index) => (
                          <li key={index}>{servicio}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No se especificaron servicios.</p>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <h5>Política de cancelación:</h5>
                    <p>{getPolicyDescription(property.politicasCancelacion || '')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="info-grupo">
              <h4>Reservar esta propiedad</h4>
              
              <div className="mb-3">
                <label className="form-label">Fecha de reserva:</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Cantidad de huéspedes:</label>
                <input
                  type="number"
                  className="form-control"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  min="1"
                  max={property.capacidad}
                />
              </div>
              
              <button 
                className="btn btn-primary w-100" 
                onClick={handleReserve}
                disabled={!selectedDate || !user}
              >
                <i className="fas fa-calendar-check"></i> Reservar esta propiedad
              </button>
              
              {!user && (
                <div className="alert alert-info mt-3">
                  <p>Debes <a href="/login">iniciar sesión</a> para poder reservar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
