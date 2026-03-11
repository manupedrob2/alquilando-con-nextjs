const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5234/api';

export const api = {
  base: API_BASE_URL,
  
  // URLs de endpoints
  endpoints: {
    // Autenticación
    auth: {
      login: `${API_BASE_URL}/usuarios/login`,
      register: `${API_BASE_URL}/usuarios/register`,
      profile: `${API_BASE_URL}/usuarios/perfil`,
    },
    
    // Propiedades
    propiedades: {
      list: `${API_BASE_URL}/propiedades`,
      destacadas: `${API_BASE_URL}/propiedades/destacadas`,
      filtrar: `${API_BASE_URL}/propiedades/filtrar`,
      byId: (id: number) => `${API_BASE_URL}/propiedades/${id}`,
      crear: `${API_BASE_URL}/propiedades`,
      actualizar: (id: number) => `${API_BASE_URL}/propiedades/${id}`,
      noHabitable: (id: number) => `${API_BASE_URL}/propiedades/${id}/no-habitable`,
    },
    
    // Reservas
    reservas: {
      crear: `${API_BASE_URL}/reservas`,
      misReservas: `${API_BASE_URL}/reservas/mis-reservas`,
      admin: `${API_BASE_URL}/reservas/admin`,
      byId: (id: number) => `${API_BASE_URL}/reservas/${id}`,
      modificar: (id: number) => `${API_BASE_URL}/reservas/${id}`,
      cancelar: (id: number) => `${API_BASE_URL}/reservas/${id}`,
      visualizar: (id: number) => `${API_BASE_URL}/reservas/${id}/visualizar`,
    },
    
    // Imágenes
    imagenes: {
      upload: `${API_BASE_URL}/imagenes/upload`,
      uploadMultiple: `${API_BASE_URL}/imagenes/upload-multiple`,
      porPropiedad: (propiedadId: number) => `${API_BASE_URL}/imagenes/propiedad/${propiedadId}`,
      eliminar: (id: number) => `${API_BASE_URL}/imagenes/${id}`,
      archivo: (fileName: string) => `${API_BASE_URL}/imagenes/uploads/${fileName}`,
    },
    
    // Promociones
    promociones: {
      list: `${API_BASE_URL}/promociones`,
      activas: `${API_BASE_URL}/promociones/activas`,
      byId: (id: number) => `${API_BASE_URL}/promociones/${id}`,
      crear: `${API_BASE_URL}/promociones`,
      modificar: (id: number) => `${API_BASE_URL}/promociones/${id}`,
      eliminar: (id: number) => `${API_BASE_URL}/promociones/${id}`,
    },
  },
};

// Configuración de headers por defecto
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
