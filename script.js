// INICIALIZACIÓN (modificado para soportar React)

// Se extrae la inicialización en una función reutilizable
function initializeAll() {
    initMobileMenu();
    initDropdownMenus();
    initFormValidation();
    initScrollAnimations();
    initSmoothScrolling();
    initStatsCounter();
    initMobileMenuClose();
    initPartsCatalog();
}

// Fallback: mantener comportamiento original en entornos sin React
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAll);
    } else {
        // Si el documento ya está listo, inicializamos inmediatamente
        initializeAll();
    }
}

// Integración opcional con React:
// - Si window.React y window.ReactDOM existen, montamos un pequeño componente
//   GearSteedApp que llama a initializeAll() en su useEffect.
// - El componente no renderiza UI (retorna null) porque el HTML existente permanece igual.
(function setupReactIntegration() {
    if (typeof window === 'undefined') return;
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    if (!React || !ReactDOM) return;

    const { useEffect } = React;
    function GearSteedApp() {
        useEffect(() => { initializeAll(); }, []);
        return null;
    }

    // Crear o reutilizar un root para montar el componente React
    let rootEl = document.getElementById('react-gearsteed-root');
    if (!rootEl) {
        rootEl = document.createElement('div');
        rootEl.id = 'react-gearsteed-root';
        document.body.appendChild(rootEl);
    }

    try {
        if (ReactDOM.createRoot) {
            ReactDOM.createRoot(rootEl).render(React.createElement(GearSteedApp));
        } else {
            ReactDOM.render(React.createElement(GearSteedApp), rootEl);
        }
        // Exponer para debugging / uso programático
        window.GearSteedApp = GearSteedApp;
    } catch (e) {
        // No interrumpir si React no está configurado correctamente
        console.warn('React integration for Gear Steed failed:', e);
    }
})();

// MENÚ MÓVIL
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');
    
    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('active'));
    }
}

function initMobileMenuClose() {
    const nav = document.querySelector('.main-nav');
    
    document.addEventListener('click', (e) => {
        if (nav && nav.classList.contains('active')) {
            if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
                nav.classList.remove('active');
            }
        }
    });
}

// MENÚS DESPLEGABLES
function initDropdownMenus() {
    const triggers = document.querySelectorAll('.dropdown-trigger');
    
    triggers.forEach(trigger => {
        const dropdown = trigger.querySelector('.dropdown-menu');
        
        if (dropdown) {
            trigger.addEventListener('mouseenter', () => {
                dropdown.style.display = 'block';
                setTimeout(() => dropdown.classList.add('show'), 10);
            });
            
            trigger.addEventListener('mouseleave', () => {
                dropdown.classList.remove('show');
                setTimeout(() => dropdown.style.display = 'none', 300);
            });
        }
    });
}

// VALIDACIÓN DE FORMULARIOS
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Validación en tiempo real
        inputs.forEach(input => {
            // Validar al salir del campo
            input.addEventListener('blur', () => validateField(input));
            
            // Validar mientras se escribe (si ya hay error)
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
        
        // Contador de caracteres para textarea
        const mensajeTextarea = form.querySelector('#mensaje');
        if (mensajeTextarea) {
            const counter = form.querySelector('.char-counter');
            if (counter) {
                mensajeTextarea.addEventListener('input', () => {
                    const length = mensajeTextarea.value.length;
                    counter.textContent = `${length}/500 caracteres`;
                    
                    if (length > 450) {
                        counter.style.color = '#e74c3c';
                    } else {
                        counter.style.color = '#777';
                    }
                });
            }
        }
        
        // Prevenir letras en el campo de teléfono
        const telefonoInput = form.querySelector('#telefono');
        if (telefonoInput) {
            telefonoInput.addEventListener('keypress', (e) => {
                // Solo permitir números
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
            
            // Prevenir pegar texto no numérico
            telefonoInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numbersOnly = pastedText.replace(/\D/g, '').substring(0, 10);
                telefonoInput.value = numbersOnly;
            });
        }
        
        // Validar al enviar formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const allInputs = form.querySelectorAll('input, select, textarea');
            
            // Validar todos los campos
            allInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                showNotification('Por favor, corrige los errores en el formulario.', 'error');
                // Hacer scroll al primer error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Deshabilitar botón mientras se procesa
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            // Recolectar datos del formulario
            const formData = collectFormData(form);

            // Guardar localmente (temporal hasta tener BD)
            const saved = saveToLocalStorage(formData);

            // Simular envío
            setTimeout(() => {
                if (saved) {
                    showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                    form.reset();

                    // Limpiar clases de validación
                    allInputs.forEach(input => {
                        input.classList.remove('error', 'valid');
                        removeFieldError(input);
                    });

                    // Resetear contador
                    const counter = form.querySelector('.char-counter');
                    if (counter) {
                        counter.textContent = '0/500 caracteres';
                        counter.style.color = '#777';
                    }
                } else {
                    showNotification('Error al guardar. Por favor, intenta nuevamente.', 'error');
                }

                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 1000);
        });
    });
}

// VALIDACIÓN DE CAMPO INDIVIDUAL
function validateField(field) {
    const value = field.value.trim();
    let errorMessage = '';
    
    // Remover mensaje de error previo
    removeFieldError(field);
    
    // Validar campos obligatorios vacíos
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Este campo es obligatorio';
    }
    // Validar nombre (solo letras y espacios)
    else if (field.id === 'nombre' && value) {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            errorMessage = 'Solo se permiten letras y espacios';
        } else if (value.length < 3) {
            errorMessage = 'El nombre debe tener al menos 3 caracteres';
        }
    }
    // Validar email
    else if (field.type === 'email' && value) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Ingresa un correo electrónico válido';
        }
    }
    // Validar teléfono (exactamente 10 dígitos numéricos)
    else if (field.type === 'tel' && value) {
        if (!/^[0-9]{10}$/.test(value)) {
            errorMessage = 'El teléfono debe tener exactamente 10 dígitos';
        }
    }
    // Validar select
    else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
        errorMessage = 'Por favor, selecciona una opción';
    }
    // Validar mensaje (mínimo 10 caracteres)
    else if (field.id === 'mensaje' && value) {
        if (value.length < 10) {
            errorMessage = 'El mensaje debe tener al menos 10 caracteres';
        }
    }
    
    if (errorMessage) {
        field.classList.add('error');
        field.classList.remove('valid');
        showFieldError(field, errorMessage);
        return false;
    } else {
        field.classList.remove('error');
        if (value) {
            field.classList.add('valid');
        }
        return true;
    }
}

// MOSTRAR ERROR EN CAMPO
function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
}

// REMOVER ERROR DE CAMPO
function removeFieldError(field) {
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// RECOLECTAR DATOS DEL FORMULARIO (para futura integración con BD)
function collectFormData(form) {
    const formData = new FormData(form);
    
    // Estructura de datos compatible con base de datos
    const data = {
        // Campos de control (generados automáticamente)
        id: generateUniqueId(),                    // ID único para la solicitud
        fecha_creacion: new Date().toISOString(),  // Timestamp ISO 8601
        fecha_modificacion: new Date().toISOString(),
        fuente: 'contacto_web',                    // Origen: contacto_web, whatsapp, telefono, etc.
        estado: 'pendiente',                       // pendiente, en_proceso, contactado, cerrado
        prioridad: 'media',                        // baja, media, alta
        asignado_a: null,                          // ID del vendedor asignado (NULL al inicio)
        
        // Datos del cliente (del formulario)
        nombre_completo: '',
        email: '',
        telefono: '',
        tipo_interes: '',                          // compra, venta, refacciones, etc.
        mensaje: '',
        
        // Metadatos adicionales
        ip_address: null,                          // Se puede capturar en el backend
        user_agent: navigator.userAgent,           // Información del navegador
        pagina_origen: window.location.href,       // URL desde donde se envió
        utm_source: getUrlParameter('utm_source'), // Para tracking de campañas
        utm_medium: getUrlParameter('utm_medium'),
        utm_campaign: getUrlParameter('utm_campaign')
    };
    
    // Llenar con datos del formulario
    for (let [key, value] of formData.entries()) {
        if (key === 'nombre') data.nombre_completo = value.trim();
        else if (key === 'email') data.email = value.trim().toLowerCase();
        else if (key === 'telefono') data.telefono = value.trim();
        else if (key === 'interes') data.tipo_interes = value.trim();
        else if (key === 'mensaje') data.mensaje = value.trim();
    }
    
    return data;
}

// GENERAR ID ÚNICO (compatible con UUIDs)
function generateUniqueId() {
    // Genera un ID único tipo UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// OBTENER PARÁMETROS DE URL (para tracking)
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || null;
}

// GUARDAR EN LOCALSTORAGE (temporal hasta tener BD)
function saveToLocalStorage(data) {
    try {
        const key = 'gearsteed_contactos';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        console.log('✅ Contacto guardado. Total:', existing.length);
        console.log('📋 Estructura de datos lista para BD:', data);
        return true;
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        return false;
    }
}

// FUNCIÓN PARA EXPORTAR DATOS (útil para migrar a BD)
function exportarContactosAJSON() {
    const datos = JSON.parse(localStorage.getItem('gearsteed_contactos') || '[]');
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contactos_gearsteed_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    console.log('✅ Exportados', datos.length, 'contactos');
}

// FUNCIÓN PARA VER ESTADÍSTICAS
function verEstadisticasContactos() {
    const datos = JSON.parse(localStorage.getItem('gearsteed_contactos') || '[]');
    
    const stats = {
        total: datos.length,
        por_estado: {},
        por_interes: {},
        por_fuente: {},
        ultimos_7_dias: 0
    };
    
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    
    datos.forEach(contacto => {
        // Contar por estado
        stats.por_estado[contacto.estado] = (stats.por_estado[contacto.estado] || 0) + 1;
        
        // Contar por tipo de interés
        stats.por_interes[contacto.tipo_interes] = (stats.por_interes[contacto.tipo_interes] || 0) + 1;
        
        // Contar por fuente
        stats.por_fuente[contacto.fuente] = (stats.por_fuente[contacto.fuente] || 0) + 1;
        
        // Contar últimos 7 días
        if (new Date(contacto.fecha_creacion) > hace7dias) {
            stats.ultimos_7_dias++;
        }
    });
    
    console.log('📊 ESTADÍSTICAS DE CONTACTOS:', stats);
    return stats;
}

// NOTIFICACIONES
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 5px; color: white; z-index: 1000; font-weight: 500;
        max-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        opacity: 0; transform: translateX(100%); transition: all 0.3s ease;
    `;
    
    notification.style.backgroundColor = 
        type === 'success' ? '#27ae60' : 
        type === 'error' ? '#e74c3c' : '#3498db';
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ANIMACIONES DE SCROLL
function initScrollAnimations() {
    const elements = document.querySelectorAll('.vehicle-card, .stats-item, .service-card, .feature-card, .filter-group');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// SCROLL SUAVE
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// CONTADOR DE ESTADÍSTICAS
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(element) {
        const target = parseInt(element.textContent);
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.textContent.includes('+') ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
            }
        }, 30);
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// ----------------------------
// CATÁLOGO Y FILTRADO DE REFACCIONES
// ----------------------------
function initPartsCatalog() {
    // Evitar errores si la página no tiene la sección de refacciones
    const modelSelect = document.getElementById('modelFilter');
    const typeSelect = document.getElementById('typeFilter');
    const partsContainer = document.getElementById('partsCatalog');
    const galleryContainer = document.getElementById('popularPartsGallery');
    const onlyCompatibleCheckbox = document.getElementById('onlyCompatible');

    if (!modelSelect || !typeSelect || !partsContainer || !galleryContainer) {
        // No estamos en la página de refaccionaria; salir silenciosamente
        return;
    }

    // Datos de ejemplo — actualiza con tus datos reales o muévelos a un JSON externo
    const parts = [
        { id: 1, name: 'Filtro de Aceite', category: 'Motor', priceLabel: 'Desde $15', image: 'img/Filtro de Aceite.png', compatibleWith: ['Universal', 'Toyota Corolla', 'Honda Civic', 'Ford F-150', 'Nissan Sentra', 'BMW 3 Series'] },
        { id: 2, name: 'Pastillas de Freno - Brembo', category: 'Frenos', priceLabel: 'Desde $85', image: 'img/Pastillas de Freno.png', compatibleWith: ['BMW 3 Series', 'Toyota Camry', 'Honda Accord'] },
        { id: 3, name: 'Amortiguador Monroe', category: 'Suspensión', priceLabel: 'Desde $120', image: 'img/Amortiguador.png', compatibleWith: ['Ford F-150', 'Jeep Wrangler', 'Toyota Hilux'] },
        { id: 4, name: 'Kit de Clutch LuK', category: 'Transmisión', priceLabel: 'Desde $280', image: 'img/Kit de Clutch.png', compatibleWith: ['Honda Civic', 'Toyota Corolla'] },
        { id: 5, name: 'Bomba de Combustible', category: 'Motor', priceLabel: 'Desde $95', image: 'img/Bomba de Combustible.png', compatibleWith: ['Nissan Sentra', 'Toyota Corolla'] }
    ];

    // Poblamos select de modelos con valores únicos extraídos de compatibleWith
    const uniqueModels = new Set();
    parts.forEach(p => p.compatibleWith.forEach(m => uniqueModels.add(m)));
    const modelsArray = Array.from(uniqueModels).sort((a, b) => {
        if (a === 'Universal') return -1;
        if (b === 'Universal') return 1;
        return a.localeCompare(b);
    });

    // Añadir opciones al select (dejando la opción por defecto existente)
    modelsArray.forEach(model => {
        const opt = document.createElement('option');
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
    });

    // Poblamos select de tipos (categorías) a partir del campo category
    const uniqueTypes = new Set(parts.map(p => p.category));
    const typesArray = Array.from(uniqueTypes).sort();
    typesArray.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });

    function getCompatibilityScore(part, selectedModel) {
        if (!selectedModel) return 0.5; // neutral
        if (part.compatibleWith.includes('Universal')) return 0.8;
        return part.compatibleWith.includes(selectedModel) ? 1 : 0;
    }

    function renderPartsAndGallery() {
        const selectedModel = modelSelect.value;
        const onlyCompatible = onlyCompatibleCheckbox && onlyCompatibleCheckbox.checked;

        const selectedType = typeSelect.value;

        const partsSorted = parts
            .map(p => ({ ...p, score: getCompatibilityScore(p, selectedModel) }))
            .filter(p => (!selectedType || p.category === selectedType))
            .filter(p => !onlyCompatible || p.score > 0)
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        /*
         * Render de la lista detallada.
         * Si existen tarjetas estáticas dentro de #partsCatalog (p. ej. .catalog-product en historia.html),
         * aplicamos el filtrado sobre esas tarjetas (mostrar/ocultar) en vez de regenerar el HTML.
         * De lo contrario, generamos tarjetas dinámicamente desde el array `parts`.
         */
        const staticCards = partsContainer.querySelectorAll('.catalog-product');
        if (staticCards && staticCards.length > 0) {
            // Filtrar las tarjetas estáticas presentes en el DOM
            staticCards.forEach(cardEl => {
                const text = (cardEl.textContent || '').toLowerCase();
                const name = (cardEl.querySelector('h3')?.textContent || '').toLowerCase();
                const skuText = (cardEl.querySelector('p')?.textContent || '').toLowerCase();

                // Determinar si cumple tipo
                const matchesType = !selectedType || text.includes(selectedType.toLowerCase()) || skuText.includes(selectedType.toLowerCase());

                // Determinar compatibilidad si se pidió sólo compatibles
                let matchesModel = true;
                if (selectedModel) {
                    // Buscar nombre de modelo en el texto de la tarjeta
                    matchesModel = text.includes(selectedModel.toLowerCase()) || name.includes(selectedModel.toLowerCase());
                    // también considerar tarjetas que indiquen "disponible" o "stock" como válidas si hay existencia
                    if (!matchesModel && cardEl.textContent.match(/stock:\s*\d+/i)) {
                        // si hay stock > 0 la mostramos
                        const stockMatch = cardEl.textContent.match(/stock:\s*(\d+)/i);
                        if (stockMatch && parseInt(stockMatch[1], 10) > 0) matchesModel = true;
                    }
                }

                // Si onlyCompatible está activado, ocultar tarjetas que no contengan el modelo ni sean universales
                if (onlyCompatible && selectedModel) {
                    // Verificar si la tarjeta menciona "universal"
                    const isUniversal = text.includes('universal');
                    if (!matchesModel && !isUniversal) {
                        cardEl.style.display = 'none';
                        return;
                    }
                }

                // Aplicar resultado final
                if (matchesType && matchesModel) cardEl.style.display = '';
                else cardEl.style.display = 'none';
            });
        } else {
            // No hay tarjetas estáticas: crear las cards dinámicamente como antes
            partsContainer.innerHTML = '';
            if (partsSorted.length === 0) {
                partsContainer.innerHTML = '<p>No se encontraron refacciones para el modelo seleccionado.</p>';
            } else {
                partsSorted.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'part-card';
                    card.style.cssText = 'border:1px solid #e0e0e0;padding:12px;border-radius:8px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;';

                    const left = document.createElement('div');
                    left.style.flex = '1';
                    const title = document.createElement('h3'); title.textContent = p.name; title.style.margin = '0 0 6px 0';
                    const cat = document.createElement('div'); cat.textContent = p.category + ' • ' + p.priceLabel; cat.style.color = '#555'; cat.style.fontSize = '0.95rem';
                    const compat = document.createElement('div'); compat.style.marginTop = '8px'; compat.style.fontSize = '0.9rem'; compat.style.color = '#333';

                    if (selectedModel) {
                        const score = getCompatibilityScore(p, selectedModel);
                        if (score === 1) compat.innerHTML = `<strong>Compatible:</strong> Alta compatibilidad con <em>${selectedModel}</em>`;
                        else if (score >= 0.8) compat.innerHTML = `<strong>Compatible:</strong> Compatible (universal/general)`;
                        else compat.innerHTML = `<strong>No recomendado para</strong> <em>${selectedModel}</em>`;
                    } else {
                        compat.textContent = 'Modelos compatibles: ' + p.compatibleWith.join(', ');
                    }

                    left.appendChild(title); left.appendChild(cat); left.appendChild(compat);

                    const right = document.createElement('div'); right.style.textAlign = 'right';
                    const btn = document.createElement('a'); btn.href = '#'; btn.className = 'btn btn-primary'; btn.textContent = 'Consultar Disponibilidad'; btn.style.display = 'inline-block'; btn.style.padding = '8px 12px';
                    right.appendChild(btn);

                    card.appendChild(left); card.appendChild(right);
                    partsContainer.appendChild(card);
                });
            }
        }

        // Render galería de imágenes (según las mismas piezas ordenadas)
        galleryContainer.innerHTML = '';
        if (partsSorted.length === 0) {
            galleryContainer.innerHTML = '<p>No hay imágenes para mostrar.</p>';
        } else {
            partsSorted.forEach(p => {
                const fig = document.createElement('figure');
                fig.style.cssText = 'width:160px;border:1px solid #eee;padding:8px;border-radius:6px;text-align:center;background:#fff;';

                const img = document.createElement('img');
                img.src = encodeURI(p.image);
                img.alt = p.name;
                img.style.cssText = 'max-width:100%;height:100px;object-fit:contain;display:block;margin:0 auto 8px;';

                // Solo mostrar imagen en la galería (sin texto)
                fig.appendChild(img);
                galleryContainer.appendChild(fig);
            });
        }
    }

    // Eventos
    modelSelect.addEventListener('change', renderPartsAndGallery);
    typeSelect.addEventListener('change', renderPartsAndGallery);
    if (onlyCompatibleCheckbox) onlyCompatibleCheckbox.addEventListener('change', renderPartsAndGallery);

    // Render inicial
    renderPartsAndGallery();
}

// Agregado: herramienta Node para "externalizar" scripts inline desde archivos .html
// Uso: desde la raíz del proyecto ejecutar `node script.js`
// Nota: Esto solo se ejecuta en Node (no afectará su uso en el navegador).
if (typeof window === 'undefined') {
	const fs = require('fs');
	const path = require('path');

	/**
	 * Externaliza scripts inline encontrados en archivos .html dentro de rootDir.
	 * Opciones:
	 *  - rootDir: directorio raíz donde buscar .html (por defecto: carpeta de este script)
	 *  - targetScript: ruta del script destino donde anexar los códigos extraídos
	 */
	function externalizeHtmlScripts(options = {}) {
		const rootDir = path.resolve(options.rootDir || __dirname);
		const targetScript = path.resolve(options.targetScript || path.join(rootDir, 'script.js'));
		const markerStart = '/* EXTERNALIZED INLINE SCRIPTS START */';
		const markerEnd = '/* EXTERNALIZED INLINE SCRIPTS END */';

		// Recolecta .html recursivamente
		function collectHtmlFiles(dir) {
			let results = [];
			fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
				const res = path.resolve(dir, dirent.name);
				if (dirent.isDirectory()) results = results.concat(collectHtmlFiles(res));
				else if (dirent.isFile() && res.toLowerCase().endsWith('.html')) results.push(res);
			});
			return results;
		}

		const htmlFiles = collectHtmlFiles(rootDir);

		if (htmlFiles.length === 0) {
			console.log('No se encontraron archivos .html en', rootDir);
			return;
		}

		let appendedAny = false;
		const appendedBlocks = [];

		htmlFiles.forEach(file => {
			let html = fs.readFileSync(file, 'utf8');

			// Encuentra <script> sin atributo src (inline). Excluye scripts con src.
			const inlineScriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
			let match;
			const scripts = [];
			while ((match = inlineScriptRegex.exec(html)) !== null) {
				const code = match[1].trim();
				if (code) scripts.push({ fullMatch: match[0], code });
			}

			if (scripts.length === 0) return; // nada que hacer para este HTML

			// Evitar duplicar: si la página ya referencia script.js, no insertar otra referencia
			const alreadyReferences = /<script[^>]*src=["'][^"']*script\.js["'][^>]*><\/script>/i.test(html);

			// Preparar bloque a anexar (marcado por archivo)
			const blockHeader = `\n\n${markerStart}\n/* from: ${path.relative(rootDir, file)} */\n`;
			let blockBody = '';
			scripts.forEach((s, idx) => {
				// Envuelve cada script en IIFE para aislar el scope
				blockBody += `\n// ---- inline script ${idx + 1} from ${path.basename(file)} ----\n(function(){\n${s.code}\n})();\n`;
			});
			const blockFooter = `\n${markerEnd}\n`;

			const fullBlock = blockHeader + blockBody + blockFooter;

			// Evitar anexar el mismo bloque si ya existe en el targetScript
			const targetContent = fs.readFileSync(targetScript, 'utf8');
			if (!targetContent.includes(blockHeader)) {
				fs.appendFileSync(targetScript, fullBlock, 'utf8');
				appendedAny = true;
				appendedBlocks.push(file);
				console.log(`Anexado ${scripts.length} script(s) desde: ${file}`);
			} else {
				console.log(`Bloque ya anexado previamente para: ${file}`);
			}

			// Reemplazar los scripts inline en el HTML:
			//  - Si la página ya referencia script.js, eliminamos solo los inline scripts.
			//  - Si no, reemplazamos la primera aparición inline por una referencia externa y removemos las otras.
			if (alreadyReferences) {
				html = html.replace(inlineScriptRegex, '');
			} else {
				let replacedFirst = false;
				html = html.replace(inlineScriptRegex, (m) => {
					if (!replacedFirst) {
						replacedFirst = true;
						return `<script src="script.js"></script>`;
					}
					return '';
				});
			}

			// Guardar cambios en el HTML
			fs.writeFileSync(file, html, 'utf8');
			console.log(`Actualizado HTML: ${file}`);
		});

		if (appendedAny) {
			console.log('Externalización completada. Archivos procesados:', appendedBlocks.length);
		} else {
			console.log('No se anexó código. Posiblemente ya estaba externalizado.');
		}
	}

	// Si se ejecuta directamente (node script.js) ejecutamos con defaults
	if (require.main === module) {
		try {
			externalizeHtmlScripts({ rootDir: path.resolve(__dirname) });
		} catch (err) {
			console.error('Error al externalizar scripts:', err);
			process.exitCode = 1;
		}
	}

	// Export para uso programático
	module.exports = { externalizeHtmlScripts };
}