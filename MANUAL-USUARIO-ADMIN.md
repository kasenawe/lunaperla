# Manual de Usuario Final - Administrador

Este manual esta pensado para la operacion diaria del panel administrativo de Luna Gold.

## 1. Acceso al panel

1. Entrar a la ruta /admin en el sitio.
2. Ingresar usuario y contraseña de administrador.
3. Si la sesion expira, volver a iniciar sesion.

Nota:

- Las credenciales se configuran en backend (ADMIN_USERNAME y ADMIN_PASSWORD).

## 2. Estructura del panel

El panel tiene 3 secciones principales:

- Productos
- Categorias
- Colecciones

En todas las secciones:

- Hay mensajes de exito o error luego de cada accion.
- Al crear o editar, el panel hace scroll automatico al formulario.

## 3. Gestion de productos

### 3.1 Crear producto

1. Ir a Productos.
2. Click en + Nuevo Producto.
3. Completar campos obligatorios:
   - Nombre
   - Precio base
   - Imagen
   - Descripcion
   - Categoria
4. Campos opcionales:
   - Codigo de producto (product_code)
   - Coleccion
   - Estado activo/inactivo
5. Guardar.

Buenas practicas:

- El Codigo de producto debe ser unico para evitar conflictos de trazabilidad.
- Usar una descripcion clara para soporte y ventas.

### 3.2 Editar producto

1. Buscar el producto en la tabla.
2. Click en Editar.
3. Modificar datos necesarios.
4. Guardar cambios.

### 3.3 Eliminar producto

1. Click en Eliminar.
2. Confirmar la accion.

Importante:

- La eliminacion es permanente.

## 4. Gestion de variantes por producto

Las variantes se administran dentro de la edicion de cada producto.

### 4.1 Abrir modulo de variantes

1. En Productos, click en Editar sobre un producto.
2. Debajo del formulario del producto aparece el bloque Variantes.

### 4.2 Campos de una variante

- SKU: identificador unico de variante.
- Etiqueta: nombre visible de la variante (ejemplo: 18K 3mm bombe).
- Kilataje: ejemplo 10K o 18K.
- Ancho (mm): ancho de la pieza.
- Perfil: ejemplo bombe o doble_bombe.
- Cierre: ejemplo rosca o pasante.
- Precio: precio final de esa variante.
- Orden: define el orden de aparicion.
- Activa: si se muestra o no en checkout.
- Metadata (JSON): datos tecnicos extra.

### 4.3 Crear variante

1. Click en + Nueva Variante.
2. Completar al menos:
   - SKU
   - Etiqueta
   - Precio
3. Completar opcionales segun necesidad comercial.
4. Guardar.

### 4.4 Editar variante

1. En la tabla de variantes, click en Editar.
2. Ajustar campos.
3. Guardar.

### 4.5 Eliminar variante

1. En la tabla de variantes, click en Eliminar.
2. Confirmar.

### 4.6 Recomendacion para alianzas y bebe

Para un manejo profesional:

- Separar por kilataje (10K/18K).
- Cargar ancho en mm.
- Cargar perfil (bombe/doble_bombe) cuando aplique.
- Mantener SKU estable para trazabilidad en ordenes.

## 5. Gestion de categorias

### 5.1 Crear categoria

1. Ir a Categorias.
2. Click en + Nueva Categoria.
3. Completar:
   - Nombre
   - Slug
   - Descripcion
   - Orden
   - Estado
4. Guardar.

### 5.2 Editar o eliminar categoria

- Editar: ajusta nombre/slug/orden/estado.
- Eliminar: solo posible si no tiene productos o colecciones asociadas.

## 6. Gestion de colecciones

### 6.1 Crear coleccion

1. Ir a Colecciones.
2. Click en + Nueva Coleccion.
3. Completar:
   - Nombre
   - Slug
   - Categoria asociada
   - Descripcion
   - Orden
   - Estado
4. Guardar.

### 6.2 Editar o eliminar coleccion

- Editar: permite cambiar datos y categoria asociada.
- Eliminar: solo posible si no tiene productos asociados.

## 7. Impacto en checkout

- Si un producto tiene variantes activas, el cliente las puede seleccionar en el modal de compra.
- El precio mostrado y enviado al pago se toma de la variante elegida.
- En Mercado Pago se envia tambien el snapshot de la variante seleccionada.

## 8. Reglas operativas recomendadas

- No reutilizar SKU entre variantes diferentes.
- Usar nombres de etiqueta consistentes.
- Revisar que el precio de variante sea correcto antes de activar.
- Evitar borrar variantes historicas usadas en campañas; preferir desactivar.
- Probar una compra de control al cambiar variantes criticas.

## 9. Resolucion de problemas comunes

### 9.1 Error de sesion

- Mensaje tipico: sesion expirada.
- Solucion: volver a iniciar sesion en /admin.

### 9.2 Error al guardar variante (duplicado)

- Causa frecuente: SKU repetido o etiqueta repetida dentro del producto.
- Solucion: usar SKU unico y etiqueta diferenciada.

### 9.3 No aparecen variantes en el producto

- Verificar que la variante este activa.
- Verificar que se guardo correctamente en admin.
- Verificar conectividad con backend.

### 9.4 Error al subir imagen de producto

- Si aparece un error de subida, revisar primero formato y tamaño del archivo.
- El panel usa subida directa a Supabase Storage con URL firmada.
- Reintentar con una imagen optimizada (menos peso y resolucion razonable).
- Si persiste, revisar variables de backend: SUPABASE_SERVICE_ROLE_KEY y SUPABASE_STORAGE_BUCKET.

## 10. Checklist rapido diario

1. Revisar productos nuevos o modificados.
2. Verificar variantes activas de productos clave.
3. Confirmar precios de variantes principales.
4. Revisar categorias/colecciones recientes.
5. Hacer una prueba breve de compra si hubo cambios grandes.
