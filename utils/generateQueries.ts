export const generateGetUserOrderQuery = (userId: number): string => {
  return `SELECT 
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
WHERE
    o.userid = ${userId}
GROUP BY 
    o.orderid, u.username, u.email, o.order_date, o.total_price, o.status;
`;
};

export const generateFetchReviewsQuery = (productid: string) => {
  return `SELECT
    ur.review_id,
    ur.review,
    ur.rating,
    u.username,
    u.email AS user_email
FROM
    user_reviews ur
JOIN
    users u ON ur.user_id = u.userid
WHERE
    ur.product_id=${productid};`;
};

export const generateInsertInCurrentAddressQuery = (
  addressId: number,
  userId: number
) => {
  return `INSERT INTO current_user_address (user_id, user_address_id)
    VALUES (${userId}, ${addressId})
    ON DUPLICATE KEY UPDATE user_address_id = ${addressId}`;
};

export const generateCurrentAddressQuery = (userId: number) => {
  return `SELECT current_user_address.user_id, user_addresses.*
    FROM current_user_address
    JOIN user_addresses ON current_user_address.user_address_id = user_addresses.user_addressid
    WHERE current_user_address.user_id = ${userId};`;
};
