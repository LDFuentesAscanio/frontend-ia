// app/api/chat/route.ts
import { NextResponse } from 'next/server';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/products?q=${encodeURIComponent(message)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!res.ok) throw new Error('No se pudo obtener productos');

    const products = (await res.json()) as Product[];

    const reply =
      products.length > 0
        ? `Encontré ${products.length} productos: ${products
            .map((p) => p.name)
            .join(', ')}`
        : 'No encontré productos que coincidan.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('❌ Error en el API route:', err);
    return NextResponse.json(
      { reply: '❌ Error al consultar los productos.' },
      { status: 500 }
    );
  }
}
