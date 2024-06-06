import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { queryDatabase } from "../../utils/query.js";

const deleteStorage = Router();

/**
 * @swagger
 * /api/v1/storages/{publicId}:
 *   delete:
 *     summary: Delete a storage
 *     description: Deletes a storage owned by the authenticated user if it is empty.
 *     tags: [Storages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The public ID of the storage to be deleted.
 *     responses:
 *       200:
 *         description: Storage successfully deleted.
 *       400:
 *         description: Cannot delete storage -> products found inside.
 *       404:
 *         description: Storage not found.
 *       default:
 *         description: Error processing the request.
 */

deleteStorage.delete(
  "/api/v1/storages/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { userId } = await cookieSchema.validate(request.cookies);

      const doesStorageExists = await queryDatabase(
        "SELECT * FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!doesStorageExists[0])
        return response.status(404).send({ messsage: "Storage not found." });

      const productsInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1",
        [publicId],
      );

      if (productsInStorage.length > 0)
        return response.status(400).send({
          message: `You cannot delete this storage: ${productsInStorage.length} products found.`,
        });

      await queryDatabase(
        "DELETE FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteStorage };