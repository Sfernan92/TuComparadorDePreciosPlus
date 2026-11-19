# 💰 DonTacaño.com — Comparador de precios

<p align="center">
  <strong>Proyecto en construcción · Desarrollo Full Stack · DonTacaño.com</strong>
</p>

<p align="center">
  DonTacaño.com es una aplicación web para crear una cesta de compra y comparar sus precios entre distintos supermercados. Su objetivo es ayudar al usuario a identificar la opción más económica antes de realizar la compra.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/estado-en%20construcci%C3%B3n-f59e0b?style=for-the-badge" alt="Proyecto en construcción">
  <img src="https://img.shields.io/badge/desarrollo-individual-2563eb?style=for-the-badge" alt="Desarrollo individual">
</p>

## 🧠 Idea principal

El usuario busca los productos que necesita y los añade a una lista temporal. A partir de esa selección, la aplicación calcula automáticamente:

- El precio de cada producto en los supermercados disponibles.
- El supermercado más barato para cada producto.
- El coste de la cesta agrupado por categorías.
- El supermercado más económico para realizar la compra completa.
- El ahorro posible frente a las opciones más caras.

La información se administra desde un panel privado donde se pueden gestionar categorías, supermercados, productos y precios.

## 🎯 Objetivo

Facilitar una comparación clara de precios entre supermercados para ayudar a tomar decisiones de compra más económicas y ahorrar tiempo en la búsqueda de ofertas.

## 🚀 Novedades incorporadas

El proyecto ha evolucionado respecto a su primera versión. Además de renovar la organización y el diseño del frontend, se han incorporado nuevas funcionalidades para mejorar la experiencia de comparación.

## 🚀 Funcionalidades actuales

### 🔎 Búsqueda y cesta

- Búsqueda por nombre sin distinguir mayúsculas, tildes ni diéresis.
- Selección de productos para crear una cesta temporal sin duplicados.

> ℹ️ La cesta se reinicia al recargar el navegador.

### 🏷️ Comparativas

- **Por productos:** muestra todos los precios y destaca la opción más barata.
- **Por categorías:** agrupa los productos, calcula sus totales y el ahorro posible.
- **Por supermercados:** compara el coste total de la cesta y muestra un podio de ahorro.

### ⚙️ Administración

Panel privado para consultar un resumen y gestionar categorías, supermercados, productos y precios. Permite añadir, editar y eliminar registros, incluyendo precios decimales.

### 🔐 Inicio de sesión

- Acceso protegido al panel de administración.
- Sesión guardada en el navegador hasta cerrar sesión.
- Navegación adaptada según el estado de la sesión.

> ⚠️ La autenticación actual es solo para desarrollo y debe reforzarse antes de publicar la aplicación.
## 🧩 Tecnologías

- Frontend: Angular 19, TypeScript, RxJS y Tailwind CSS.
- Backend: PHP 8.1+ con Symfony 6.4.
- Persistencia: Doctrine ORM.
- Base de datos: PostgreSQL 13.
- Contenedores: Docker Compose.
- Gestión visual de la base de datos: DBeaver.

### 🎨 Frontend

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-EB2C5C?logo=reactivex&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

### ⚙️ Backend

![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php&logoColor=white)
![Symfony](https://img.shields.io/badge/Symfony-6.4-000000?logo=symfony&logoColor=white)
![Doctrine](https://img.shields.io/badge/Doctrine_ORM-FC6A31?logo=doctrine&logoColor=white)

### 🗄️ Datos, servicios e infraestructura

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-4169E1?logo=postgresql&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)
![DBeaver](https://img.shields.io/badge/DBeaver-382923?logo=dbeaver&logoColor=white)

## 🎨 Estado del frontend

El frontend se encuentra actualmente en proceso de diseño y mejora visual.

La estructura principal, las vistas públicas, el comparador, la navegación, el inicio de sesión y el panel de administración ya están implementados y funcionales. Sin embargo, algunos estilos, componentes visuales y detalles de experiencia de usuario continúan en evolución.

## 🐳 Clonar y Levantar Contenedores en Docker.

### 📦 Clonar el Repositorio.

1. **Clave HTTPS.**

```
git clone https://github.com/Sfernan92/TuComparadorDePreciosPlus.git
```

2. **Clave SSH.**

```
git@github.com:Sfernan92/TuComparadorDePreciosPlus.git
```

### 🆙 Levantar los contenedores de Docker.

```
docker compose up
```

## 🌐 Direcciones locales

Una vez levantados los servicios:

- Frontend Angular: `http://localhost:4200`
- Backend Symfony: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## 🔮 Mejoras futuras

- Persistir la cesta de compra entre recargas.
- Añadir filtros reales por categoría, marca y supermercado.
- Implementar registro de usuarios.
- Sustituir la autenticación de desarrollo por JWT seguro.
- Proteger también los endpoints del backend.
- Añadir historial de precios.
- Mostrar gráficas de evolución de precios.
- Incorporar pruebas unitarias y de integración.
- Mejorar la adaptación a dispositivos móviles.

---

<p align="center">
  <strong>Proyecto en producción y desarrollo continuo. 💰</strong>
</p>
