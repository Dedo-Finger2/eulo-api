/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - name
 *        - email
 *      properties:
 *        public_id:
 *          type: string
 *          description: The Id used in public networks (uuid).
 *        id:
 *          type: number
 *          description: The Id used for pagination and sorting.
 *        name:
 *          type: string
 *          description: The name of the user.
 *        email:
 *          type: string
 *          description: The user's email.
 *        created_at:
 *          type: string
 *          format: date-time
 *          description: The date the user was created.
 *        updated_at:
 *          type: string
 *          format: date-time
 *          description: The date the user's data was updated.
 *      example:
 *        public_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *        id: 1
 *        name: Greg
 *        email: greg@gmail.com
 *        created_at: 2024-06-05T20:18:23.119Z
 *        updated_at: "null"
 */
