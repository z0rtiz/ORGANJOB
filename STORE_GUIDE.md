# Guía para Publicar OrganJob en la Microsoft Store

Esta guía te explica paso a paso cómo empaquetar y subir **OrganJob** a la **Microsoft Store**.

---

## 1. Requisitos Previos

1. **Cuenta de Desarrollador de Microsoft (Partner Center)**:
   - Ingresa a [https://partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard).
   - Inicia sesión con tu cuenta de Microsoft y completa el registro de desarrollador individual (tiene un pago único de aprox. $19 USD para toda la vida).
2. **Reservar el nombre de la app**:
   - En el panel de Partner Center, ve a **Windows & Xbox** > **Overview** > **Create a new app**.
   - Ingresa el nombre `OrganJob` (o el nombre público que elijas) y resérvalo.

---

## 2. Obtener las credenciales de identidad de tu App

Una vez reservada la aplicación en Microsoft Partner Center:
1. Ve a la sección **App management** > **App identity**.
2. Copia los siguientes tres valores:
   - **Package/Identity/Name** (ej: `12345YourName.OrganJob`)
   - **Package/Identity/Publisher** (ej: `CN=ABC12345-6789-ABCD-EF01-23456789ABCD`)
   - **Publisher display name** (ej: `Tu Nombre o Empresa`)

3. Abre el archivo [package.json](file:///e:/DESARROLLO/ORGANJOB/package.json) y actualiza la sección `appx`:
```json
"appx": {
  "identityName": "TU_IDENTITY_NAME_DE_MICROSOFT",
  "publisher": "CN=TU_PUBLISHER_ID_DE_MICROSOFT",
  "publisherDisplayName": "Tu Nombre de Desarrollador",
  "displayName": "OrganJob Pro",
  "backgroundColor": "#18191c"
}
```

---

## 3. Generar el paquete para la Store

Ejecuta en tu terminal PowerShell:
```powershell
npm run package:store
```

`electron-builder` compilará la aplicación y creará un archivo `.appx` o `.msix` firmado listo para subir en la carpeta:
```
e:\DESARROLLO\ORGANJOB\release\OrganJob 1.0.0.appx
```

---

## 4. Crear la entrega en Microsoft Partner Center

1. En la ficha de tu app en Partner Center, haz clic en **Start your submission**.
2. **Pricing and availability**: Selecciona gratuito o el precio que desees, y los países donde estará disponible.
3. **Properties**: Selecciona la categoría (ej: *Productivity*).
4. **Age ratings**: Responde el cuestionario estándar de clasificación de edad.
5. **Packages**: Arrastra y suelta el archivo `.appx` generado en el paso 3.
6. **Store listings**:
   - Agrega la descripción de la app, características clave y capturas de pantalla (puedes tomar capturas de la app corriendo en modo oscuro y claro).
7. Haz clic en **Submit to the Store**.

El proceso de certificación de Microsoft tarda normalmente entre 24 y 48 horas. Una vez aprobado, tu aplicación estará disponible para cualquier usuario de Windows 10 y Windows 11 en la tienda oficial.
