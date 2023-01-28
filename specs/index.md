# PStore

Tengo la duda de si es mejor hacer una clase o buscar la forma de permitir que los tipados se guarden en pStore y no sea necesario andar casteando tipados raros.

Se podrá registrar stores en un índice para acceder a los tipados o crear un store en el momento.

Al crear un store en el momento, se obtendrá un dispatcher y un selector.

Las stores del índice serán accedidas mediante un dispatcher y un selector (esto es para React) por defecto.

La forma de enterarse de los cambios en el store será utilizando suscripción a eventos, en caso de estar dentro de React, se accederá directamente desde un hook selector.