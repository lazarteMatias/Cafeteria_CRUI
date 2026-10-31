const express = require('express');

const app = express();
const PORT = 3000;

// Middleware: convierte el cuerpo JSON de las peticiones en req.body
app.use(express.json());

// "Base de datos" en memoria
const productos = [
  { id: 1, nombre: 'Café con leche', precio: 1800, categoria: 'bebida' },
  { id: 2, nombre: 'Medialuna', precio: 900, categoria: 'comida' },
  { id: 3, nombre: 'Tostado de jamón y queso', precio: 3500, categoria: 'comida' },
  { id: 4, nombre: 'Agua mineral', precio: 1200, categoria: 'bebida' }
];

// Contador para generar ids nuevos (nunca reutiliza ids de productos eliminados)
let siguienteId = 5;

// Valida los datos recibidos. Devuelve un mensaje de error, o null si todo está bien.
function validarProducto(datos) {
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    return 'El nombre es obligatorio y no puede estar vacío.';
  }
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    return 'El precio debe ser un número mayor que cero (no se acepta texto).';
  }
  if (datos.categoria !== undefined &&
      (typeof datos.categoria !== 'string' || datos.categoria.trim() === '')) {
    return 'La categoría, si se envía, debe ser un texto no vacío.';
  }
  return null;
}

// GET / -> bienvenida
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de la Cafetería del CRUI ☕');
});

// GET /api/productos -> listar todos
app.get('/api/productos', (req, res) => {
  res.status(200).json(productos);
});

// GET /api/productos/:id -> buscar uno
app.get('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  res.status(200).json(producto);
});

// POST /api/productos -> crear
app.post('/api/productos', (req, res) => {
  const datos = req.body || {};

  const error = validarProducto(datos);
  if (error) {
    return res.status(400).json({ error });
  }

  const nuevo = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    precio: datos.precio,
    categoria: datos.categoria ? datos.categoria.trim() : 'sin categoría'
  };

  productos.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT /api/productos/:id -> modificar
app.put('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const datos = req.body || {};
  const error = validarProducto(datos);
  if (error) {
    return res.status(400).json({ error });
  }

  producto.nombre = datos.nombre.trim();
  producto.precio = datos.precio;
  if (datos.categoria !== undefined) {
    producto.categoria = datos.categoria.trim();
  }

  res.status(200).json(producto);
});

// DELETE /api/productos/:id -> eliminar
app.delete('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const [eliminado] = productos.splice(indice, 1);
  res.status(200).json(eliminado);
});

// Manejo de errores: JSON mal formado en el body -> 400 en formato JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido.' });
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
