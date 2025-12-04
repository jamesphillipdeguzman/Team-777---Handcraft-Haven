import { sql } from "./db";

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  category: string | null;
};

export async function getProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.price,
      p.description,
      COALESCE(
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY created_at ASC LIMIT 1),
        NULL
      ) AS image_url,
      (SELECT c.name FROM product_categories pc 
       JOIN categories c ON c.id = pc.category_id 
       WHERE pc.product_id = p.id 
       LIMIT 1) AS category
    FROM products p
    ORDER BY p.id
  `;
  return result as Product[];
}



export async function findProducts(query:string): Promise<Product[]> {
    const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.price,
      p.description,
      COALESCE(
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY created_at ASC LIMIT 1),
        NULL
      ) AS image_url,
      (SELECT c.name FROM product_categories pc 
       JOIN categories c ON c.id = pc.category_id 
       WHERE pc.product_id = p.id 
       LIMIT 1) AS category
    FROM products p 
    WHERE p.name ILIKE ${'%' + query + '%'}
    OR p.description ILIKE ${'%' + query + '%'}
    ORDER BY p.id
  `;
    return result as Product[];
  }


