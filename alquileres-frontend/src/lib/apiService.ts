import axios, { AxiosResponse } from 'axios';
import { api, getAuthHeaders } from './api';

// Tipos de datos basados en las entidades del backend
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Propiedad {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  localidad: string;
  capacidad: number;
  disponible: boolean;
  calificacionPromedio: number;
  imagenes: string[];
}

export interface Reserva {
  id: number;
  propiedadId: number;
  propiedad?: {
    id: number;
    titulo: string;
    direccion: string;
    localidad: string;
  };
  clienteId: number;
  fechaInicio: string;
  fechaFin: string;
  precioTotal: number;
  estado: string;
  cantidadHuespedes: number;
}

export interface Promocion {
  id: number;
  titulo: string;
  descripcion: string;
  porcentajeDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  propiedades?: Array<{
    id: number;
    titulo: string;
    precio: number;
    precioConDescuento?: number;
  }>;
}

export interface SearchFilters {
  localidad?: string;
  cantidadHuespedes?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

// Clase para manejar la API
class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Métodos de autenticación
  async login(email: string, contraseña: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        api.endpoints.auth.login,
        { email, contraseña }
      );
      
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    contraseña: string;
    fechaNacimiento: string;
  }): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        api.endpoints.auth.register,
        userData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile(): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.get(
        api.endpoints.auth.profile,
        { headers: getAuthHeaders(this.getToken() || undefined) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Métodos de propiedades
  async getPropiedades(): Promise<Propiedad[]> {
    try {
      const response: AxiosResponse<Propiedad[]> = await axios.get(
        api.endpoints.propiedades.list
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPropiedadesDestacadas(): Promise<Propiedad[]> {
    try {
      const response: AxiosResponse<Propiedad[]> = await axios.get(
        api.endpoints.propiedades.destacadas
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async filtrarPropiedades(filters: SearchFilters): Promise<Propiedad[]> {
    try {
      const response: AxiosResponse<Propiedad[]> = await axios.get(
        api.endpoints.propiedades.filtrar,
        { 
          params: filters,
          headers: getAuthHeaders(this.getToken() || undefined)
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPropiedad(id: number): Promise<Propiedad> {
    try {
      const response: AxiosResponse<Propiedad> = await axios.get(
        api.endpoints.propiedades.byId(id)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Métodos de reservas
  async crearReserva(reservaData: {
    propiedadId: number;
    fechaInicio: string;
    fechaFin: string;
    cantidadHuespedes: number;
  }): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        api.endpoints.reservas.crear,
        reservaData,
        { headers: getAuthHeaders(this.getToken() || undefined) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMisReservas(): Promise<Reserva[]> {
    try {
      const response: AxiosResponse<Reserva[]> = await axios.get(
        api.endpoints.reservas.misReservas,
        { headers: getAuthHeaders(this.getToken() || undefined) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReserva(id: number): Promise<Reserva> {
    try {
      const response: AxiosResponse<Reserva> = await axios.get(
        api.endpoints.reservas.byId(id),
        { headers: getAuthHeaders(this.getToken() || undefined) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelarReserva(id: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        api.endpoints.reservas.cancelar(id),
        { headers: getAuthHeaders(this.getToken() || undefined) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Métodos de promociones
  async getPromociones(): Promise<Promocion[]> {
    try {
      const response: AxiosResponse<Promocion[]> = await axios.get(
        api.endpoints.promociones.list
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPromocionesActivas(): Promise<Promocion[]> {
    try {
      const response: AxiosResponse<Promocion[]> = await axios.get(
        api.endpoints.promociones.activas
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message || 'Error desconocido';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Error desconocido');
  }
}

export const apiService = new ApiService();
