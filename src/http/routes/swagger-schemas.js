/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         name:
 *           type: string
 *           description: The name of the user.
 *         email:
 *           type: string
 *           description: The user's email.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the user was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the user's data was updated.
 *       example:
 *         public_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         id: 1
 *         name: Greg
 *         email: greg@gmail.com
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnitType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         name:
 *           type: string
 *           description: The name of the unit type.
 *         description:
 *           type: string
 *           description: The description of the unit type.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the unit type was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the unit type's data was updated.
 *       example:
 *         public_id: fcc1a117-589d-4e24-a6d9-9f6a8910766d
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         name: kg
 *         description: Kilogram
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         name:
 *           type: string
 *           description: The name of the product type.
 *         description:
 *           type: string
 *           description: The description of the product type.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the product type was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the product type's data was updated.
 *       example:
 *         public_id: 1f8e25a4-d315-4c05-a120-6510285f3e22
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         name: Fruit
 *         description: Various fruits
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         name:
 *           type: string
 *           description: The name of the brand.
 *         description:
 *           type: string
 *           description: The description of the brand.
 *         image:
 *           type: string
 *           description: The URL of the brand's image.
 *         image_original_name:
 *           type: string
 *           description: The original name of the brand's image.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the brand was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the brand's data was updated.
 *       example:
 *         public_id: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         name: Coca-Cola
 *         description: Soft drink company
 *         image: http://example.com/coca-cola.jpg
 *         image_original_name: coca-cola.jpg
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - product_type_id
 *         - unit_type_id
 *         - min_quantity
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         name:
 *           type: string
 *           description: The name of the product.
 *         description:
 *           type: string
 *           description: The description of the product.
 *         product_type_id:
 *           type: string
 *           description: The Id of the product type.
 *         unit_type_id:
 *           type: string
 *           description: The Id of the unit type.
 *         min_quantity:
 *           type: number
 *           description: The minimum quantity of the product.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the product was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the product's data was updated.
 *       example:
 *         public_id: 5ae3fb4f-3c5f-45f7-b18c-6d8edbdd8f6b
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         name: Apple
 *         description: Red apple
 *         product_type_id: 1f8e25a4-d315-4c05-a120-6510285f3e22
 *         unit_type_id: fcc1a117-589d-4e24-a6d9-9f6a8910766d
 *         min_quantity: 1
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       required:
 *         - brand_id
 *         - product_id
 *         - image
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         brand_id:
 *           type: string
 *           description: The Id of the brand.
 *         product_id:
 *           type: string
 *           description: The Id of the product.
 *         image:
 *           type: string
 *           description: The URL of the product image.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the product image was created.
 *       example:
 *         public_id: e6e43e9a-d3b2-4e0c-b525-2b139cb265e4
 *         id: 1
 *         brand_id: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *         product_id: 5ae3fb4f-3c5f-45f7-b18c-6d8edbdd8f6b
 *         image: http://example.com/apple.jpg
 *         created_at: 2024-06-05T20:18:23.119Z
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductPriceLog:
 *       type: object
 *       required:
 *         - brand_id
 *         - product_id
 *         - price
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         brand_id:
 *           type: string
 *           description: The Id of the brand.
 *         product_id:
 *           type: string
 *           description: The Id of the product.
 *         price:
 *           type: number
 *           description: The price of the product.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the price log was created.
 *       example:
 *         public_id: 3c11d304-1b21-4a13-8a5e-ec2dbcd56a5a
 *         id: 1
 *         brand_id: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *         product_id: 5ae3fb4f-3c5f-45f7-b18c-6d8edbdd8f6b
 *         price: 2.50
 *         created_at: 2024-06-05T20:18:23.119Z
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Storage:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the storage was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the storage's data was updated.
 *       example:
 *         public_id: a0130389-4a24-49e8-8d36-165f79948231
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShoppingList:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         user_id:
 *           type: string
 *           description: The Id of the user.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the shopping list was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the shopping list's data was updated.
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: The date the shopping list was completed.
 *       example:
 *         public_id: 0f5b860d-8b3d-4dcd-bb6b-9f9c994a42a5
 *         id: 1
 *         user_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 *         completed_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StorageProduct:
 *       type: object
 *       required:
 *         - storage_id
 *         - product_id
 *         - quantity
 *         - status
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         storage_id:
 *           type: string
 *           description: The Id of the storage.
 *         product_id:
 *           type: string
 *           description: The Id of the product.
 *         brand_id:
 *           type: string
 *           description: The Id of the brand.
 *         quantity:
 *           type: number
 *           description: The quantity of the product in the storage.
 *         status:
 *           type: string
 *           description: The status of the product in the storage.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the storage product was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the storage product's data was updated.
 *       example:
 *         public_id: c93ad66a-9462-4322-b7c8-953863a1e1e8
 *         id: 1
 *         storage_id: a0130389-4a24-49e8-8d36-165f79948231
 *         product_id: 5ae3fb4f-3c5f-45f7-b18c-6d8edbdd8f6b
 *         brand_id: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *         quantity: 10
 *         status: available
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShoppingListProduct:
 *       type: object
 *       required:
 *         - shopping_list_id
 *         - product_id
 *         - quantity_bought
 *       properties:
 *         public_id:
 *           type: string
 *           description: The Id used in public networks (uuid).
 *         id:
 *           type: number
 *           description: The Id used for pagination and sorting.
 *         shopping_list_id:
 *           type: string
 *           description: The Id of the shopping list.
 *         product_id:
 *           type: string
 *           description: The Id of the product.
 *         brand_id:
 *           type: string
 *           description: The Id of the brand.
 *         quantity_bought:
 *           type: number
 *           description: The quantity of the product bought.
 *         price_paid_per_item:
 *           type: number
 *           description: The price paid per item of the product.
 *         total_price_paid:
 *           type: number
 *           description: The total price paid for the product.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the shopping list product was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the shopping list product's data was updated.
 *       example:
 *         public_id: 76262e7e-8012-41e4-b889-1f3fc18613ff
 *         id: 1
 *         shopping_list_id: 0f5b860d-8b3d-4dcd-bb6b-9f9c994a42a5
 *         product_id: 5ae3fb4f-3c5f-45f7-b18c-6d8edbdd8f6b
 *         brand_id: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *         quantity_bought: 2
 *         price_paid_per_item: 1.25
 *         total_price_paid: 2.50
 *         created_at: 2024-06-05T20:18:23.119Z
 *         updated_at: "null"
 */
