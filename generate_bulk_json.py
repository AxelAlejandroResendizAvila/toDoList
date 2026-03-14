import json
import random
from datetime import datetime, timedelta

def generate_bulk_data(num_users=20):
    # Listas de datos para generar nombres reales y consistentes
    nombres_base = ["Juan", "Carlos", "Maria", "Ana", "Luis", "Pedro", "Elena", "Sofia", "Roberto", "Lucia", 
                    "Diego", "Laura", "Miguel", "Carmen", "Javier", "Isabel", "Fernando", "Beatriz", "Ricardo", "Gabriela"]
    
    apellidos_base = ["García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores"]

    # Diccionario de secciones con sus tareas temáticas para que coincidan
    templates_secciones = [
        {
            "nombre": "Desarrollo Frontend",
            "tareas": [
                {"nombre": "Implementar Dashboard", "desc": "Crear la vista principal con gráficas de rendimiento y estadísticas."},
                {"nombre": "Refactorizar Componentes", "desc": "Optimizar el código de los botones y modales para mejorar la reutilización."},
                {"nombre": "Ajustes de Responsive", "desc": "Asegurar que la aplicación se vea bien en dispositivos móviles y tablets."},
                {"nombre": "Integrar API de Usuarios", "desc": "Conectar los formularios de login y registro con el servicio backend."},
                {"nombre": "Testing de Interfaz", "desc": "Realizar pruebas unitarias a los componentes principales con Vitest."}
            ]
        },
        {
            "nombre": "Gestión de Proyecto",
            "tareas": [
                {"nombre": "Reunión de Sprint", "desc": "Definir los objetivos de la semana y asignar tareas al equipo."},
                {"nombre": "Documentar Arquitectura", "desc": "Escribir la documentación técnica del sistema en el archivo README."},
                {"nombre": "Revisión de Backlog", "desc": "Priorizar las tareas pendientes y eliminar las que ya no son necesarias."},
                {"nombre": "Preparar Demo", "desc": "Configurar el entorno de staging para la presentación con el cliente."},
                {"nombre": "Análisis de Riesgos", "desc": "Identificar posibles cuellos de botella en la entrega del producto."}
            ]
        },
        {
            "nombre": "Marketing y Diseño",
            "tareas": [
                {"nombre": "Diseñar Logotipo", "desc": "Crear tres variantes del logo principal usando la paleta de colores corporativa."},
                {"nombre": "Campaña en Redes", "desc": "Programar las publicaciones de la semana en Instagram y LinkedIn."},
                {"nombre": "SEO Audit", "desc": "Analizar las palabras clave de la competencia y mejorar los meta-tags."},
                {"nombre": "Newsletter Mensual", "desc": "Redactar el correo promocional con las novedades del servicio."},
                {"nombre": "Edición de Video", "desc": "Montar el clip publicitario de 30 segundos para la página de inicio."}
            ]
        },
        {
            "nombre": "Ventas y Clientes",
            "tareas": [
                {"nombre": "Seguimiento de Leads", "desc": "Llamar a los clientes potenciales que se registraron la semana pasada."},
                {"nombre": "Cerrar Contrato", "desc": "Enviar el documento final de términos y condiciones para firma digital."},
                {"nombre": "Actualizar CRM", "desc": "Registrar todas las interacciones recientes con la cuenta de 'Global Tech'."},
                {"nombre": "Preparar Propuesta", "desc": "Cotizar los servicios de consultoría para el nuevo proyecto de retail."},
                {"nombre": "Soporte Técnico", "desc": "Resolver el ticket #452 sobre la recuperación de contraseñas."}
            ]
        }
    ]

    users = []
    usados = set() # Para evitar correos duplicados si num_users > nombres_base

    for i in range(num_users):
        first_name = random.choice(nombres_base)
        last_name = random.choice(apellidos_base)
        
        # Asegurar correo único
        email_prefix = first_name.lower()
        counter = 1
        original_prefix = email_prefix
        while f"{email_prefix}@example.com" in usados:
            email_prefix = f"{original_prefix}{counter}"
            counter += 1
        
        user_email = f"{email_prefix}@example.com"
        usados.add(user_email)
        
        full_name = f"{first_name} {last_name}"
        user_phone = f"442{random.randint(1000000, 9999999)}"
        
        secciones_usuario = []
        # Elegir 2 o 3 secciones aleatorias para cada usuario
        templates_elegidos = random.sample(templates_secciones, k=random.randint(2, 3))
        
        for template in templates_elegidos:
            sec_time = random.choice([30, 45, 60, 90, 120])
            
            tareas_seccion = []
            # Usar las tareas del template
            tasks = template.get("tareas", [])
            if isinstance(tasks, list):
                for task_template in tasks:
                    if not isinstance(task_template, dict):
                        continue
                        
                    task_prio = random.randint(1, 3)
                    task_status = random.choice(["PENDIENTE", "EN_PROCESO", "COMPLETADA"])
                    
                    # Fecha límite aleatoria en el próximo mes
                    task_date = (datetime.utcnow() + timedelta(days=random.randint(1, 30))).isoformat() + "Z"
                    
                    # El usuario actual siempre está asignado
                    correos_asignados = [user_email]
                    
                    # Opcionalmente asignar a otro usuario aleatorio de los ya creados o de la base
                    if len(usados) > 1:
                        otro_correo = random.choice(list(usados))
                        if otro_correo != user_email:
                            correos_asignados.append(otro_correo)

                    tareas_seccion.append({
                        "nombre": task_template.get("nombre", "Sin nombre"),
                        "descripcion": task_template.get("desc", ""),
                        "prioridad": task_prio,
                        "estatus": task_status,
                        "fechaLimite": task_date,
                        "correosAsignados": correos_asignados
                    })
            
            secciones_usuario.append({
                "nombre": template["nombre"],
                "tiempoAsignadoMinutos": sec_time,
                "tareas": tareas_seccion
            })
        
        users.append({
            "nombre": full_name,
            "correo": user_email,
            "password": "123456",
            "telefono": user_phone,
            "secciones": secciones_usuario
        })
    
    return {"users": users}

# Generar 30 usuarios con datos realistas
data = generate_bulk_data(num_users=30)

with open("bulk_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Archivo 'bulk_data.json' generado con éxito con {len(data['users'])} usuarios.")
