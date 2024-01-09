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

export const FETCH_ALL_ORDERS_QUERY = `
SELECT 
    o.orderid,
    u.username,
    u.email,
    o.order_date,
    o.total_price,
    o.status,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'product_id', oi.productid,
            'quantity', oi.quantity,
            'product_name', p.productname,
            'description', p.description,
            'price', p.price,
            'images', (
                SELECT 
                    JSON_ARRAYAGG(imageURL)
                FROM 
                    product_images pi
                WHERE 
                    pi.product_id = p.productid
                GROUP BY 
                    pi.product_id
            )
        )
    ) AS order_items
FROM 
    orders o
JOIN 
    order_items oi ON o.orderid = oi.orderid
JOIN 
    products p ON oi.productid = p.productid
JOIN 
    users u ON o.userid = u.userid  -- Join with users table to get username and email
GROUP BY 
    o.orderid, u.username, u.email, o.order_date, o.total_price, o.status

`;
