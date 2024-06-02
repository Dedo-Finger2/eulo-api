import fs from "node:fs";

const globalStoragePath = "src/storage";

export function handleImageRenaming({ path, originalname }) {
  let newPath = path.split("/");
  newPath[2] = originalname;
  newPath = newPath.join("/");

  if (fs.existsSync(newPath)) {
    const [name, extension] = originalname.split(".");

    const files = fs.readdirSync(globalStoragePath);
    const numberOfFilesWithSameName = files.filter((file) =>
      file.includes(name),
    ).length;

    newPath = newPath.split("/");
    newPath[2] = name + `(${numberOfFilesWithSameName}).${extension}`;
    newPath = newPath.join("/");
  }

  fs.rename(path, newPath, function (error) {
    if (error) throw new Error("Failed to rename image path: ", error);
  });

  return {
    image: newPath,
    imageOriginalName: newPath.split("/")[2],
  };
}
