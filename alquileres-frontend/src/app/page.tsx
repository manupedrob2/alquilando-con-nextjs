'use client';

import { useState, useEffect } from 'react';
import { apiService, Propiedad, Promocion } from '@/lib/apiService';
import Link from 'next/link';

export default function HomePage() {
  const [propiedadesDestacadas, setPropiedadesDestacadas] = useState<Propiedad[]>([]);
  const [promocionesActivas, setPromocionesActivas] = useState<Promocion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propiedades, promociones] = await Promise.all([
          apiService.getPropiedadesDestacadas(),
          apiService.getPromocionesActivas()
        ]);
        
        setPropiedadesDestacadas(propiedades);
        setPromocionesActivas(promociones);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Encuentra tu Alquiler Ideal
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Las mejores propiedades para tus vacaciones o estadías largas. 
              Calidad garantizada y atención personalizada.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/propiedades"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-white text-blue-600 hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Explorar Propiedades
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades Destacadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Propiedades Destacadas
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Las opciones más populares y recomendadas por nuestros clientes
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {propiedadesDestacadas.map((propiedad) => (
            <div key={propiedad.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                {propiedad.imagenes.length > 0 ? (
                  <img
                    src={`http://localhost:5234${propiedad.imagenes[0]}`}
                    alt={propiedad.titulo}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  Destacado
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{propiedad.titulo}</h3>
                <p className="mt-2 text-gray-600">{propiedad.descripcion}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      ${propiedad.precio}
                    </span>
                    <span className="text-gray-500 ml-1">/noche</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>{propiedad.capacidad}</span> huéspedes
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {propiedad.localidad}
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/propiedades/${propiedad.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center block"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {propiedadesDestacadas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay propiedades destacadas disponibles en este momento.</p>
          </div>
        )}
      </div>

      {/* Promociones Activas */}
      {promocionesActivas.length > 0 && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Ofertas Especiales
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Aprovecha nuestras promociones exclusivas
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {promocionesActivas.map((promocion) => (
                <div key={promocion.id} className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow-lg overflow-hidden border border-red-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{promocion.titulo}</h3>
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{promocion.porcentajeDescuento}%
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-600">{promocion.descripcion}</p>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Válida hasta: {new Date(promocion.fechaFin).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {promocion.propiedades && promocion.propiedades.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Aplica en:</p>
                        <div className="mt-2 space-y-1">
                          {promocion.propiedades.slice(0, 2).map((prop) => (
                            <div key={prop.id} className="text-sm text-gray-600">
                              • {prop.titulo}
                              {prop.precioConDescuento && (
                                <span className="ml-2 text-green-600 font-medium">
                                  ${prop.precioConDescuento}/noche
                                </span>
                              )}
                            </div>
                          ))}
                          {promocion.propiedades.length > 2 && (
                            <div className="text-sm text-gray-500">
                              y {promocion.propiedades.length - 2} más...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              ¿Por qué elegirnos?
            </h2>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Calidad Garantizada</h3>
              <p className="mt-2 text-gray-600">
                Todas nuestras propiedades son verificadas y cumplen con los más altos estándares de calidad.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Precios Justos</h3>
              <p className="mt-2 text-gray-600">
                Las mejores tarifas del mercado sin cargos ocultos ni comisiones adicionales.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Soporte 24/7</h3>
              <p className="mt-2 text-gray-600">
                Atención personalizada durante toda tu estadía, estamos aquí para ayudarte en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
