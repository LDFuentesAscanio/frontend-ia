import { NextResponse } from 'next/server';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export async function POST(req: Request) {
  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return NextResponse.json(
        { reply: 'Método no permitido' },
        { status: 405 }
      );
    }

    // Parsear el cuerpo de la solicitud
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Mensaje inválido o vacío' },
        { status: 400 }
      );
    }

    // Verificar que la URL del backend esté configurada
    if (!process.env.BACKEND_URL) {
      console.error('BACKEND_URL no está configurada');
      return NextResponse.json(
        { reply: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Hacer la petición al backend
    const searchUrl = `${
      process.env.BACKEND_URL
    }/products?q=${encodeURIComponent(message)}`;
    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error al buscar productos:', errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const products = (await res.json()) as Product[];

    // Formatear respuesta
    const reply =
      products.length > 0
        ? `Encontré ${products.length} producto(s): ${products
            .map((p) => p.name)
            .join(', ')}`
        : 'No encontré productos que coincidan con tu búsqueda.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('❌ Error en el API route:', err);
    return NextResponse.json(
      { reply: 'Lo siento, ocurrió un error al procesar tu solicitud.' },
      { status: 500 }
    );
  }
}
