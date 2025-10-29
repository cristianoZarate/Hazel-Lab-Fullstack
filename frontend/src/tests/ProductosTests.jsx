// src/components/__tests__/Productos.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Productos } from '../../pages/Productos/Productos';
import { getProductos, getCategorias } from '../../services/api';

// Mock de las APIs
jest.mock('../../services/api', () => ({
  getProductos: jest.fn(),
  getCategorias: jest.fn(),
  agregarItemCarrito: jest.fn()
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Componente Productos', () => {
  const mockProductos = [
    {
      id: 1,
      name: 'Producto Test 1',
      description: 'Descripción del producto 1',
      cost: 10000,
      category: { id: 1, nombre: 'Categoría 1' },
      image: '/test1.jpg'
    },
    {
      id: 2,
      name: 'Producto Test 2', 
      description: 'Descripción del producto 2',
      cost: 15000,
      category: { id: 2, nombre: 'Categoría 2' },
      image: '/test2.jpg'
    }
  ];

  const mockCategorias = [
    { id: 1, nombre: 'Categoría 1' },
    { id: 2, nombre: 'Categoría 2' }
  ];

  beforeEach(() => {
    getProductos.mockResolvedValue({ data: mockProductos });
    getCategorias.mockResolvedValue({ data: mockCategorias });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar todos los productos correctamente', async () => {
    render(<Productos />);
    
    await waitFor(() => {
      expect(screen.getByText('Producto Test 1')).toBeInTheDocument();
      expect(screen.getByText('Producto Test 2')).toBeInTheDocument();
    });
  });

  it('debe mostrar el número correcto de productos', async () => {
    render(<Productos />);
    
    await waitFor(() => {
      const productos = screen.getAllByRole('article');
      expect(productos).toHaveLength(2);
    });
  });

  it('debe mostrar precios formateados correctamente', async () => {
    render(<Productos />);
    
    await waitFor(() => {
      expect(screen.getByText('$10.000')).toBeInTheDocument();
      expect(screen.getByText('$15.000')).toBeInTheDocument();
    });
  });
});