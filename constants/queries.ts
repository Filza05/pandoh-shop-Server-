import { Address } from "../types/DBTypes";

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
    (
        SELECT 
            JSON_OBJECT(
                'user_addressid', ua.user_addressid,
                'address', ua.address,
                'city', ua.city,
                'state', ua.state,
                'zip_code', ua.zip_code,
                'phone_number', ua.phone_number,
                'country', ua.country
            )
        FROM 
            user_addresses ua
        WHERE 
            ua.user_addressid = o.address
    ) AS address_info,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'product_id', oi.productid,
            'quantity', oi.quantity,
            'product_name', p.productname,
            'description', p.description,
            'price', p.price,
            'category', p.category,
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
    users u ON o.userid = u.userid
GROUP BY 
    o.orderid, u.username, u.email, o.order_date, o.total_price, o.status, o.address;
`;

export const generateInsertAddressQuery = (
  addressData: Address,
  userid: number
) => {
  return `INSERT INTO pandoh_shop.user_addresses (user_id, address, city, state, zip_code, phone_number, country)
     VALUES (
    ${userid},
    '${addressData.address}',
    '${addressData.city}',
    '${addressData.state}', 
    ${addressData.zip_code},
    '${addressData.phone_number}',
    '${addressData.country}') 
    ON DUPLICATE KEY UPDATE 
    address = VALUES(address),
    city = VALUES(city),
    state = VALUES(state),
    zip_code = VALUES(zip_code),
    phone_number = VALUES(phone_number),
    country = VALUES(country);`;
};
