# Sistema de Inactividad de Sesión

## Descripción General

El sistema implementa un mecanismo de control de inactividad de sesión que:

1. **Cierra la sesión automáticamente** después de 5 minutos sin actividad
2. **Advierte al usuario** 1 minuto antes del cierre (a los 4 minutos) con un modal interactivo
3. **Sincroniza múltiples pestañas/ventanas** - La actividad en una pestaña reinicia el contador en todas las demás
4. **Logout global** - Al cerrar sesión, todas las pestañas se cierran simultáneamente

## Componentes

### 1. Hook: `useInactivityLogout`
**Ubicación**: `src/hooks/useInactivityLogout.ts`

Maneja la lógica de inactividad y comunicación entre pestañas.

**Features:**
- Detecta actividad del usuario (click, tecla, scroll, touch)
- Timers para warning (4 min) y logout (5 min)
- BroadcastChannel API para sincronización entre pestañas
- Countdown en tiempo real (segundos)

**Retorna:**
```typescript
{
  showWarning: boolean;        // Muestra u oculta el modal
  timeRemaining: number;       // Segundos restantes
  extendSession: () => void;   // Extender sesión (dismiss warning)
  performLogout: () => void;   // Logout inmediato
}
```

### 2. Modal: `InactivityWarningModal`
**Ubicación**: `src/components/ui/InactivityWarningModal.tsx`

Componente visual que muestra la advertencia de sesión por expirar.

**Props:**
```typescript
{
  isOpen: boolean;           // Mostrar/ocultar modal
  timeRemaining: number;     // Segundos restantes (para countdown)
  onExtend: () => void;      // Callback para extender sesión
  onLogout: () => void;      // Callback para logout
}
```

**Features:**
- Countdown en formato MM:SS
- Bloquea scroll del body cuando está abierto
- Botones para extender o cerrar sesión
- Diseño responsivo con backdrop blur

## Integración

### En `App.tsx`
```tsx
import { useInactivityLogout } from '@/hooks';
import { InactivityWarningModal } from '@/components/ui';

function AppContent() {
  const { showWarning, timeRemaining, extendSession, performLogout } = useInactivityLogout();

  return (
    <>
      <AppRouter />
      <InactivityWarningModal
        isOpen={showWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={performLogout}
      />
      <Toaster {...} />
    </>
  );
}
```

## Cómo Funciona

### Timelines
```
T=0min          → Usuario inicia sesión / última actividad
T=4min 0seg     → Modal de advertencia aparece
T=4min 0seg-5min → Countdown en tiempo real (60seg → 0seg)
T=5min          → Logout automático si no hay actividad
```

### Sincronización entre Pestañas

**Pestaña A con actividad:**
1. Usuario hace click en Pestaña A
2. `registerActivity()` se ejecuta
3. localStorage se actualiza: `lastActivity = Date.now()`
4. BroadcastChannel envía: `{ type: 'ACTIVITY' }`
5. **Todas las otras pestañas reciben el mensaje**
6. En Pestaña B, C, etc: `resetInactivityTimer()` se ejecuta
7. Todos los timers se reinician

**Logout en cualquier pestaña:**
1. Usuario hace click en "Cerrar sesión" en Pestaña A
2. `performLogout()` se ejecuta
3. BroadcastChannel envía: `{ type: 'LOGOUT' }`
4. **Todas las otras pestañas reciben el mensaje**
5. En todas las pestañas: `performLogout()` se ejecuta
6. `logout()` (AuthContext) se ejecuta
7. Usuario es redirigido a login en **todas las pestañas**

## Eventos que Resetean el Timer

```typescript
const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
```

Cualquier interacción del usuario resetea los 5 minutos.

## LocalStorage

**Clave usada**: `lastActivity`
- Almacena timestamp de última actividad
- Se limpia al logout
- Se usa para debugging (verificar si hay actividad reciente)

## BroadcastChannel

**Canal**: `session_activity`

**Mensajes:**
```typescript
// Actividad detectada
{ type: 'ACTIVITY', timestamp: 1234567890 }

// Logout ejecutado
{ type: 'LOGOUT', timestamp: 1234567890 }
```

## Consideraciones

### Fallbacks
- Si BroadcastChannel no está disponible (navegadores antiguos), el sistema sigue funcionando pero sin sincronización entre pestañas
- Se muestra advertencia en consola pero no afecta la funcionalidad

### Performance
- Todos los timers se limpian al desmontar el componente
- localStorage se usa mínimamente (solo para sincronización)
- BroadcastChannel no consume recursos significativos

### Seguridad
- El logout se ejecuta en el contexto de autenticación
- Los tokens se eliminan de forma segura (función `clearSecureStorage`)
- La sincronización se basa en mensajes internos (no afecta tokens)

## Testing

### Caso 1: Timeout automático
1. Login en el sistema
2. Esperar 4 minutos sin hacer nada
3. Debe aparecer modal con countdown
4. Esperar 1 minuto más
5. Sistema debe hacer logout automático

### Caso 2: Extender sesión
1. Login en el sistema
2. Esperar 4 minutos
3. Aparece modal
4. Click en "Continuar sesión"
5. Modal debe desaparecer
6. Contador debe reiniciarse a 5 minutos

### Caso 3: Múltiples pestañas - Actividad sincronizada
1. Login en Pestaña A y Pestaña B
2. En Pestaña A: Esperar 4 minutos → aparece modal
3. En Pestaña B: Hacer click en cualquier lado
4. En Pestaña A: Modal debe desaparecer automáticamente
5. Timer debe reiniciarse en ambas

### Caso 4: Múltiples pestañas - Logout sincronizado
1. Login en Pestaña A y Pestaña B
2. En Pestaña A: Click en "Cerrar sesión" en el modal de inactividad (o en UserDropdown)
3. Ambas pestañas deben hacer logout simultáneamente
4. Ambas deben redirigirse a /login

## Configuración Modificable

En `useInactivityLogout.ts`, puedes ajustar:

```typescript
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;    // Total de inactividad (ms)
const WARNING_TIME = 1 * 60 * 1000;          // Cuándo mostrar warning (ms)
const STORAGE_KEY = 'lastActivity';          // Clave de localStorage
const SESSION_BROADCAST_CHANNEL = 'session_activity';  // Nombre del canal
```

Por ejemplo, para cambiar a 3 minutos:
```typescript
const INACTIVITY_TIMEOUT = 3 * 60 * 1000;    // 3 minutos
const WARNING_TIME = 0.5 * 60 * 1000;        // Warning a los 2.5 minutos
```
