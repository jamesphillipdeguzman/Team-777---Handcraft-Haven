import { sql } from "./db";

export async function getProducts() {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.price,
      p.description,
      pi.image_url,
      c.name AS category
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN categories c ON c.id = pc.category_id
  `;
  return result;
}


