# 🔍 Logs de Depuración Agregados

## 📋 **Logs Agregados para Debuggear el Problema 403**

### **Archivo**: `hooks/use-api.ts`
- ✅ Log cuando no hay token disponible
- ✅ Log del token que se está usando (primeros 20 caracteres)
- ✅ Log de la URL que se está llamando
- ✅ Log del status de la respuesta HTTP
- ✅ Log de éxito o error en la carga de datos
- ✅ Log de errores de conexión

### **Archivo**: `contexts/auth-context.tsx`
- ✅ Log de inicialización del contexto
- ✅ Log de datos guardados en localStorage
- ✅ Log de usuario y token cargados
- ✅ Log de proceso de login exitoso
- ✅ Log de guardado en localStorage
- ✅ Log de redirección a dashboard

## 🧪 **Cómo Usar los Logs**

### **1. Abrir DevTools del Navegador**
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña `Console`

### **2. Hacer Login**
- Ve a `/login`
- Ingresa `admin` / `admin.2025`
- Observa los logs en la consola

### **3. Navegar a Usuarios**
- Ve a `/administracion/usuarios`
- Observa los logs en la consola

### **4. Buscar Patrones**
Los logs te mostrarán:
- ✅ Si el token se guarda correctamente
- ✅ Si el token se carga del localStorage
- ✅ Si el token se envía en las peticiones
- ✅ Qué status devuelven las APIs

## 🔍 **Qué Buscar en los Logs**

### **Logs Esperados (Funcionando Correctamente):**
```
🔍 AuthContext: Inicializando contexto...
🔍 AuthContext: Datos guardados: { hasUser: true, hasToken: true, tokenPreview: "eyJhbGciOiJIUzI1NiIs..." }
✅ AuthContext: Usuario cargado: admin
✅ AuthContext: Token cargado: eyJhbGciOiJIUzI1NiIs...
🔍 AuthContext: Finalizando carga...
🔍 useApi: Iniciando fetchData con token: eyJhbGciOiJIUzI1NiIs...
🌐 useApi: URL: /api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc
📡 useApi: Response status: 200
✅ useApi: Datos cargados exitosamente: 1 elementos
```

### **Logs Problemáticos (Problema Identificado):**
```
🔍 AuthContext: Inicializando contexto...
⚠️ AuthContext: No hay datos guardados
🔍 AuthContext: Finalizando carga...
🚨 useApi: No hay token disponible, saltando fetchData
```

## 🎯 **Próximos Pasos**

1. **Ejecutar la aplicación** con los logs
2. **Hacer login** y observar la consola
3. **Navegar a usuarios** y observar la consola
4. **Identificar dónde falla** el flujo
5. **Reportar los logs** para diagnóstico

---

**Logs agregados**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Archivos modificados**: 2 (hooks/use-api.ts, contexts/auth-context.tsx)  
**Estado**: 🔍 Listo para debugging
