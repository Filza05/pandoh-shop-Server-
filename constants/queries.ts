export const FETCH_PRODUCTS_QUERY = `
SELECT
  products.productid,
  products.productname,
  products.price,
  products.description,
  products.instock,
  products.category,
  JSON_ARRAYAGG(JSON_OBJECT('id', product_images.imageid, 'image_url', product_images.imageURL)) AS images
FROM
  products
LEFT JOIN
  product_images ON products.productid = product_images.product_id
GROUP BY
  products.productid;`;
