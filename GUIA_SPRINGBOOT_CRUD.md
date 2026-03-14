# 📚 Guía Completa: Spring Boot CRUD - To Do List

## 🎯 Estructura General de un CRUD en Spring Boot

Un CRUD es un patrón de 4 operaciones básicas:
- **C**reate (Crear) → POST
- **R**ead (Leer) → GET
- **U**pdate (Actualizar) → PUT/PATCH
- **D**elete (Eliminar) → DELETE

### Flujo típico de un request:
```
Cliente (React) 
    ↓ (HTTP Request)
Controlador (@RestController)
    ↓ (Lógica de negocio)
Repositorio (JpaRepository) 
    ↓ (Ejecuta consulta SQL)
Base de datos (PostgreSQL)
    ↓
Repositorio (Retorna datos)
    ↓
Controlador (Convierte a JSON)
    ↓ (HTTP Response)
Cliente (React recibe JSON)
```

---

## 📦 Componentes clave en tu proyecto

### 1. **MODELS** (Entidades/Entity)
**Ubicación:** `model/User.java`, `model/Tarea.java`, `model/Seccion.java`

**¿Qué es?** Son las "tablas" de tu base de datos representadas como clases Java.

**Anotaciones importantes:**

```java
@Entity                                    // Le dice a Spring que esta clase es una entidad de BD
@Table(name = "usuarios")                  // Nombre de la tabla en BD
@Data                                      // Lombok: genera getters, setters, equals, hashCode

@Id                                        // Este es el identificador único
@GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremento (1, 2, 3...)

@Column(unique = true, nullable = false)   // Campo único y no puede ser null
@OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL) // Un usuario → muchas secciones
@ManyToOne                                 // Muchas tareas → una sección
@JoinColumn(name = "user_id")             // Clave foránea

@Transient                                 // Este campo NO se guarda en BD (solo para cálculos)
@Enumerated(EnumType.STRING)               // Guarda texto en lugar de número (ADMIN, EDITOR, etc.)
```

**Tu estructura de relaciones:**
```
User (1) ←──────→ (Many) Seccion
              ↓
          (Many) Tarea
```

**Ejemplo en tu código:**
- Un usuario puede crear muchas **Secciones** (carpetas)
- Cada sección puede tener muchas **Tareas**
- Cada tarea pertenece a una sección

---

### 2. **REPOSITORIES** (Acceso a Datos)
**Ubicación:** `repository/UserRepository.java`, etc.

**¿Qué es?** Conexión entre Java y la base de datos. Maneja todas las operaciones CRUD.

```java
@Repository                                         // Spring detecta que es un repositorio
public interface UserRepository extends JpaRepository<User, Long> {
    // <User, Long> significa: Entidad de tipo User, con ID de tipo Long
    
    // JpaRepository ya incluye métodos automáticos:
    // .findAll()           → SELECT * FROM users
    // .findById(1L)        → SELECT * FROM users WHERE id = 1
    // .save(user)          → INSERT/UPDATE
    // .deleteById(1L)      → DELETE FROM users WHERE id = 1
    
    // PUEDES agregar búsquedas personalizadas:
    // User findByCorreo(String correo);  → SELECT * FROM users WHERE correo = ?
    // List<Tarea> findByEstatus(String estatus);
}
```

**Métodos heredados automáticamente:**
| Método | SQL equivalente | HTTP |
|--------|---|---|
| `findAll()` | `SELECT *` | GET /tareas |
| `findById(1L)` | `SELECT * WHERE id = 1` | GET /tareas/1 |
| `save(objeto)` | `INSERT/UPDATE` | POST/PUT |
| `deleteById(1L)` | `DELETE WHERE id = 1` | DELETE /tareas/1 |

---

### 3. **CONTROLLERS** (Endpoints/Rutas)
**Ubicación:** `controller/UserController.java`, etc.

**¿Qué es?** Son las "rutas" de tu API REST. Reciben solicitudes HTTP y responden con JSON.

```java
@RestController                    // Declara que las respuestas serán JSON
@RequestMapping("/api")            // Ruta base: http://localhost:8081/api/...

public class UserController {
    @Autowired private UserRepository userRepo;  // Inyección de dependencias (Spring crea automático)
    
    // GET: Obtener todos los usuarios
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();  // Ejecuta: SELECT * FROM users
    }
    
    // POST: Crear nuevo usuario
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // @RequestBody convierte el JSON recibido → objeto Java
        String hashedPassword = new BCryptPasswordEncoder().encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepo.save(user);  // Ejecuta: INSERT INTO users
    }
    
    // GET con ID: Obtener un usuario específico
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        // @PathVariable toma el parámetro de la URL: /users/5 → id=5
        return userRepo.findById(id).orElse(null);
    }
    
    // PUT: Actualizar un usuario
    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepo.findById(id).orElse(null);
        if(user != null) {
            user.setNombre(userDetails.getNombre());
            user.setCorreo(userDetails.getCorreo());
            return userRepo.save(user);
        }
        return null;
    }
    
    // DELETE: Eliminar un usuario
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
    }
}
```

**Anotaciones de HTTP en Spring:**
```
@GetMapping("/ruta")     → GET    (Obtener datos)
@PostMapping("/ruta")    → POST   (Crear datos)
@PutMapping("/ruta/{id}") → PUT   (Actualizar datos)
@DeleteMapping("/ruta/{id}") → DELETE (Eliminar datos)
@PatchMapping("/ruta")   → PATCH  (Actualizar parcialmente)
```

---

### 4. **SEGURIDAD** (SecurityConfig.java)
**Ubicación:** `config/SecurityConfig.java`

**¿Qué es?** Controla quién puede acceder a qué endpoints.

```java
@Configuration                      // Spring lee esta configuración al iniciar
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Desactiva CSRF (seguro solo para desarrollo)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/register", "/api/test-db").permitAll()  // Estos NO requieren autenticación
                .anyRequest().permitAll()  // TODOS los otros SÍ requieren autenticación
            );
        
        return http.build();
    }
}
```

**Importante:** `.anyRequest().permitAll()` actualmente permite TODOS los requests. Deberías cambiar esto en producción.

---

## 🔑 Anotaciones de Lombok (@Data)
**¿Qué hace?** Genera automáticamente:

```java
@Data  // Equivale a todo esto ↓

// Getters para todos los campos
public String getNombre() { return nombre; }

// Setters para todos los campos
public void setNombre(String nombre) { this.nombre = nombre; }

// equals() - comparar si dos objetos son iguales
// hashCode() - para usar en HashMap, HashSet
// toString() - representación de texto
```

**También tienes:**
```java
@ToString.Exclude  // Excluye un campo del método toString() 
```
(Lo usas para evitar referencias circulares entre User → Secciones)

---

## ⚡ Inyección de Dependencias (@Autowired)
**¿Qué es?** Spring crea automáticamente las instancias que necesitas.

```java
@Autowired private UserRepository userRepo;  // Spring crea UserRepository automátically

// Sin @Autowired (forma antigua):
UserRepository userRepo = new UserRepository();  // ❌ Esto NO funcionaría así

// Con @Autowired (forma Spring):
@Autowired private UserRepository userRepo;  // ✅ Spring lo crea por ti
```

**Ventaja:** Spring gestiona el ciclo de vida del objeto. Es más limpio y mantenible.

---

## 📊 Relaciones en tu BD

### One-to-Many (1 → N)
```java
@OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Seccion> secciones;
```
- 1 Usuario → N Secciones
- `mappedBy = "usuario"` → La otra tabla tiene un campo llamado "usuario"
- `cascade = CascadeType.ALL` → Si borras un usuario, borrar sus secciones
- `orphanRemoval = true` → Si quitas una sección de la lista, borrarla de BD

### Many-to-One (N → 1)
```java
@ManyToOne
@JoinColumn(name = "seccion_id", nullable = false)
private Seccion seccion;
```
- N Tareas → 1 Sección
- `@JoinColumn(name = "seccion_id")` → Crea columna "seccion_id" con clave foránea

---

## 🛠️ Properties & Configuración (application.properties)

```properties
# Puerto donde corre la app
server.port=8081

# Conexión a BD
spring.datasource.url=jdbc:postgresql://...  # URL de la BD
spring.datasource.username=user              # Usuario
spring.datasource.password=pass              # Contraseña

# Hibernate (ORM - Object Relational Mapping)
spring.jpa.hibernate.ddl-auto=update         # Auto-crea tablas si no existen
spring.jpa.show-sql=true                     # Muestra SQL en consola (solo desarrollo)
```

**ddl-auto opciones:**
- `create-drop` → Crea tablas al iniciar, las borra al cerrar (TESTING)
- `update` → Crea/actualiza tablas, conserva datos (DESARROLLO) ✅
- `validate` → Solo valida estructura (PRODUCCIÓN)
- `none` → No hace nada (PRODUCCIÓN)

---

## 🐛 Problemas en tu código actual & SOLUCIONES

### ❌ Problema 1: Falta el método UPDATE en Tareas y Secciones
**Impacto:** No puedes modificar tareas ni secciones.

**Solución:** Agregar método PUT en TareaController:

```java
@PutMapping("/tareas/{id}")
public Tarea updateTarea(@PathVariable Long id, @RequestBody Tarea tareaDetails) {
    Tarea tarea = tareaRepo.findById(id).orElse(null);
    if(tarea != null) {
        if(tareaDetails.getNombre() != null) tarea.setNombre(tareaDetails.getNombre());
        if(tareaDetails.getDescripcion() != null) tarea.setDescripcion(tareaDetails.getDescripcion());
        if(tareaDetails.getEstatus() != null) tarea.setEstatus(tareaDetails.getEstatus());
        if(tareaDetails.getPrioridad() != null) tarea.setPrioridad(tareaDetails.getPrioridad());
        return tareaRepo.save(tarea);
    }
    return null;
}
```

### ❌ Problema 2: Seguridad débil
**Impacto:** Cualquiera puede acceder a TODO. `.anyRequest().permitAll()` es para testing.

**Solución en Producción:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/register", "/api/login").permitAll()
    .requestMatchers("/api/users/**").authenticated()
    .requestMatchers("/api/tareas/**").authenticated()
    .anyRequest().denyAll()
)
```

### ❌ Problema 3: Sin búsquedas personalizadas
**Impacto:** No puedes buscar tareas por estatus, secciones por usuario, etc.

**Solución:**
```java
// TareaRepository.java
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByEstatus(String estatus);  // Tareas por estado
    List<Tarea> findBySeccion(Seccion seccion); // Tareas de una sección
    List<Tarea> findByPrioridad(Integer prioridad); // Tareas por prioridad
}

// SeccionRepository.java
@Repository
public interface SeccionRepository extends JpaRepository<Seccion, Long> {
    List<Seccion> findByUsuario(User usuario);  // Secciones de un usuario
}

// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByCorreo(String correo);  // Encontrar usuario por email
    User findByCorreoAndPassword(String correo, String password);  // Login
}
```

### ❌ Problema 4: Sin validación de datos
**Impacto:** Un usuario puede enviar email vacío o contraseña sin encriptar.

**Solución:** Usar DTOs (Data Transfer Objects) y validaciones.

```java
// UserDTO.java - Para received de cliente
public class UserDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;
    
    @Email(message = "Email inválido")
    private String correo;
    
    @NotBlank @Length(min = 8)
    private String password;
}

// En UserController.java
@PostMapping("/register")
public User registerUser(@Valid @RequestBody UserDTO userDTO) {
    // userDTO está validado automáticamente
    User user = new User();
    user.setNombre(userDTO.getNombre());
    user.setCorreo(userDTO.getCorreo());
    user.setPassword(new BCryptPasswordEncoder().encode(userDTO.getPassword()));
    return userRepo.save(user);
}
```

### ❌ Problema 5: Sin manejo de errores
**Impacto:** Si pides una tarea que no existe, devuelve NULL.

**Solución:** Usar excepciones y ResponseEntity:

```java
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@GetMapping("/tareas/{id}")
public ResponseEntity<?> getTareaById(@PathVariable Long id) {
    return tareaRepo.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    
    // Ahora:
    // Si existe → 200 OK + datos
    // Si NO existe → 404 Not Found
}

@DeleteMapping("/tareas/{id}")
public ResponseEntity<?> deleteTarea(@PathVariable Long id) {
    try {
        tareaRepo.deleteById(id);
        return ResponseEntity.ok("Tarea eliminada");
    } catch(Exception e) {
        return ResponseEntity.status(400).body("Error: " + e.getMessage());
    }
}
```

---

## 📝 Flujo completo: Crear una Tarea desde React

### 1. Cliente (React) envía solicitud
```javascript
fetch('http://localhost:8081/api/tareas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: "Estudiar Spring",
    descripcion: "Aprender relaciones @OneToMany",
    estatus: "PENDIENTE",
    prioridad: 1,
    seccion: { id: 5 }
  })
})
```

### 2. Spring llama al Controlador
```java
@PostMapping("/tareas")
public Tarea createTarea(@RequestBody Tarea tarea) {
    // Recibe JSON convertido a objeto Tarea
    return tareaRepo.save(tarea);
}
```

### 3. Controlador llama al Repositorio
```
tareaRepo.save(tarea)  // Inyección de dependencias crea UserRepository
```

### 4. Repositorio ejecuta SQL
```sql
INSERT INTO tareas (nombre, descripcion, estatus, prioridad, seccion_id) 
VALUES ('Estudiar Spring', 'Aprender relaciones...', 'PENDIENTE', 1, 5)
```

### 5. Base de datos guarda y devuelve ID
```
INSERT ejecutado. Nuevo ID: 47
```

### 6. Flujo de retorno (inverso)
```
BD → Repositorio → Controlador → Cliente (JSON)
```

### 7. Cliente recibe respuesta
```json
{
  "id": 47,
  "nombre": "Estudiar Spring",
  "descripcion": "Aprender relaciones...",
  "estatus": "PENDIENTE",
  "prioridad": 1,
  "seccion": { "id": 5 }
}
```

---

## 🎓 Tips para RETENER estos conceptos

### 1. **Memoriza el patrón MVC**
```
Model (base de datos) ← Repository
View (React) ← Controller (endpoints)
Controller ← Model (lógica)
```

### 2. **Las 4 operaciones CRUD siempre siguen este patrón**
```
CREATE:  @PostMapping    + @RequestBody        → .save()
READ:    @GetMapping     + @PathVariable (opt) → .findById() o .findAll()
UPDATE:  @PutMapping     + @PathVariable + @RequestBody → .save()
DELETE:  @DeleteMapping  + @PathVariable       → .deleteById()
```

### 3. **Las anotaciones siempre van donde las necesites**
```
Controlador necesita datos → @RequestBody o @PathVariable
Entidad en BD necesita tipo → @Entity, @Column, @ManyToOne
Repositorio necesita flexibilidad → métodos custom con findBy*
```

### 4. **Relaciones 1→N o N→1**
- Un usuario → varias secciones = @OneToMany en User
- Varias tareas → una sección = @ManyToOne en Tarea

### 5. **Flujo de error común**
```
BD NULL → Verificar @JoinColumn
NullPointerException → Usar Optional.orElse()
400 Bad Request → Validar @RequestBody
404 Not Found → Verificar ID existe
```

---

## ✅ CHECKLIST para tu CRUD completo

- [ ] Crear usuario (POST /register)
- [ ] Obtener todos los usuarios (GET /users)
- [ ] Obtener usuario por ID (GET /users/{id})
- [ ] **Actualizar usuario (PUT /users/{id})** ← FALTA
- [ ] Eliminar usuario (DELETE /users/{id}) ← FALTA

- [ ] Crear sección (POST /secciones)
- [ ] Obtener todas las secciones (GET /secciones)
- [ ] Obtener sección por ID (GET /secciones/{id}) ← FALTA
- [ ] **Actualizar sección (PUT /secciones/{id})** ← FALTA
- [ ] Eliminar sección (DELETE /secciones/{id}) ← FALTA

- [ ] Crear tarea (POST /tareas)
- [ ] Obtener todas las tareas (GET /tareas)
- [ ] Obtener tarea por ID (GET /tareas/{id})
- [ ] **Actualizar tarea (PUT /tareas/{id})** ← FALTA
- [ ] Eliminar tarea (DELETE /tareas/{id})

---

## 🚀 Próximos pasos

1. **Agregar métodos UPDATE** en todos los Controllers
2. **Agregar búsquedas personalizadas** en los Repositories
3. **Agregar validación** con DTOs
4. **Agregar manejo de errores** con ResponseEntity
5. **Implementar JWT** para autenticación real
