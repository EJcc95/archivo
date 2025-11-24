# Fixes para Errores de Producción

## Problemas Resueltos

### 1. **Errores 401 en Login**
**Problema:** El email de los usuarios de prueba tenía espacios en blanco.
- Admin: `'admin @muninuevoimperial.gob.pe'` ❌ (espacio)
- Genoveva: `'archivocentral @muninuevoimperial.gob.pe'` ❌ (espacio)

**Solución:** Corrección en `backend/database/03_datos.sql`
- Admin: `'admin@muninuevoimperial.gob.pe'` ✅
- Genoveva: `'archivocentral@muninuevoimperial.gob.pe'` ✅

**Acción requerida en Producción:**
```sql
UPDATE usuarios 
SET email = 'admin@muninuevoimperial.gob.pe' 
WHERE nombre_usuario = 'admin@mdni';

UPDATE usuarios 
SET email = 'archivocentral@muninuevoimperial.gob.pe' 
WHERE nombre_usuario = 'genoveva';
```

---

### 2. **Errores 500 en `/api/reports/by-area` (y otros reportes)**

**Problema:** 
- Inconsistencias en campos devueltos (área/cantidad vs name/value)
- Problemas de SQL incompatible con MySQL en producción
- Validación de token encriptado demasiado estricta (24 horas)

**Soluciones Implementadas:**

#### a) Backend - `reportService.js`
✅ Convertidas todas las consultas a raw SQL con try-catch
✅ Agregada conversión explícita de tipos con `CAST(... AS UNSIGNED)`
✅ Estandarizado formato de respuesta a `{name, value}`
✅ Mejorado manejo de errores con mensajes descriptivos

**Consultas Actualizadas:**
- `getDashboardStats()` - documentsByState ahora devuelve `{nombre, value}`
- `getDocumentosByArea()` - devuelve `{name, value}`
- `getDocumentosByTipo()` - devuelve `{name, value}`
- `getDocumentosByEstado()` - devuelve `{name, value}`

#### b) Frontend - `reportService.ts`
✅ Actualizado mapeo de campos para coincidir con backend
- `item.area` → `item.name`
- `item.cantidad` → `item.value`
- `item.tipo` → `item.name`
- `item.estado` → `item.name`
- `item.count` → `item.value` (en documentsByState)

#### c) Frontend - `DashboardPage.tsx`
✅ Corregido mapeo en gráfico de estados
- `item.estado` → `item.nombre`
- `item.count` → `item.value`

#### d) Frontend - `encryption.ts`
✅ Extendida validación de antigüedad en producción
- Desarrollo: 24 horas
- Producción: 7 días
- Previene rechazo de tokens por desincronización de relojes

---

## Cambios Implementados

### Backend
```javascript
// Antes
async getDocumentosByArea() {
  return await Documento.findAll({ ... }); // Sequelize ORM
}

// Después
async getDocumentosByArea() {
  try {
    const result = await sequelize.query(`
      SELECT 
        a.nombre_area as name,
        CAST(COUNT(d.id_documento) AS UNSIGNED) as value
      FROM documentos d
      INNER JOIN areas a ON d.id_area_origen = a.id_area
      WHERE d.eliminado = 0
      GROUP BY a.id_area, a.nombre_area
      ORDER BY a.nombre_area ASC
    `, { type: sequelize.QueryTypes.SELECT });
    
    return (result || []).map(row => ({
      name: row.name || 'Sin área',
      value: parseInt(row.value) || 0
    }));
  } catch (error) {
    console.error('Error in getDocumentosByArea:', error.message);
    throw new Error('No se pudo obtener documentos por área: ' + error.message);
  }
}
```

### Frontend
```typescript
// Antes
getDocumentosByArea: async () => {
  const { data } = await api.get('/reports/by-area');
  return data.data.map((item: any) => ({
    name: item.area,        // ❌ campo incorrecto
    value: parseInt(item.cantidad)
  }));
}

// Después
getDocumentosByArea: async () => {
  const { data } = await api.get('/reports/by-area');
  return data.data.map((item: any) => ({
    name: item.name,        // ✅ campo correcto
    value: parseInt(item.value)
  }));
}
```

---

## Pasos a Realizar en Producción

### 1. Backup de Base de Datos
```bash
mysqldump -u usuario -p base_datos > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Corregir Datos de Usuarios
```sql
UPDATE usuarios 
SET email = 'admin@muninuevoimperial.gob.pe' 
WHERE nombre_usuario = 'admin@mdni';

UPDATE usuarios 
SET email = 'archivocentral@muninuevoimperial.gob.pe' 
WHERE nombre_usuario = 'genoveva';
```

### 3. Deploy Backend
```bash
# Copiar/actualizar backend
git pull origin main
npm install  # si hay cambios en package.json
npm run build  # si aplica
pm2 restart archivo-backend  # o tu comando para reiniciar
```

### 4. Deploy Frontend
```bash
# Copiar/actualizar frontend
git pull origin main
npm install
npm run build
# Copiar dist/ a servidor web (nginx/apache)
cp -r dist/* /var/www/html/archivo/
```

### 5. Verificar
```bash
# Verificar logs del backend
tail -f /var/log/archivo/backend.log

# Probar login en navegador
# Usuario: admin@muninuevoimperial.gob.pe o admin@mdni
# Contraseña: [tu_contraseña]

# Probar endpoint de reportes
curl -H "Authorization: Bearer [token]" \
  https://api.muninuevoimperial.gob.pe/api/reports/by-area
```

---

## Archivos Modificados

### Backend
- ✅ `backend/src/services/reportService.js` - SQL queries y manejo de errores
- ✅ `backend/database/03_datos.sql` - Emails corregidos

### Frontend
- ✅ `frontend/src/services/reportService.ts` - Mapeo de campos actualizado
- ✅ `frontend/src/pages/DashboardPage.tsx` - Mapeo en gráfico
- ✅ `frontend/src/utils/encryption.ts` - Validación de antigüedad mejorada

---

## Problemas Conocidos Resueltos

| Problema | Causa | Solución | Estado |
|----------|-------|----------|--------|
| 401 en login | Emails con espacios | Corregir datos en BD | ✅ SQL actualizado |
| 500 en /reports/* | Campos mal mapeados | Estandarizar a {name, value} | ✅ Implementado |
| SQL incompatible | GROUP BY en producción | Conversión de tipos CAST | ✅ Implementado |
| Token rechazado | Validación 24h estricta | Extender a 7 días en prod | ✅ Implementado |

---

## Testing Post-Deploy

### Backend
```bash
# Test directo a la BD
mysql> SELECT * FROM usuarios WHERE email LIKE '%admin%';
mysql> SELECT * FROM usuarios WHERE email LIKE '%archivo%';
```

### Frontend
1. **Login:** ✓ Acceso con email correcto
2. **Dashboard:** ✓ Carga de estadísticas
3. **Charts:** ✓ Carga de gráficos
   - Estado de Documentos (pie)
   - Documentos por Área (bar)
   - Documentos por Tipo
   - Documentos por Estado

### API
```bash
# Con token válido
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.muninuevoimperial.gob.pe/api/reports/dashboard

curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.muninuevoimperial.gob.pe/api/reports/by-area
```

---

## Notas de Seguridad

- ⚠️ Los emails ahora son más críticos (sin espacios)
- ⚠️ La validación de encriptación es menos estricta en producción
- ⚠️ Revisar logs regularmente por errores de BD
- ✅ Todos los endpoints requieren autenticación
- ✅ Permisos `reports_access` siguen siendo obligatorios

---

## Soporte

Si persisten errores:
1. Revisar logs del backend: `tail -f /var/log/archivo/backend.log`
2. Verificar conexión a BD: `mysql -u usuario -p -e "SELECT 1"`
3. Verificar variables de entorno de conexión
4. Confirmar que el rol del usuario tiene permiso `reports_access`

